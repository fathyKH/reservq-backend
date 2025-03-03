import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/dbConnection";
import productRoute from "./routes/productRoute";
import blogRoute from "./routes/blogRoute";
import userRoute from "./routes/userRoute";
import orderRoute from "./routes/orderRoute";
import authMiddleware from "./middlewares/authMiddleware";
import salesRoute from "./routes/salesRoute";
import categoryRoute from "./routes/categoryRoute";
import discountRoute from "./routes/discountRoute";
import scheduleUpdateMaterializedView from "./jobs/updateMaterializedView";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument  from '../openapi.json';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

scheduleUpdateMaterializedView();

app.use("/api/v1", authMiddleware);

app.use("/api/v1", productRoute);
app.use("/api/v1", blogRoute);
app.use("/api/v1", userRoute);
app.use('/api/v1', orderRoute);
app.use('/api/v1', discountRoute);
app.use('/api/v1', categoryRoute);
app.use('/api/v1', salesRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
