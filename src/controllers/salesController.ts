import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import Order from "../models/orderModel";
import Product from "../models/productModel";
import { MaterializedOverallStats, MaterializedSalesByWeekday, MaterializedTotalProducts } from "../models/salesModel";

export const getReports = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || req.user.role !== "admin") {
            res.status(401).json({ message: "You are not authorized to view sales" });
            return
        }

      /*   const salesByWeekday = await Order.aggregate([
            {
                $group: {
                  _id: { $dayOfWeek: "$date" },
                  totalSales: { $sum: "$total" },
                  orderCount: { $sum: 1 }
                }
              },
              { $sort: { "_id": 1 } },
              { $out: "MaterializedSales" } // Writes the results to this collection
            ]); 
             // Total products sold: sum up quantities from each order's products array
             const productStats = await Order.aggregate([
                { $unwind: "$products" }, // Unwind the products array means expand each product object into its own document
                {
                $group: {
                    _id: null,
                    totalProductsSold: { $sum: "$products.quantity" }
                }
                }
            ]); 
        
        const totalProducts = await Product.aggregate([
            {
                $group: {
                  _id: null,
                  totalProducts: { $sum: "$quantity" },
                }
              },
              { $sort: { "_id": 1 } },
              { $out: "materializedTotalProducts" } // Writes the results to this collection
            ]);

        
        const overallStats = await Order.aggregate([
            {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$total" },
                  orderCount: { $sum: 1 }
                }
              },
              { $sort: { "_id": 1 } },
              { $out: "materializedOverallStats" } // Writes the results to this collection
            ]); */ 

          const totalProducts = await MaterializedTotalProducts.findOne();
          const overallStats = await MaterializedOverallStats.findOne();
          const salesByWeekday = await MaterializedSalesByWeekday.find();
        if ( !salesByWeekday || !totalProducts || !overallStats) {
                res.status(404).json({ message: "error getting report data" });
                return
            }
        res.status(200).json({salesByWeekday:salesByWeekday,TotalProducts:totalProducts,overallStats:overallStats});
    } catch (error:any) {
        res.status(500).json({ message: error.message });
    }
}