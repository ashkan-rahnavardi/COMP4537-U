// // import React, { useEffect, useState } from 'react'
// // import Page from './Page'
// import React from "react";
// // import Pagination from './Pagination';
// // import axios from 'axios'
// function App() {
//   const [data, setData] = React.useState(null);

//   React.useEffect(() => {
//     fetch("/api")
//       .then((res) => res.json())
//       .then((data) => setData(data.message));
//   }, []);

//   console.log("poop");

//   return (
//     <div className="App">
//       <header className="App-header">
//         <p>{!data ? "Loading..." : data}</p>
//       </header>
//     </div>
//   );
// }

// //   const [pokemons, setPokemons] = useState([])

// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [pokemonsPerPage] = useState(10);

// //   useEffect(() => {
// //     axios.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/pokedex.json')
// //       .then(res => res.data)
// //       .then(res => {
// //         setPokemons(res)
// //       })
// //       .catch(err => console.log("err", err))
// //   }, [])

// //   const indexOfLastRecord = currentPage * pokemonsPerPage;
// //   const indexOfFirstRecord = indexOfLastRecord - pokemonsPerPage;
// //   const currentPokemons = pokemons.slice(indexOfFirstRecord, indexOfLastRecord)
// //   const numberOfPages = Math.ceil(pokemons.length / pokemonsPerPage);

// //   return (
// //     <>
// //       < Page currentPokemons={currentPokemons} currentPage={currentPage} />
// //       < Pagination
// //         numberOfPages={numberOfPages}
// //         currentPage={currentPage}
// //         setCurrentPage={setCurrentPage}
// //       />
// //     </>
// //   )
// // }

// export default App