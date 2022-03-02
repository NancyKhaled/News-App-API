const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = process.env.PORT
const authorRouter = require('./routers/author')
const newsRouter = require('./routers/news')
require('./db/mongoose')

app.use(express.json())
app.use(cors())
app.use(authorRouter)
app.use(newsRouter)

app.listen(port, () => {
    console.log('Server is running')
})