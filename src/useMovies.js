import { useEffect, useState } from "react";
const KEY = "d06642d5"; //f84fc31d
export function useMovies (query , callback) {
  const [movies, setMovies] = useState([]); 
  const [loading, setIsLoading] = useState([false]);
  const [error, setError] = useState("");
    useEffect(
        function () {
            callback?.() ;
          const controller = new AbortController()
          async function fetchMovies() {
            try {
              setIsLoading(true);
              setError("");
              const res = await fetch(
                `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
              , 
              {signal : controller.signal ,});
              if (!res.ok) {
                throw new Error("Something went wrong with fetching movies");
              }
              const Data = await res.json();
    
              if (Data.Response === "False") {
                throw new Error("Movie not Found");
              }
              setMovies(Data.Search);
              setError("")
            } catch (err) {
              console.error(err.message);
              if (err.name !== "AbortError"){
              setError(err.message);
              }
            } finally {
              setIsLoading(false);
            }
          }
          if (query.length < 3) {
            setMovies([]);
            setError([""]);
            return;
          }
          //handleCloseMovie()
          fetchMovies();
          return function () {
            controller.abort() ;
          }
        },
        [query ]
      );
      return {movies , loading , error}
}