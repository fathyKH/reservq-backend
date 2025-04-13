import express from "express";
import { Request, Response } from "express";
import Order from "../models/orderModel";
import stripe from "../config/stripe";

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'];
  
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      res.sendStatus(400);
      return
    }
  
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      // for production suggested implement error checking and logging failed payment
      const order = await Order.findById(orderId);
      if (!order) {
        console.log(`Order ${orderId} not found.`);
      }
  
      order.paymentId = paymentIntent.id;
      order.paymentStatus = "paid";
      await order.save();
  
      console.log(`Order ${orderId} has been marked as paid.`);
    }
  
    res.status(200).json({received: true});
    return
  }