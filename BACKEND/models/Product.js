const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

    productId: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    quantity: {
        type: Number,
        default: 0
    },

    image: {
        type: String,
        default: ""
    },

    category: {
        type: String,
        default: "General"
    },

    description: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Product", productSchema);