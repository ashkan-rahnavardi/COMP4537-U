import React, { useEffect, useState } from 'react'
import Pokemon from './Pokemon'
function Pokemons() {

  const [pokemons, setPokemons] = useState([])
  const url = "http://localhost:3000/pokemons"
  useEffect(() => {
    fetch(url)
      .then((resp) => { return resp.json() })
      .then((jsonedResp) => { setPokemons(jsonedResp)})
  }, [])

  return (
    <>
      Pokemons Component
      <hr />
      {
        console.log(pokemons)
        // pokemons.map((aPokemon) => {
        // return <Pokemon aPokemon={aPokemon} />
        // })
      }
    </>
  )
}

export default Pokemons