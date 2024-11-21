import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
    name: { required: true, type: String },
    price: { required: true, type: Number },
    weight: { required: true, type: Number }
})

export default mongoose.model("Products", productSchema)