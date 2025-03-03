import Order from "../models/orderModel";
import Product from "../models/productModel";
import cron from "node-cron";
const updateMaterializedView = async () => {

    console.log("Start updating materialized view");
    try {
        // Update the materialized view
        const salesByWeekday = await Order.aggregate([
            {
                $group: {
                  _id: { $dayOfWeek: "$date" },
                  totalSales: { $sum: "$total" },
                  orderCount: { $sum: 1 }
                }
              },
              { $sort: { "_id": 1 } },
              { $out: "materializedSalesByWeekday" } // Writes the results to this collection
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
                    ]);
        
        
                
            } catch (error:any) {
                console.log(error);
            }
    
};

const scheduleUpdateMaterializedView = () => {
    // Schedule the updateMaterializedView function to run every 10 minutes
    cron.schedule("*/10 * * * *", updateMaterializedView);
  };

export default scheduleUpdateMaterializedView;
