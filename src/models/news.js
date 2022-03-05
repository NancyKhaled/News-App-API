const mongoose = require('mongoose')

const newsSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: Buffer
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Author"
    }
})

newsSchema.methods.toJSON = function () {
    const news = this
    const newsObject = news.toObject()
    return newsObject
}

const News = mongoose.model('News', newsSchema)
module.exports = News