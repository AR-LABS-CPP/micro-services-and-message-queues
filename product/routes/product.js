const express = require("express")
const router = express()
const ProductModel = require("../models/Product")
const amqp = require("amqplib")

let order, channel, connection

const connectToMessageQueue = async () => {
    connection = await amqp.connect(process.env.QUEUE_SERVER_URL)
    channel = await connection.createChannel()
    await channel.assertQueue("product-service-queue")
}

connectToMessageQueue()

router.post("/", async (req, res) => {
    const { name, price, description } = req.body

    if(!name || !price || !description) {
        return res.sendStatus(400)
    }

    await new ProductModel({...req.body}).save()

    return res.sendStatus(201)
})

router.post("/buy", async (req, res) => {
    const { productIds } = req.body
    console.log(productIds)

    const products = await ProductModel.find({
        '_id': {
            $in: productIds
        }
    })

    console.log("Products Found: " + products)

    channel.sendToQueue(
        "order-service-queue",
        Buffer.from(JSON.stringify(products))
    )

    channel.consume(
        "product-service-queue",
        (data) => {
            console.log("Consuming from product service queue")
            console.log(JSON.parse(data.content))
            order = JSON.parse(data.content)
            channel.ack(data)
        }
    )

    return res.sendStatus(201)
})

module.exports = router