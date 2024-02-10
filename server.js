const express = require('express')
const mongoose = require('mongoose')
const {json} = require("express");
const PORT = process.env.PORT || 5000
const app = express()
const router = require('./authRouter')

app.use(express.json())
app.use('/auth', router)
const start = async () =>{
    try{
        await mongoose.connect('mongodb://localhost:27017/dbauth', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => console.log(`Сервер прослушивается на порту ${PORT}`))
    } catch (e){
        console.log(e)
    }
}

start()