import mongoose, { Schema, model, Document } from "mongoose";

// Generic interface for materialized views
interface IMaterialized extends Document {
  [key: string]: any; // Allows dynamic fields
}

// Define schemas with `strict: false` to accept arbitrary fields
const MaterializedSalesSchema = new Schema<IMaterialized>(
  {},
  { strict: false, collection: "materializedSalesByWeekday", timestamps: true }
);

const MaterializedTotalProductsSchema = new Schema<IMaterialized>(
  {},
  { strict: false, collection: "materializedTotalProducts", timestamps: true }
);

const MaterializedOverallStatsSchema = new Schema<IMaterialized>(
  {},
  { strict: false, collection: "materializedOverallStats", timestamps: true }
);

// Add a `toJSON` transform for clean output
const addToJsonTransform = (schema: Schema) => {
  schema.set("toJSON", {
    transform: (_doc, ret) => {
      ret.id = ret._id; // Convert _id to id
      delete ret._id; // Remove _id
      delete ret.__v; // Remove Mongoose version key
      return ret;
    },
  });
};

// Apply transformation to all schemas
addToJsonTransform(MaterializedSalesSchema);
addToJsonTransform(MaterializedTotalProductsSchema);
addToJsonTransform(MaterializedOverallStatsSchema);

// Create models
export const MaterializedSalesByWeekday = model<IMaterialized>(
  "MaterializedSalesByWeekday",
  MaterializedSalesSchema
);

export const MaterializedTotalProducts = model<IMaterialized>(
  "MaterializedTotalProducts",
  MaterializedTotalProductsSchema
);

export const MaterializedOverallStats = model<IMaterialized>(
  "MaterializedOverallStats",
  MaterializedOverallStatsSchema
);
