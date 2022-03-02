const express = require('express')
const News = require('../models/news')
const auth = require('../middelware/auth')
const multer = require('multer')

const router = new express.Router()

//post
router.post('/news', auth.authorAuth, async (req, res) => {
    try {
        const news = new News({
            ...req.body,
            owner: req.author._id
        })
        await news.save()
        res.status(200).send(news)
    } catch (e) {
        res.status(500).send(e)
    }
})

//get all (find all) => admin
router.get('/allNews', auth.authorAuth, auth.requireAdmin, async (req, res) => {
    try {
        const news = await News.find({})
        res.status(200).send(news)
    } catch (e) {
        res.status(500).send(e)
    }
})

//get by id (find by id) => admin
router.get('/news/:id', auth.authorAuth, auth.requireAdmin, async (req, res) => {
    try {
        const _id = req.params.id
        const news = await News.findById({
            _id,
            owner: req.author._id
        })
        if (!news) {
            return res.status(400).send('Unable to find news.')
        }
        res.status(200).send(news)
    } catch (e) {
        res.status(500).send(e)
    }
})

//get news => author
router.get('/news', auth.authorAuth, async (req, res) => {
    try {
        await req.author.populate('news')
        res.status(200).send(req.author.news)
    } catch (e) {
        res.status(500).send(e)
    }
})

//patch (update) by id => author
router.patch('/news/:id', auth.authorAuth, async (req, res) => {
    try {
        const _id = req.params.id
        const task = await News.findOneAndUpdate({
            _id,
            owner: req.author._id
        }, req.body, {
            new: true,
            runValidators: true
        })
        if (!task) {
            return res.status(400).send('Unable to find news.')
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

//delete by id => author
router.delete('/news/:id', auth.authorAuth, async (req, res) => {
    try {
        const _id = req.params.id
        const news = await News.findOneAndDelete({
            _id,
            owner: req.author._id
        })
        if (!news) {
            return res.status(400).send('Unable to find news.')
        }
        res.status(200).send(news)
    } catch (e) {
        res.status(500).send(e)
    }
})

//get author of the id news
router.get('/authorNews/:id', auth.authorAuth, async (req, res) => {
    try {
        const _id = req.params.id
        const news = await News.findOne({
            _id,
            owner: req.author._id
        })
        if (!news) {
            return res.status(404).send('Unable to find news.')
        }
        await news.populate('owner')
        res.status(200).send(news.owner)
    } catch (e) {
        res.status(500).send(e)
    }
})

// upload image for news
const uploads = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)) {
            cb(new Error('Please upload image'))
        }
        cb(null, true)
    }
})
router.post('/news/:id', auth.authorAuth, uploads.single('image'), async (req, res) => {
    try {
        const _id = req.params.id
        const news = await News.findById({
            _id,
            owner: req.author._id
        })
        if (!news) {
            return res.status(400).send('Unable to find news.')
        }
        news.image = req.file.buffer
        await news.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router