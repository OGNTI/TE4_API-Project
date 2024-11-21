import mongoose, { Schema } from "mongoose";

const warehouseSchema = new Schema({
    warehouseLocation: { required: true, type: String },
    products: {
        required: true, type: [{
            _id: false,
            product: { required: true, type: Schema.Types.ObjectId, ref: 'Products' },
            inventory: { required: true, type: Number },
            shelf: { required: true, type: Number }
        }]
    }
})

export default mongoose.model("Warehouses", warehouseSchema)