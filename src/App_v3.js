

import { useEffect, useState, useRef } from "react";
import StarRating from "./StarRate.js"



const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = "80e49ca6"
export default function App_v2() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null)

  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
            setIsLoading(true);
          setError("");
          const res = await fetch(`http://www.omdbapi.com/?i=tt3896198&apikey=${KEY}&s=${query}`
              , { signal: controller.signal });
              if (!res.ok)
                  throw new Error("Something went wrong with fetching movies!!")
              const data = await res.json();
              if (data.Response === "False") throw new Error("Movie not found!")
                  setMovies(data.Search);
          setError("")
          console.log(data);
          
      }
      catch (err) {
          console.error(err.message);
          if (err.name !== "AbortError") {
              setError(err.message)
          }
      }
      finally {
          setIsLoading(false);
          
      }
  }
      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }
      fetchMovies();
      handleCloseMovie();
      return function () {
          controller.abort();
      }
    }, [query])

//  const [watched, setWatched] = useState([]);
const [watched, setWatched] = useState(function () {
  const storedMovie = localStorage.getItem("watched");
  return JSON.parse(storedMovie)
});

 
  // useEffect(function(){
  //   console.log('After initial render');
  // },[] )
  // useEffect(function(){
  //   console.log('After every render')
  // })

  // useEffect(function(){
  //   console.log("D")
  // },[query])
  // console.log('During render');

  function handleSelectedMovie(id) {
    setSelectedId((selectedId) => selectedId === id ? null : id)
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie])
  }

  useEffect(function () {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched])


  function handleMovieDelete(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }



  

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>

      <Main>
        <Box>
          {/* { isLoading? <Loader/>: <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && <MovieList movies={movies} onSelectedMovie={handleSelectedMovie} />}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (<MovieDetails
            selectedId={selectedId}
            onCloseMovie={handleCloseMovie}
            onAddWatched={handleAddWatched}
            watched={watched}
          />)
            :
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} onDeleteMovie={handleMovieDelete} />
            </>
          }
        </Box>

      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading ....</p>
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  )
}

function Navbar({ children }) {

  return (
    <nav className="nav-bar">
      {children}
    </nav>
  )
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(function () {
    function callback(e){
    
      if(document.activeElement === inputEl.current)
        return;
      if(e.code === "Enter"){
      inputEl.current.focus();
      setQuery("")
      }
    }
    document.addEventListener("keydown", callback);
    return ()=>document.removeEventListener("keydown",callback);
  }, [setQuery])
  // useEffect(function(){
  //   const el = document.querySelector('.search');
  //   console.log(el);
  //   el.focus();
  // },[])
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  )
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}



function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies?.length || 0}</strong> results
    </p>
  )
}
function Main({ children }) {


  return (
    <main className="main">
      {children}
    </main>
  )
}

function Box({ children }) {

  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  )
}
// function WatchedBox() {
//   );
//   const [isOpen2, setIsOpen2] = useState(true);


//   return (
//     <div className="box">
//       <button
//         className="btn-toggle"
//         onClick={() => setIsOpen2((open) => !open)}
//       >
//         {isOpen2 ? "–" : "+"}
//       </button>
//       {isOpen2 && (
//         <>
//          
//         </>
//       )}
//     </div>
//   )
// }


function MovieList({ movies, onSelectedMovie }) {

  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (<Movie onSelectedMovie={onSelectedMovie} movie={movie} key={movie.imdbID} />))}
    </ul>
  )
}
function Movie({ movie, onSelectedMovie }) {
  return (
    <li onClick={() => onSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('');
 const countRef = useRef(0);

 useEffect(()=>{
  if(userRating)countRef.current+=1;
 },[userRating]);

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre, } = movie;
  ;


  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current
    }
    onAddWatched(newWatchedMovie);

    onCloseMovie();
  }

  useEffect(function () {
    function Escape(e) {
      if (e.code === "Escape") {
        onCloseMovie();
        console.log("Closing");
      }
    }
    document.addEventListener("keydown", Escape);
    return function () {
      document.removeEventListener("keydown", Escape)
    }

  }, [onCloseMovie])


  useEffect(function () {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedId])

  useEffect(function () {
    if (!title) return
    document.title = `Movie | ${title}`
    return function () {
      document.title = "usePopcorn"
    }
  }, [title])

  return (

    <div className="details">
      {isLoading ? <Loader /> : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>&larr;</button>
            <img src={poster} alt={`Poster of ${movie.title} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>-
          </header>

          <section>
            <div className="rating">
              {isWatched ? (
                <p>You have already rated the movie with {watchUserRating}
                  <span>⭐</span>
                </p>
              ) : (
                <>
                  <StarRating maxRating={10} size={24} onUserRating={setUserRating} />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>Add to list</button>
                  )}
                </>
              )}
            </div>
            <p><em>{plot}</em></p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )
      }
    </div >
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
          <span>{avgRuntime.toFixed(3)} min</span>
        </p>
      </div>
    </div>
  )
}
function WatchedMoviesList({ watched, onDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} onDeleteMovie={onDeleteMovie} />
      ))}

    </ul>
  )
}

function WatchedMovie({ movie, onDeleteMovie }) {
  return (
    <li >
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.Title}</h3>
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
        <button class="btn-delete" onClick={() => onDeleteMovie(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}