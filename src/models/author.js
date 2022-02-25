const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.')
            }
        }
    },
    age: {
        type: Number,
        default: 10,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive number.')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6,
        validate(value) {
            let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])");
            if (!strongRegex.test(value)) {
                throw new Error('Passowrd must include uppercase, lowercase, numeric and special character.')
            }
        }
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        validate(value) {
            let phoneRegex = new RegExp("^01[0-2,5]{1}[0-9]{8}$")
            if (!phoneRegex.test(value)) {
                throw new Error('Invalid phone number.')
            }
        }
    },
    avatar: {
        type: Buffer
    },
    roles: {
        type: String,
        enum: ['admin', 'author'],
        default: 'author'
    },
    // ts: {
    //     timestamps: true
    // },
    tokens: [{
        type: String,
        required: true
    }]
}, {
    timestamps: true
})

// virtual relation
authorSchema.virtual('news', {
    ref: 'News',
    localField: '_id',
    foreignField: 'owner'
})

//hash password
authorSchema.pre('save', async function () {
    const author = this
    if (author.isModified('password')) {
        author.password = await bcrypt.hash(author.password, 8)
    }
})

//login
authorSchema.statics.findByCredentials = async (email, password) => {
    const author = await Author.findOne({
        email
    })
    if (!author) {
        throw new Error('Unable to login..check email or password.')
    }
    const isMatch = await bcrypt.compare(password, author.password)
    if (!isMatch) {
        throw new Error('Unable to login..check email or password.')
    }
    return author
}

//token
authorSchema.methods.generateToken = async function () {
    const author = this
    const token = jwt.sign({
        _id: author._id.toString()
    }, process.env.JWT_SECRET)

    author.tokens = author.tokens.concat(token)
    await author.save()
    return token
}

const Author = mongoose.model('Author', authorSchema)
module.exports = Author