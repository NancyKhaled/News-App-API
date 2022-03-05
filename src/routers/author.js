const express = require('express')
const Author = require('../models/author')
const auth = require('../middelware/auth')
const multer = require('multer')

const router = new express.Router()

// post
router.post('/signUp', async (req, res) => {
    try {
        const author = new Author(req.body)
        await author.save()
        const token = await author.generateToken()
        res.status(200).send({
            author,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

//login
router.post('/login', async (req, res) => {
    try {
        const author = await Author.findByCredentials(req.body.email, req.body.password)
        const token = await author.generateToken()
        res.status(200).send({
            author,
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
})

//profile
router.get('/profile', auth.authorAuth, async (req, res) => {
    res.status(200).send(req.author)
})

//patch (updata) => author
router.patch('/profile', auth.authorAuth, async (req, res) => {
    try {
        const updates = Object.keys(req.body)
        if (!req.author) {
            return res.status(400).send('Unable to find author.')
        }
        updates.forEach((el) => (req.author[el] = req.body[el]))
        await req.author.save()

        res.status(200).send(req.author)
    } catch (e) {
        res.status(400).send(e)
    }
})

//delete by id => author
router.delete('/profile', auth.authorAuth, async (req, res) => {
    try {
        const _id = req.author._id
        const author = await Author.findByIdAndDelete(_id, req.body)
        if (!author) {
            return res.status(400).send('Unable to find author.')
        }
        res.status(200).send(req.author)
    } catch (e) {
        res.status(500).send(e)
    }
})

//logout
router.delete('/logout', auth.authorAuth, async (req, res) => {
    try {
        req.author.tokens = req.author.tokens.filter((el) => {
            return el !== req.token
        })
        await req.author.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

//logout all
router.delete('/logoutAll', auth.authorAuth, async (req, res) => {
    try {
        req.author.tokens = []
        await req.author.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// upload avatar image for author
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
router.post('/profile/avatar', auth.authorAuth, uploads.single('avatar'), async (req, res) => {
    try {
        req.author.avatar = req.file.buffer
        await req.author.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router