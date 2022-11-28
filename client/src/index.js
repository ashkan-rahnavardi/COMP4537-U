import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import FilteredPagination from './FilteredPagination'
import Search from './Search'
import axios from 'axios'


function Main() {
  // Array representing if pokemon type is checked or not
  const [checkedState, setCheckedState] = useState([]);
  // Array of pokemon types
  const types = useRef([])

  // Fetch pokemon types, set checkedState to false for each type, and set types
  async function getPokemonTypes() {
    const result = await axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json');
    types.current = result.data.map(type => type.english);
    setCheckedState(new Array(result.data.length).fill(false))
  }

  // passing an empty array as a second argument to useEffect will make it run only once
  useEffect(() => {
    getPokemonTypes();
  }, [])

  return (
    <>
      <Search types={types} checkedState={checkedState} setCheckedState={setCheckedState} />
      <FilteredPagination types={types} checkedState={checkedState} />
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Main />
);