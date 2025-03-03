import exp from 'constants';
import mongoose,{ Schema, Document } from 'mongoose';

// Define the MaterializedSalesView
const MaterializedSalesSchema = new Schema({}, { strict: false, collection: 'materializedSalesByWeekday' });
const materializedTotalProductsSchema = new Schema({}, { strict: false, collection: 'materializedTotalProducts' });
const materializedOverallStatsSchema = new Schema({}, { strict: false, collection: 'materializedOverallStats' });

export const MaterializedSalesByWeekday = mongoose.model<Document>('MaterializedSalesByWeekday', MaterializedSalesSchema);
export const MaterializedTotalProducts = mongoose.model<Document>('MaterializedTotalProducts', materializedTotalProductsSchema);
export const MaterializedOverallStats = mongoose.model<Document>('MaterializedOverallStats', materializedOverallStatsSchema);