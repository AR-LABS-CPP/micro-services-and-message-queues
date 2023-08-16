require("dotenv").config()

const express = require("express")
const app = express()
const PORT = process.env.port || 3001
const mongoose = require("mongoose")
const productRouter = require("./routes/product")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/products", productRouter)

mongoose.connect(
    process.env.PRODUCT_DB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
.then(() => console.log("Connected to products mongo instance"))
.catch((err) => console.log(err))

app.listen(PORT, () => {
    console.log(`Product service running on port: ${PORT}`)
})