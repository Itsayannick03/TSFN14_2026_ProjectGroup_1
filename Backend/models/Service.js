const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    duration: {
        type: Number,
        require: true,
    }
});



module.exports = mongoose.model("Service", serviceSchema);