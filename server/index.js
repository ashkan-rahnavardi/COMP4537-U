const express = require("express");
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require("cors");
const mongoose = require("mongoose")
const { connectDB } = require("./connectDB.js")
const { populatePokemons } = require("./populatePokemons.js")
const { getTypes } = require("./getTypes.js")
const { handleErr } = require("./errorHandler.js")
const morgan = require("morgan")
const dotenv = require("dotenv")
const { asyncWrapper } = require("./asyncWrapper.js")
const userModel = require("./userModel.js")
const bodyParser = require('body-parser');

const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError,
  PokemonAuthError
} = require("./errors.js")

dotenv.config();

var pokeModel = null;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));


const start = asyncWrapper(async () => {
  await connectDB({ "drop": false });
  const pokeSchema = await getTypes();
  // pokeModel = await populatePokemons(pokeSchema);
  pokeModel = mongoose.model('pokemons', pokeSchema);

  app.listen(PORT, (err) => {
    if (err)
      throw new PokemonDbError(err)
    else
      console.log(`Phew! Server is running on port: ${PORT}`);
  })
})

start()

const bcrypt = require("bcrypt")
app.post('/register', asyncWrapper(async (req, res) => {
  const { username, password, email, role } = req.body

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  const userWithHashedPassword = { ...req.body, password: hashedPassword }

  const user = await userModel.create(userWithHashedPassword)
  res.redirect('http://localhost:3000/');
}))

const jwt = require("jsonwebtoken")
app.post('/login', asyncWrapper(async (req, res) => {
  const { username, password } = req.body
  const user = await userModel.findOne({username})
  console.log(user);
  if (!user) {
    throw new PokemonAuthError("User not found")
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    throw new PokemonAuthError("Password is incorrect")
  }

  if (!user.token) {
    // Create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
    console.log(token);
    await userModel.updateOne({ username }, { token })
    res.header('auth-token', token)
  } else {
    res.header('auth-token', user.token)
  }
  const updatedUser = await userModel.findOneAndUpdate({ username }, { "token_invalid": false })

  if (user.role === "admin") {
    res.header('isAdmin', true);
  } else {
    res.header('isAdmin', false);
  }

  res.redirect('http://localhost:3000/');
}))


const authUser = asyncWrapper(async (req, res, next) => {
  // const to ken = req.header('auth-token')
  const token = req.query.appid
  if (!token) {
    throw new PokemonAuthError("No Token: Please provide an appid query parameter.")
  }
  const userWithToken = await userModel.findOne({ token })
  if (!userWithToken || userWithToken.token_invalid) {
    throw new PokemonAuthError("Please Login.")
  }
  try {
    // console.log("token: ", token);
    const verified = jwt.verify(token, process.env.TOKEN_SECRET) // nothing happens if token is valid
    next()
  } catch (err) {
    throw new PokemonAuthError("Invalid user.")
  }
})

const authAdmin = asyncWrapper(async (req, res, next) => {
  const user = await userModel.findOne({ token: req.query.appid })
  if (user.role !== "admin") {
    throw new PokemonAuthError("Access denied")
  }
  next()
})


// app.get('/api', (req, res) => {
//   res.json({ message: "poo!" });
// });

app.get("/pokemons", asyncWrapper(async (req, res) => {
  console.log("beep");
  const docs = await pokeModel.find({})
  res.json(docs);
}));

app.use(handleErr);


// const PORT = process.env.PORT || 3001;

// const express = require("express");
// const cors = require("cors");
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.get('/api', (req, res) => {
//   res.json({ message: "Hello!" });
// });

// app.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// })