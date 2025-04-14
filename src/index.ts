import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/dbConnection";
import productRoute from "./routes/productRoute";
import blogRoute from "./routes/blogRoute";
import authRoute from "./routes/authRoute";
import orderRoute from "./routes/orderRoute";
import authMiddleware from "./middlewares/authMiddleware";
import salesRoute from "./routes/salesRoute";
import categoryRoute from "./routes/categoryRoute";
import discountRoute from "./routes/discountRoute";
import scheduleUpdateMaterializedView from "./jobs/updateMaterializedView";
import customerRoute from "./routes/customerRoute";
import profileRoute from "./routes/profileRoute";
import commentRoute from "./routes/commentRoute";
import reviewRoute from "./routes/reviewRoute";
import reservationRoute from "./routes/reservationRoute";
import webhooksRoute from "./routes/webhooksRoute";
import swaggerUi from 'swagger-ui-express';
import swaggerDocument  from '../openapi.json';

dotenv.config();
connectDB();

const app = express();
app.use(cors());

app.use("/api/v1", webhooksRoute);

app.use(express.json());

scheduleUpdateMaterializedView();

app.use("/api/v1", authMiddleware);
app.use("/api/v1", reviewRoute);
app.use("/api/v1", customerRoute);
app.use("/api/v1", reservationRoute);
app.use("/api/v1", commentRoute);
app.use("/api/v1", profileRoute);
app.use("/api/v1", productRoute);
app.use("/api/v1", blogRoute);
app.use("/api/v1", authRoute);
app.use('/api/v1', orderRoute);
app.use('/api/v1', discountRoute);
app.use('/api/v1', categoryRoute);
app.use('/api/v1', salesRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
