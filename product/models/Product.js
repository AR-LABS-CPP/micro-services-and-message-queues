const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ProductModel = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    price: {
        type: Schema.Types.Number,
        required: true
    },
    description: {
        type: Schema.Types.String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Product", ProductModel)