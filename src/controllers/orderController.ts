import e, { Request, Response } from "express";
import Order from "../models/orderModel";
import { AuthRequest } from "../middlewares/authMiddleware";
import { InsufficientQuantityError, ProductNotFoundError, ApplicationError, PaypalApiError } from "../utils/Exceptions";
import Product from "../models/productModel";
import Discount from "../models/discountModel";
import paypal from "../config/paypal";
import mongoose from "mongoose";
import {
  OrdersController,
  PaymentsController,
  PaypalExperienceLandingPage,
  PaypalExperienceUserAction,
  PayeePaymentMethodPreference,
  ShippingPreference,
  CheckoutPaymentIntent,
  ApiError
} from "@paypal/paypal-server-sdk";

interface OrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  discount?: number;
  quantity: number;
}

const paypalOrderCheckout = new OrdersController(paypal);
const createPaypalOrder = async (orderItems: OrderItem[],itemTotal: number,shippingFee: number) => {
    try{
          const {body,...httpResponse} = await paypalOrderCheckout.createOrder({
              body : {
                intent: CheckoutPaymentIntent.Capture,
                paymentSource: {
                  paypal: {
                    experienceContext: {
                      paymentMethodPreference: PayeePaymentMethodPreference.ImmediatePaymentRequired,
                      landingPage: PaypalExperienceLandingPage.Login,
                      userAction: PaypalExperienceUserAction.PayNow,
                      returnUrl: "http://localhost:3000/payment-capture",
                      cancelUrl: "http://localhost:3000/payment-cancel"
                      }
                    }
                 },
                purchaseUnits: [{
                  amount: {
                      value: (itemTotal+shippingFee).toFixed(2).toString(),
                      currencyCode: "USD",
                      breakdown: {
                          itemTotal: {
                              value: itemTotal.toString(),
                              currencyCode: "USD"
                          },
                          shipping: {
                              value: shippingFee.toString(),
                              currencyCode: "USD"
                          }
                      }
                  },
                   items:  orderItems.map(item => ({
                      name: item.name,
                      description: item.name,
                      quantity: item.quantity.toString(),
                      unitAmount: {
                          value: ((item.price*(1-item.discount/100))).toString(),
                          currencyCode: "USD"
                      },
                      sku: item.productId.toString()
                  })) 
                }]
              },
              prefer: "return=minimal",
          });
          return httpResponse.result;
    }catch (error) {
        throw new PaypalApiError(error.message);
    }
}  

const CapturePaypalOrder = async (paymentId: string) => {
    try{
          const {body,...httpResponse} = await paypalOrderCheckout.captureOrder({
              id : paymentId,
              prefer: "return=minimal"
          });
          return httpResponse.result;
    }catch (error) {
        console.log("error is : ",error)  
        throw new PaypalApiError(error.message);
      
    }
}

export const captureOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { paymentId } = req.body;
        const captureOrder = await CapturePaypalOrder(paymentId as string);
        res.status(200).json(captureOrder);
        return
    } catch (error) {
        res.status(500).json({ message: error.message });
        return
    }
}
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Find the order by ID from the request parameters
        const order = await Order.findById(req.params.id);

        // Check if the order exists
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        // Ensure that the user is authenticated and either is an admin or owns the order
        if (!req.user || (req.user.role !== "admin" && order.userId.toString() !== req.user.id)) {
            res.status(401).json({ message: "You are not authorized to view this order" });
            return;
        }

        // If all checks pass, return the order
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin" ) {
             res.status(401).json({ message: "You are not authorized to view all orders" });
             return
        }
        const orders = await Order.find();
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getAllUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ message: "You are not authorized to view your orders" });
        return;
    }
    try {
        const orders = await Order.find({ userId: req.user.id });
        res.status(200).json(orders);
        return
    } catch (error) {
        res.status(500).json({ message: "error getting user orders" });
}
};
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (!req.user) {
        res.status(401).json({ message: "You are not authorized to create an order" });
        return;
      }
      const { products,discountCode, paymentMethod, address, deliveryType } = req.body;
      if (!products || !paymentMethod || !address || !deliveryType) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }
      if (deliveryType !== "delivery" && deliveryType !== "pickup" && deliveryType !== "in-restaurant") {
        res.status(400).json({ message: "Invalid delivery type" });
        return;
      }

      let itemTotal = 0
      let shippingFee = 0
      
      if (deliveryType === "delivery" ) {
        shippingFee += 3; // delivery fee
      }
      
      // Build a snapshot of ordered products for the order document
      const orderProducts: OrderItem[] = [];

      
      for (let item of products) {
        // Find the product using the productId provided in the snapshot request
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new ProductNotFoundError("Product does not exist");
        }
        if (product.quantity < item.quantity) {
          throw new InsufficientQuantityError(`Insufficient quantity for product ${product.name}`);
        }
        
        itemTotal += (product.price*(1-product.discount/100)) * item.quantity;
        // Deduct the ordered quantity from product inventory
        product.quantity -= item.quantity;

        if (product.quantity === 0) {
          product.status = "out of stock";
        }
        
        await product.save({ session });
        
        // Create a snapshot of the product details at the time of order
        orderProducts.push({
          productId: product._id as mongoose.Types.ObjectId,
          name: product.name,
          price: product.price,
          discount: product.discount,
          quantity: item.quantity
        });
      }
      let discountAmount = 0;
      if (discountCode) {
        const discount = await Discount.findOne({ code: discountCode, active: true });
        if (!discount) {
            throw new ApplicationError("Invalid discount code", 400);
        }
        const now = new Date();
        if (now < discount.validFrom || now > discount.validTo) {
            throw new ApplicationError("Discount code expired or not yet active", 400);
        }
        discountAmount = (itemTotal * discount.discountPercentage) / 100;
        }

        // Adjust total based on discount amount
      let total = (shippingFee+itemTotal) - discountAmount;
      if (total < 0) total = 0; // Ensure total is not negative
     
      // paymment using paypal
      if (paymentMethod === "paypal") {
        const paypalOrder = await createPaypalOrder(orderProducts,itemTotal,shippingFee);
        res.status(200).json(paypalOrder);
        return;
      }
      // Create the order document using the product snapshots
      const order = new Order({
        userId: req.user.id,
        products: orderProducts,
        total,
        date: new Date().toISOString(),
        paymentMethod,
        deliveryType,
        address
      });
      
      await order.save({ session });
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

    } catch (error: any) {
      // Abort transaction to rollback any changes made to product quantities
      await session.abortTransaction();
      session.endSession();
      
      if (error instanceof ApplicationError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
      }
      res.status(400).json({ message: "Error creating order" });
    }
  };

export const updateOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin" ) {
            res.status(401).json({ message: "You are not authorized to update this order" });
            return
        }

        if (Object.keys(req.body).length !== ['status', 'paymentStatus'].filter(key => req.body.hasOwnProperty(key)).length) {
          res.status(400).send({ error: 'Only status and paymentStatus can be updated' });
          return
        }        
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (order) {
            res.status(200).json({ message: "Order updated successfully" });
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}
  
export const deleteOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin"  ) {
            res.status(401).json({ message: "You are not authorized to delete this order" });
            return
        }

        const order = await Order.findByIdAndDelete({_id:req.params.id,'userId':req.user.id});
        if (order) {
            res.status(200).json({ message: "Order deleted successfully" });
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};