const mongoose = require("mongoose")
const Schema = mongoose.Schema

const OrderModel = new Schema({
    products: [{ product_id: Schema.Types.ObjectId }],
    total: {
        type: Schema.Types.Number,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Order", OrderModel)