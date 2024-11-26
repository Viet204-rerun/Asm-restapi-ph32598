const mongoose = require('mongoose');

const LaptopSchema = new mongoose.Schema({
    ten:{
        type:String,
    },
    gia:{
        type:Number,
    },
    hang:{
        type:String,
    },
    anhUrl:{
        type:Array,
    },
    status:{
        type:Number
    }
});

const LaptopModel = new mongoose.model('laptop', LaptopSchema)
module.exports = LaptopModel;