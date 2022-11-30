import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios'
import './index.css';
import FilteredPagination from './FilteredPagination'
import Search from './Search'


function App() {
  const [data, setData] = React.useState(null);
  // Array representing if pokemon type is checked or not
  const [checkedState, setCheckedState] = useState([]);
  // Array of pokemon types
  const types = useRef([])
  const pokemons = useRef({})
  // const [pokemons, setPokemons] = useState(null);

  // Fetch pokemon types, set checkedState to false for each type, and set types
  async function getPokemonTypes() {
    const result = await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json');
    console.log(result.data);
    types.current = result.data.map(type => type.english);
    setCheckedState(new Array(result.data.length).fill(false))
  }

  async function getPokemons() {
    const result = await axios.get('http://localhost:3001/pokemons');
    pokemons.current = result.data.map(pokemon => pokemon);
    // setPokemons(result.data);
    console.log(pokemons.current);
  }

  // useEffect(() => {
  //   fetch("http://localhost:3001/api")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

  // passing an empty array as a second argument to useEffect will make it run only once
  useEffect(() => {
    getPokemonTypes();
    getPokemons();
  }, [])


  return (
    <>
      <Search types={types} checkedState={checkedState} setCheckedState={setCheckedState} />
      <FilteredPagination types={types} checkedState={checkedState} />
    </>
    // <div className="App">
    //   <h1>{data}</h1>
    // </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App />
);

export default App


