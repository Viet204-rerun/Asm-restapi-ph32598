const express = require('express');

const app = express();


const port = 3000;
app.listen(port, ()=>{
    console.log('Đang ở cổng 3000');
})
const api = require('./api');
app.use('/api',api);
const COMMON = require('./COMMON')
const uri = COMMON.uri;
const carModel = require('./laptopModel')
const mongoose = require('mongoose');
app.get('/',async (req,res)=>{
    await mongoose.connect(uri);
    let car = await carModel.find();
    console.log(car);
    res.send(car)
})
