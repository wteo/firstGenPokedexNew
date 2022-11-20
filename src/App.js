import React, { useState, useEffect, Suspense } from 'react';
import { useSelector } from 'react-redux';

import styles from './App.module.css';

import PokedexTitle from './components/PokedexTitle/PokedexTitle';
import PokedexMain from './components/PokemonMain/PokedexMain';
// import PokedexData from './components/PokedexData';
// import PokedexSearch from './components/PokedexSearch/PokedexSearch';
import { fetchData } from './store/fetchData';

const Results = React.lazy(() => import('./components/Results/Results'));
const PokedexData = React.lazy(() => import('./components/PokedexData/PokedexData'));
const PokedexSearch = React.lazy(() => import('./components/PokedexSearch/PokedexSearch'));

function App() {

  // Fetching pokemon data to feed into the Pokedex 
  const [enteredPokemonData, setEnteredPokemonData] = useState({});
  const [isSearched, setIsSearched] = useState(false);

  const { imageLink, speciesName, type1, type2, height, weight } = enteredPokemonData;

  const url = useSelector(state => state.url);

    useEffect(() => {
        fetchData(setEnteredPokemonData, url);
    }, [url]);

  
  // State to hide or show pokemon data
  const [dataButtonIsClicked, setDataButtonIsClicked] = useState(false);

  const dataButtonHandler = () => {
    setDataButtonIsClicked((dataButtonIsClicked) => !dataButtonIsClicked);
    setSearchButtonIsClicked(false);
    setIsSearched(false);
    setIsFetchingData(false);
    setEnteredResults([]);
  }

  // State to hide or show search menu
  const [searchButtonIsClicked, setSearchButtonIsClicked] = useState(false);

  const searchButtonHandler = () => {
    setDataButtonIsClicked(false);
    setIsSearched(false);
    setIsFetchingData(false);
    setEnteredResults([]);
    setSearchButtonIsClicked((searchButtonIsClicked) => !searchButtonIsClicked);
  }

  // States to handle filtered search
  const [enteredResults, setEnteredResults] = useState([]);
  const [isFetchingData, setIsFetchingData] = useState(null);
  const resultsArr = [];

  const enteredSearchHandler = async (searchedValue) => {

    setIsFetchingData(true);

    const enteredSearchValues = {
      type1       : searchedValue.type1,
      type2       : searchedValue.type2,
      speciesName : searchedValue.speciesName
    }

    let i = 1;

    while (i <= 151) {
      const fullURL = `https://pokeapi.co/api/v2/pokemon/${i}`
      const response = await fetch(fullURL);
      const data = await response.json();
      const speciesNameResult = data.name;
      const id = data.id;
      const imageLink = data.sprites.front_default;
      const type1Result = data.types[0].type.name;
      const type2Result = data.types[1]?.type.name;
      i++;

      if (enteredSearchValues.speciesName !== '' && speciesNameResult.includes(enteredSearchValues.speciesName.toLowerCase().trim())) {
        resultsArr.push({speciesNameResult, imageLink, id});
      } else if (enteredSearchValues.speciesName === '') {
        if (enteredSearchValues.type1 === type1Result && enteredSearchValues.type2 === type2Result) {
          resultsArr.push({speciesNameResult, imageLink, id});
        } else if ((enteredSearchValues.type1 === type1Result || enteredSearchValues.type1 === type2Result) && enteredSearchValues.type2 === 'None') {
          resultsArr.push({speciesNameResult, imageLink, id});
        } else if (enteredSearchValues.type1 === 'None') {
          alert ('You must either first enter a value for first type or enter a value for species name.');
          setIsFetchingData(false);
          return;
        } 
      }
    }
    
    if (resultsArr.length > 0) {
      setIsSearched(true);    
      setEnteredResults(resultsArr);
      setIsFetchingData(false);
    } else {
      setIsSearched(true);
      setEnteredResults('No Pokemon found. :-(');
      setIsFetchingData(false);
    }
  };

  return (
    <div className={styles.container}>
      <PokedexTitle />
      <Suspense fallback={<p>Loading...</p>}>
        <PokedexMain 
          imageLink={imageLink} 
          speciesName={speciesName} 
          onButtonData={dataButtonHandler} 
          onButtonSearch={searchButtonHandler} 
        />
        <div className={styles.dropDownNavigation}>
          <PokedexData onTransition={dataButtonIsClicked} type1={type1} type2={type2} height={height} weight={weight} />
          <PokedexSearch onTransition={searchButtonIsClicked} onSearch={enteredSearchHandler}/>
          {isFetchingData && <p>Fetching Data...</p>}
          {isSearched && enteredResults !== 'No Pokemon found. :-(' ? <Results enteredResults={enteredResults}/> : <p>{enteredResults}</p>}
        </div>
      </Suspense>
      <footer>© Wendy Teo 2022</footer>
    </div>
  );
}

export default App;
