import React from 'react';
import ReactDOM from 'react-dom/client';
import Header from './Header'
import Pokemons from './Pokemons';
import './index.css'
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <Header />
    <Pokemons />
  </>
);