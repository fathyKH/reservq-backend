import {
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    
} from "@paypal/paypal-server-sdk";import dotenv from 'dotenv';
import exp from "constants";

dotenv.config();

const paypal = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID as string,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET as string,
    },
    environment: Environment.Sandbox,
    /* logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    }, */
});

export default paypal;