const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT
const authorRouter = require('./routers/author')
const newsRouter = require('./routers/news')
require('./db/mongoose')

app.use(express.json())
app.use(authorRouter)
app.use(newsRouter)

app.listen(port, () => {
    console.log('Server is running')
})