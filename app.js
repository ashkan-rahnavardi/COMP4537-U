const mongoose = require("mongoose")
const express = require("express")
const { connectDB } = require("./connectDB.js")
const { populatePokemons } = require("./populatePokemons.js")
const { getTypes } = require("./getTypes.js")
const { handleErr } = require("./errorHandler.js")
const cookieParser = require('cookie-parser');
const {
  PokemonBadRequest,
  PokemonBadRequestMissingID,
  PokemonBadRequestMissingAfter,
  PokemonDbError,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonNoSuchRouteError,
  PokemonBadID,
  PokemonBadCount,
  PokemonBadAfter
} = require("./errors.js")
const userModel = require("./userModel.js")
const { asyncWrapper } = require("./asyncWrapper.js")

const dotenv = require("dotenv")
dotenv.config();

const app = express()
var pokeModel = null;

// const userModel = require("./userModel.js")

app.use(cookieParser());
app.use(express.urlencoded());

const start = async () => {
  await connectDB();
  const pokeSchema = await getTypes();
  pokeModel = await populatePokemons(pokeSchema);

  app.listen(process.env.pokeServerPORT, (err) => {
    if (err)
      throw new PokemonDbError(err)
    else
      console.log(`Phew! Server is running on port: ${process.env.pokeServerPORT}`);
  })
}
start()
app.use(express.json())
const jwt = require("jsonwebtoken")

const auth = asyncWrapper(async(req, res, next) => {
  // const token = req.cookies.authToken; 
  // const token = req.header('auth-token')

  const token = req.query.appid

  if (!token) {
    throw new PokemonBadRequest("Access denied")
  }

  try {
    const user = await userModel.find({ "token": token })

    const valid = user[0].isTokenValid
  
    if (!valid) {
      throw new PokemonBadRequest("Invalid token")
    }
    const verified = jwt.verify(token, process.env.TOKEN_SECRET) // nothing happens if token is valid
    next()
  } catch (err) {
    throw new PokemonBadRequest("Invalid token")
  }
})

app.use(auth)


app.patch("/pokemonsAdvancedUpdate", async (req, res) => {
  const { id,
    pushOperator
  } = req.query
  const query = {}

  if (pushOperator) {
    const pushOperatorArray = pushOperator.split(",").map(elm => {
      return elm.trim().replace(/[\]\[]/g, "")
    }) // array
    Promise.all(pushOperatorArray.map(async elm => {
      return new Promise(async (resolve, reject) => {
        query["$push"] = { ["type"]: elm }
        console.log(query);
        try {
          const selection = { id: id }
          const update = query
          const options = {
            new: true,
            runValidators: true
          }
          const doc = await pokeModel.findOneAndUpdate(selection, update, options)
          console.log(doc);
          resolve()
        } catch (err) { res.json(handleErr(err)) }
      })
    })
    ).then(
      async () => {
        const doc = await pokeModel.find({ id: id })
        if (doc) {
          res.json({
            msg: "Updated Successfully",
            pokeInfo: doc
          })
        } else {
          res.json({
            msg: "Not found",
          })
        }
      }
    )
  }
})

app.get("/pokemonsAdvancedFiltering", async (req, res) => {
  const { id,
    "base.HP": baseHP,
    "base.Attack": baseAttack,
    "base.Defense": baseDefense,
    "base.Speed Attack": baseSpeedAttack,
    "base.Speed Defense": baseSpeedDefense,
    "base.Speed": baseSpeed,
    type,
    "name.english": nameEnglish,
    "name.japanese": nameJapanese,
    "name.chinese": nameChinese,
    "name.french": nameFrench,
    page,
    sort,
    filteredProperty,
    hitsPerPage,
    comparisonOperators
  } = req.query

  const query = {}
  if (id) query.id = Number(id)
  if (baseHP) query["base.HP"] = baseHP
  if (baseAttack) query["base.Attack"] = baseAttack
  if (baseDefense) query["base.Defense"] = Number(baseDefense)
  if (baseSpeedAttack) query["base.Speed Attack"] = baseSpeedAttack
  if (baseSpeedDefense) query["base.Speed Defense"] = baseSpeedDefense

  if (baseSpeed) query["base.Speed"] = baseSpeed
  if (nameEnglish) query["name.english"] = nameEnglish

  if (nameJapanese) query["name.japanese"] = nameJapanese
  if (nameChinese) query["name.chinese"] = nameChinese
  if (nameFrench) query["name.french"] = nameFrench
  if (page) page = Number(page)
  if (hitsPerPage) hitsPerPage = Number(hitsPerPage)

  if (type) query.type = { $in: type.split(",").map(element => element.trim()) }

  if (comparisonOperators) {
    const comparisonOperatorsArray = comparisonOperators.split(",").map(elm => elm.trim()) // array

    const comparisonOperatorsMap = {
      "<": "$lt",
      ">": "$gt",
      "<=": "$lte",
      ">=": "$gte",
      "==": "$eq",
      "!=": "$ne"
    }
    comparisonOperatorsArray.map(element => {
      console.log(element);
      let mongooseQuery = element.replace(/(<=|>=|<|>|!=|==)/g, (match) => {
        console.log(match);
        return "-" + comparisonOperatorsMap[match] + "-"
      })
      const [field, operator, value] = mongooseQuery.split('-');
      query["base." + field] = { [operator]: Number(value) }
      console.log(query);
    });
  }

  const mongooseQuery = pokeModel.find(query);

  if (sort)
    mongooseQuery.sort(sort)
  if (filteredProperty)
    mongooseQuery.select(filteredProperty.replace(/, /g, " ") + " -_id")

  const pokemons = await mongooseQuery;
  res.send({
    hits: pokemons,
    key: "asldkasdk"
  })
})

app.get('/api/v1/pokemons', asyncWrapper(async (req, res) => {

  let { count, after } = req.query;

  if (!count) count = 10;
  if (!after) after = 0;
  if (isNaN(count)) throw new PokemonBadCount();
  if (isNaN(after)) throw new PokemonBadAfter();

  const docs = await pokeModel.find({})
    .sort({ "id": 1 })
    .skip(after)
    .limit(count)
  res.json(docs)
}))

app.get('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {
  const { id } = req.params
  if (isNaN(id)) throw new PokemonBadID();
  const docs = await pokeModel.find({ "id": id })
  if (docs.length != 0) res.json(docs)
  else throw new PokemonNotFoundError();
}))

app.post('/api/v1/pokemon/', asyncWrapper(async (req, res) => {

  const token = req.query.appid;
  const user = await userModel.find({ "token": token })

  const admin = user[0].isAdmin;

  if (!admin) {
    throw new PokemonBadRequest("Only available for admins")
  } else {
    if (!req.body.id) throw new PokemonBadRequestMissingID()
    const poke = await pokeModel.find({ "id": req.body.id })
    if (poke.length != 0) throw new PokemonDuplicateError()
    const pokeDoc = await pokeModel.create(req.body)
    res.json({
      msg: "Added Successfully"
    })
  }

}))

app.delete('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {

  const token = req.query.appid;
  const user = await userModel.find({ "token": token })

  const admin = user[0].isAdmin;

  if (!admin) {
    throw new PokemonBadRequest("Only available for admins")
  } else {
    const docs = await pokeModel.findOneAndRemove({ id: req.params.id })
    if (docs)
      res.json({
        msg: "Deleted Successfully"
      })
    else
      throw new PokemonNotFoundError("");
  }

}))

app.put('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {

  const token = req.query.appid;
  const user = await userModel.find({ "token": token })

  const admin = user[0].isAdmin;

  if (!admin) {
    throw new PokemonBadRequest("Only available for admins")
  } else {
    const selection = { id: req.params.id }
    const update = req.body
    const options = {
      new: true,
      runValidators: true,
      overwrite: true
    }
    const doc = await pokeModel.findOneAndUpdate(selection, update, options)
    if (doc) {
      res.json({
        msg: "Updated Successfully",
        pokeInfo: doc
      })
    } else {
      throw new PokemonNotFoundError("");
    }
  }
  // try {
}))

app.patch('/api/v1/pokemon/:id', asyncWrapper(async (req, res) => {

  const token = req.query.appid;
  const user = await userModel.find({ "token": token })

  const admin = user[0].isAdmin;

  if (!admin) {
    throw new PokemonBadRequest("Only available for admins")
  } else {
    const selection = { id: req.params.id }
    const update = req.body
    const options = {
      new: true,
      runValidators: true
    }
    const doc = await pokeModel.findOneAndUpdate(selection, update, options)
    if (doc) {
      res.json({
        msg: "Updated Successfully",
        pokeInfo: doc
      })
    } else {
      throw new PokemonNotFoundError("");
    }
  }
  // try 
}))

app.get("*", (req, res) => {
  throw new PokemonNoSuchRouteError("");
})


app.use(handleErr)