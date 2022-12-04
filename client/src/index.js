import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from 'axios'
import './index.css';
import FilteredPagination from './FilteredPagination'
import Search from './Search'
import Login from './pages/Login';
import Register from './pages/Register';


function App() {
  const [data, setData] = React.useState(null);
  // Array representing if pokemon type is checked or not
  const [checkedState, setCheckedState] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  // Array of pokemon types
  const types = useRef([])
  const pokemons = useRef({})

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

  // passing an empty array as a second argument to useEffect will make it run only once
  useEffect(() => {
    getPokemonTypes();
    getPokemons();
  }, [])

  function admin() {
    setIsAdmin(true);
  }

  useEffect(() => {
    console.log(isAdmin);
  }, [isAdmin])

  let baseAPI = ( 
      <>
        <Search types={types} checkedState={checkedState} setCheckedState={setCheckedState} />
        <FilteredPagination types={types} checkedState={checkedState} />
      </>
  )


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login admin={admin}/>} />
        <Route index element={<Login admin={admin}/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/api" element={baseAPI} />
      </Routes>
    </BrowserRouter>
    // <>
      // <Search types={types} checkedState={checkedState} setCheckedState={setCheckedState} />
      // <FilteredPagination types={types} checkedState={checkedState} />
    // </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <App />
);

export default App


