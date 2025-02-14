import { useEffect, useState , useRef } from "react";
import StarRating from './StarRating' ;
import {useMovies} from './useMovies'
import { useLocalStorageState } from "./useLocalStorageState";
import {useKey} from './useKey'

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "d06642d5"; //f84fc31d

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  const{movies , loading , error} = useMovies(query , handleCloseMovie)

  //const [watched, setWatched] = useState(function() {
  //  const storedValue = localStorage.getItem('watched')
   // return JSON.parse(storedValue) ;
 // });

  const [watched , setWatched] = useLocalStorageState ([] , 'watched')
  function handleSelectMovie(id) {
    setSelectedID((selectedID)=>(id=== selectedID ?null :id)) ;
  }
  function handleCloseMovie() {
    setSelectedID(null);
  }
  function AddWatchedMovie (movie){
    //const isPresent = watched.some(e=>e.imdbID === movie.imdbID) 
    //if (!isPresent) {
    setWatched((e)=> [...e , movie])
    
  }
  function RemoveWatchedMovie(id){
    setWatched(e=>e.filter(movie =>movie.imdbID !== id));
  }
  
  
  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />{" "}
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/*loading ? <Loader /> : <MovieList movies={movies} />*/}
          {loading && <Loader />}
          {!error && !loading && (
            <MovieList movies={movies} handleSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              handleCloseMovie={handleCloseMovie}
              AddWatchedMovie= {AddWatchedMovie}
              watched = {watched}
              
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList watched={watched} RemoveWatchedMovie={RemoveWatchedMovie} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />

      {children}
    </nav>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputEL = useRef(null) ; // making a reference
  useKey('Enter' , function () {
    if(document.activeElement === inputEL.current) return;
    inputEL.current.focus() ; // focusing the input element since the refence is now refering to the dom element of the input field
    setQuery("")
  })
  
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref= {inputEL}                               //assign the reference to the input element
    />
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function Loader() {
  return <p className="loader">Loading ...</p>;
}
/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedList watched={watched} />
        </>
      )}
    </div>
  );
}
*/
function MovieList({ movies, handleSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectMovie={handleSelectMovie}
        />
      ))}
    </ul>
  );
}
function Movie({ movie, handleSelectMovie }) {
  return (
    <li onClick={() => handleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function MovieDetails({ selectedID, handleCloseMovie ,AddWatchedMovie ,watched }) {
  const [loading , setLoading] = useState(false);
  const [movie, setMovie] = useState({});
  const [userRating , setUserRating] = useState('')
  const countRef = useRef(0)
  useKey('Escape' , handleCloseMovie)
  useEffect(function () {
   if (userRating) countRef.current = countRef.current + 1
  } , [userRating])
  const {
    Title : title ,
    Year : year ,
    Poster : poster ,
    Runtime : runtime , 
    imdbRating ,
    Plot : plot , 
    Released : released , 
    Actors : actors , 
    Director : director , 
    Genre : genre , 
  } = movie ;
  const isWatched = watched.map(movie => movie.imdbID).includes(selectedID)
  const watchedUserRating = watched.find(movie=> movie.imdbID ===selectedID)?.userRating ;
  function handleAdd () {
    const newWatchedMovie = {
      imdbID : selectedID ,
      title ,
      year , 
      poster , 
      imdbRating : Number(imdbRating),
      runtime : Number(runtime.split(' ').at(0)) ,
      userRating ,
      countRatingDecisions : countRef.current

    }
    AddWatchedMovie(newWatchedMovie)
    handleCloseMovie()
  }
  
  
  
  useEffect(function () {
    async function getMovieDetails() {
      setLoading(true)
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`
      );
      const data = await res.json(); 
      setMovie(data) ; 
      setLoading(false)
    }
    getMovieDetails();
  }, [selectedID]);
  useEffect(function(){
    if (!title) return ;
    document.title = `movie | ${title}` ;
    return function () {
      document.title = "usePopcorn" ;
    }
  } , [title])
  return (
    <div className="details">
      { loading ? <Loader /> :
      <>
      <header>
      <button className="btn-back" onClick={() => handleCloseMovie()}>
        &larr;
      </button> 
      <img src={poster} alt={`Poster of ${movie} movie`} />
      <div className="details-overview">
        <h2>{title}</h2>
        <p>{released} &bull; {runtime}</p>
        <p>{genre}</p>
        <p><span>⭐</span>{imdbRating} IMDB rating</p>
      </div>
      </header>
      <section>
        <div className="rating">
        {!isWatched ? (<> <StarRating MaxRating={10} size={24} onSetRating= {setUserRating} />
        {userRating > 0 &&(<button className="btn-add" onClick={handleAdd}>+ Add to list</button>)}</> ): (
        <p>you rated this movie {watchedUserRating} ⭐</p>)
        }
        </div>
        <p><em>{plot}</em></p>
        <p>starring {actors}</p>
        <p>directed by {director}</p>
      </section>
       </>  }
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedList({ watched ,RemoveWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} RemoveWatchedMovie={RemoveWatchedMovie} />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie ,RemoveWatchedMovie }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=>RemoveWatchedMovie(movie.imdbID)} > X </button>
      </div>
    </li>
  );
}
