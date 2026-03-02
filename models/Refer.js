const mongoose = require("mongoose");


const referSchema = new mongoose.Schema({
    referCode: {
        type: String,
        required: true
    },
    referTo: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    referFrom: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true

    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'claimed', 'expired'],
        default: 'pending'
    },
}, { timestamps: true })


module.exports = mongoose.model("Refer", referSchema);