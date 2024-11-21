import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema({
    orderNum: { required: true, type: String },
    products: {
        required: true, type: [{
            _id: false,
            product: { required: true, type: Schema.Types.ObjectId, ref: 'Products' },
            amount: { required: true, type: Number }
        }]
    },
    picker: { required: true, type: Schema.Types.ObjectId, ref: 'Employees' },
    driver: { required: true, type: Schema.Types.ObjectId, ref: 'Employees' },
    status: { required: true, type: String },
    orderDate: { required: true, type: Date },
    completeDate: Date
})

export default mongoose.model("Orders", orderSchema)