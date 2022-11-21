const express = require("express")
const { handleErr } = require("./errorHandler.js")
const { asyncWrapper } = require("./asyncWrapper.js")
const dotenv = require("dotenv")
dotenv.config();
const userModel = require("./userModel.js")
const { connectDB } = require("./connectDB.js")
const { PokemonDbError } = require("./errors.js")

const app = express()

const start = asyncWrapper(async () => {
    await connectDB();


    app.listen(process.env.authServerPORT, (err) => {
        if (err)
            throw new PokemonDbError(err)
        else
            console.log(`Phew! Server is running on port: ${process.env.authServerPORT}`);
    })
})
start()

app.use(express.json())

const bcrypt = require("bcrypt")
app.post('/register', asyncWrapper(async (req, res) => {
    const {
        username,
        password,
        email
    } = req.body

    console.log(req.body);
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const userWithHashedPassword = {
        ...req.body,
        password: hashedPassword
    }

    const user = await userModel.create(userWithHashedPassword)
    //res.redirect('/login')
    res.send(user)
}))

const jwt = require("jsonwebtoken")
app.post('/login', asyncWrapper(async (req, res) => {
    const {
        username,
        password
    } = req.body
    const user = await userModel.findOne({
        username
    })
    if (!user) {
        throw new PokemonBadRequest("User not found")
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    if (!isPasswordCorrect) {
        throw new PokemonBadRequest("Password is incorrect")
    }

    if (!user.token) {
        // Create and assign a token
        const token = jwt.sign({
            _id: user._id
        }, process.env.TOKEN_SECRET)
        console.log(user);

        const user2 = await userModel.findOneAndUpdate({
            username
        }, {
            $set: {
                token: token,
                isTokenValid: true
            }
        }, {
            new: true
        })

        res.send(user2)
    } else {
        const user2 = await userModel.findOneAndUpdate({
            username
        }, {
            $set: {
                isTokenValid: true
            }
        }, {
            new: true
        })

        res.cookie("tokenValid", true)
        res.send(user2)
    }

}))

app.post('/logout', asyncWrapper(async (req, res) => {
    const {
        username,
        password
    } = req.body

    const user = await userModel.findOneAndUpdate({"username": username}, {$set: {isTokenValid: false}}, {new: true})


    res.send(user)
}))

app.use(handleErr)