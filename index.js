const express = require('express');
const mongoose = require('mongoose');
const https = require('https');
const axios = require('axios');

const app = express();
const port = 4000;

let typeUrl = "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json";
let pokedexUrl = "https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json";


async function getTypes() {
    let englishTypes = [];
    try {
        const response = await axios.get(typeUrl);
        const types = response.data;
        for (let i = 0; i < types.length; i++) {
            englishTypes.push(types[i].english);
        }
        return englishTypes;
    } catch (error){
        console.log(error)
    }
}

async function getPokemons() {
    try {
        const pokemon = await axios.get(pokedexUrl);
        return pokemon.data;
    } catch (error){
        console.log(error)
    }
}

function verifyID(id) {

}

app.listen(port, async () => {

    let pokeTypes;
    let pokemons;

    try {
        const x = await mongoose.connect('mongodb+srv://User1:C1Y1FCRG3Bja5wX8@clusterdouglas.vgdrqt1.mongodb.net/?retryWrites=true&w=majority')
        mongoose.connection.db.dropDatabase();
        pokeTypes = await getTypes();
        pokemons = await getPokemons();
    } catch (error) {
        console.log('db error');
    }
    console.log(`Example app listening on port ${port}`);

    const {Schema} = mongoose;

    const pokemonSchema = new Schema({
        "id": Number,
        "name": {
            "english": String,
            "japanese": String,
            "chinese": String,
            "french": String
        }, 
        "type": pokeTypes,
        "base": {
            "HP": Number,
            "Attack": Number,
            "Defense": Number,
            "Sp. Attack": Number,
            "Sp. Defense": Number,
            "Speed": Number,
        }
    });

    const pokemonModel = mongoose.model('Pokemon', pokemonSchema);

    pokemonModel.create(pokemons);

    app.get('/api/v1/pokemons', (req, res) => {
        let count = req.query.count;
        let index = req.query.after;

        if (index == null) {
            index = 0;
        }
        
        if (count == null) {
            count = 809;
        }

        if (typeof index === 'string') {
            index = Number(index);
        }

        if (typeof count === 'string') {
            count = Number(count);
        }
    
        pokemonModel.find({
            id : {$gt: (index + 0), $lt: (index + count + 1)}
        })
        .then(docs => {
            res.json(docs)
        })
        .catch(err => {
            console.error(err)
            res.json({
                msg: "db reading .. err.  Check with server devs"
            })
        })
    });

    app.get('/api/v1/pokemon/:id', (req, res) => {

        let pokeID = req.params.id;

        var isNumber = /^\d+$/.test(pokeID);

        if(!isNumber) {
            res.send("Key Cast Error");
        } else {
            pokemonModel.find({
                id: pokeID
            })
            .then(doc => {
                console.log(doc.length)

                if (doc.length == 0) {
                    res.send("Pokemon not found (get)");
                } else {
                    res.json(doc)
                }
            })
            .catch(err => {
                console.error(err)
                res.json({
                    msg: "db reading .. err.  Check with server devs"
                })
            })
        }
    })

    app.use(express.json())
    app.post('/api/v1/pokemon', (req, res) => {

        pokemonModel.find({
            id: req.body.id
        })
        .then(doc => {
            if (doc.length > 0) {
                res.send("duplicate pokemon");
            } else if (req.body.name.english.length > 20) {
                res.send("pokemon name too long");
            } else {
                pokemonModel.create(req.body, function (err) {
                    if (err) console.log(err);
                }); 
                res.json(req.body)
            }
        })
        .catch(err => {
            console.error(err)
            res.json({
                msg: "db reading .. err.  Check with server devs"
            })
        })

    })

    app.put('/api/v1/pokemon', (req, res) => {

        pokemonModel.create(req.body, function (err) {
            if (err) console.log(err);
        }); 
        res.json(req.body)
    })

    app.patch('/api/v1/pokemon/:id', (req, res) => {

        let pokeID = Number(req.params.id);
        const { _id, ...rest } = req.body;

        pokemonModel.find({
            id: pokeID
        })
        .then(doc => {
            if (doc.length == 0) {
                res.send("pokemon not found (patch)")
            } else {
                pokemonModel.updateOne({ id: pokeID }, rest, function (err, res) {
                    if (err) console.log(err)
                    console.log(res)
                });
            }
        })
        .catch(err => {
            console.error(err)
            res.json({
                msg: "db reading .. err.  Check with server devs"
            })
        })
    });


    app.delete('/api/v1/pokemon/:id', (req, res) => {
        
        let pokeID = Number(req.params.id);

        pokemonModel.find({
            id: pokeID
        })
        .then(doc => {
            if (doc.length > 0) {
                pokemonModel.deleteOne({
                    id: pokeID
                })
                res.send("poke deleted");
            }
            else {
                res.send("poke not found (deletion)");
            }
        })
    })


});
