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
const jwt = require("jsonwebtoken")
// const { findOne } = require("./userModel.js")
const userModel = require("./userModel.js")

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