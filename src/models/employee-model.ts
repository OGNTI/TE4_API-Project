import mongoose, { Schema } from "mongoose";

const employeeSchema = new Schema({
    name: { required: true, type: String },
    job: { required: true, type: String },
    warehouse: { required: true, type: Schema.Types.ObjectId, ref: 'Warehouses' },
    schedule: {
        required: true, type: [{
            _id: false,
            day: { required: true, type: String },
            time: { required: true, type: [String] }
        }]
    }
})

export default mongoose.model("Employees", employeeSchema)