const mongoose = require("mongoose")
const express = require("express")
const { connectDB } = require("./connectDB.js")
const { populatePokemons } = require("./populatePokemons.js")
const { getTypes } = require("./getTypes.js")
const { handleErr } = require("./errorHandler.js")
const app = express()
const port = 4000
var pokeModel = null;

const start = async () => {
  // console.log("starting the server");
  await connectDB();
  const pokeSchema = await getTypes();
  pokeModel = await populatePokemons(pokeSchema);

  app.listen(port, (err) => {
    // console.log("app.listen started");
    if (err) console.log(err);
    else
      console.log(`Phew! Server is running on port: ${port}`);
  })
}
start()


app.get('/api/v1/pokemons', async (req, res) => {
  console.log("GET /api/v1/pokemons");
  if (!req.query["count"])
    req.query["count"] = 809
  if (!req.query["after"])
    req.query["after"] = 0
  try {
    const docs = await pokeModel.find({})
      .sort({ "id": 1 })
      .skip(req.query["after"])
      .limit(req.query["count"])
    res.json(docs)
  } catch (err) { res.json(handleErr(err)) }
})

app.get('/api/v1/pokemon/:id', async (req, res) => {
  try {
    const { id } = req.params
    const docs = await pokeModel.find({ "id": id })
    if (docs.length != 0) res.json(docs)
    else res.json({ errMsg: "Pokemon not found" })
  } catch (err) { res.json(handleErr(err)) }
})

app.use(express.json())

app.post('/api/v1/pokemon/', async (req, res) => {
  try {
    const pokeDoc = await pokeModel.create(req.body)
    // console.log(pokeDoc);
    res.json({
      msg: "Added Successfully"
    })
  } catch (err) { res.json(handleErr(err)) }
})

app.delete('/api/v1/pokemon/:id', async (req, res) => {
  try {
    const docs = await pokeModel.findOneAndRemove({ id: req.params.id })
    if (docs)
      res.json({
        msg: "Deleted Successfully"
      })
    else
      res.json({
        errMsg: "Pokemon not found"
      })
  } catch (err) { res.json(handleErr(err)) }
})

app.put('/api/v1/pokemon/:id', async (req, res) => {
  try {
    const selection = { id: req.params.id }
    const update = req.body
    const options = {
      new: true,
      runValidators: true,
      overwrite: true
    }
    const doc = await pokeModel.findOneAndUpdate(selection, update, options)
    // console.log(docs);
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
  } catch (err) { res.json(handleErr(err)) }
})

app.patch('/api/v1/pokemon/:id', async (req, res) => {
  try {
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
      res.json({
        msg: "Not found",
      })
    }
  } catch (err) { res.json(handleErr(err)) }
})

app.get('/pokemonsAdvancedFiltering', async (req, res) => {


    console.log(req.query);
    const {id, 'base.HP' : baseHP, type, name, comparisonOperators} = req.query;
    let query = {};

    if (id) {query.id = id};

    if (baseHP) {query["base.HP"] = Number(baseHP)}

    if (comparisonOperators) {
      comparisons = comparisonOperators.split(",").map(item => item.trim())

      // I believe this method below would have worked, except I am unable to pass a variable as the key, so stat does not change in the query. 

      comparisons.forEach(element => {
        if(element.includes("<=")) {
          filters = element.split("<=")
          stat = filters[0]
          query.base = {
            stat: {$lte: filters[1]}
          }
        }
        if(element.includes("<")) {
          filters = element.split("<")
          stat = filters[0]
          query.base = {
            stat: {$lt: filters[1]}
          }
        }
        if(element.includes(">=")) {
          filters = element.split(">=")
          stat = filters[0]
          query.base = {
            stat: {$gte: filters[1]}
          }
        }
        if(element.includes("<")) {
          filters = element.split("<")
          stat = filters[0]
          query.base = {
            stat: {$gt: filters[1]}
          }
        }
        if(element.includes("!=")) {
          filters = element.split("!=")
          stat = filters[0]
          query.base = {
            stat: {$ne: filters[1]}
          }
        }
        if(element.includes("==")) {
          filters = element.split("==")
          stat = filters[0]
          query.base = {
            stat: {$eq: filters[1]}
          }
        }
      })
    }


      // comparisons.forEach(element => {
      //   element.replace(new RegExp(">"), "$gt")
      //   element.replace(">=", "$gte")
      //   element.replace("<", "$lt")
      //   element.replace("<=", "$lte")
      //   element.replace("!=", "$ne")
      //   element.replace("==", "$eq")
      // })
      // console.log(comparisons);
    
    if (type) {
        query.type = {
            $in: type.split(",").map(item => item.trim())
        }
    }

    console.log(query);

    const pokemons = await pokeModel.find(query);
    res.send(pokemons);

})

app.patch("/pokemonsAdvancedUpdate", async (req, res) => {

  const newTypes = req.query.pushOperator.replace("]", "")
  newTypes = newTypes.replace("[", "")
  newTypes = newTypes.pushOperator.split(",")

  console.log(newTypes);

  // try {
  //   const selection = { id: req.params.id }
  //   const update = newTypes[i]
  //   const options = {
  //     new: true,
  //     runValidators: true
  //   }
  //   const doc = await pokeModel.findOneAndUpdate(selection, update, options)
  //   if (doc) {
  //     res.json({
  //       msg: "Updated Successfully",
  //       pokeInfo: doc
  //     })
  //   } else {
  //     res.json({
  //       msg: "Not found",
  //     })
  //   }
  // } catch (err) { res.json(handleErr(err)) }
})


app.get("*", (req, res) => {
    res.json({
      msg: "Improper route. Check API docs plz."
    })
  })