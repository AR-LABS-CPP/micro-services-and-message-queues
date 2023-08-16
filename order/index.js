require("dotenv").config()

const express = require("express")
const ampq = require("amqplib")
const mongoose = require("mongoose")
const OrderModel = require("./models/Order")
const app = express()
const PORT = process.env.PORT || 3002

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

let channel, connection

mongoose.connect(
    process.env.ORDERS_DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
.then(() => console.log("Connected to orders mongo instance"))
.catch((err) => console.log(err))

const connectToQueue = async () => {
    connection = await ampq.connect(process.env.QUEUE_SERVER_URL)
    channel = await connection.createChannel()
    await channel.assertQueue("order-service-queue")
}

const createOrder = async (products) => {
    let total = 0

    try {
        products.forEach(product => {
            total += product.price
        })
        
        const order = await new OrderModel({
            products,
            total
        }).save()
    
        return order
    }
    catch(err) { 
        console.log(err)
    }
}

connectToQueue().then(() => {
    channel.consume("order-service-queue", async (data) => {
        console.log("Consuming from order service queue")
        console.log(JSON.parse(data.content))
        const products = JSON.parse(data.content)
        const newOrder = await createOrder(products)

        console.log(newOrder)
        
        channel.ack(data)

        channel.sendToQueue(
            "product-service-queue",
            Buffer.from(JSON.stringify(newOrder))
        )
    })
})

app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`)
})