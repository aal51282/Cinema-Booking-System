// routes/movieR.ts
import express from 'express';
import { getMoviesByQuery, addMovie, editMovie, deleteMovie, getMovieById, getAllCategories, getAllRooms, deleteShow, getMovieByShowId } from '../controllers/movieController'; // Adjust the path as needed
import { Movie} from '../models/movie';
import { isAdmin, isAuthenticated } from '../middleware/authM';
import { getShowSeats } from '../controllers/movieController';


// Add this type
type DatabaseMovie = Omit<Movie, 'cast' | 'trailer' | 'reviews' | 'showDates'> & {
    cast: string;
    trailer: string;
    reviews: string;
    showDates: string;
};

const router = express.Router();



router.get('/categories', (req, res) => {
    try {
        const categories = getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get categories'});
    }
});

router.get('/rooms', (req,res) => {
    try {
        const rooms = getAllRooms();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get rooms'});
    }
})

router.get('/showSeats/:showId', getShowSeats);
//Route to add movie  
router.post('/movies', isAuthenticated, isAdmin, (req, res) => {
    try {
        addMovie(req, res);
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: `Error adding movies: ${error.message}` });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

router.put('/movies/:id', (req, res) => {
    req.body.id = parseInt(req.params.id, 10);
    editMovie(req, res);
});

router.delete('/movies/:id', isAuthenticated, isAdmin, (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        deleteMovie(id);
        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: `Error deleting movie: ${error.message}` });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

// Route to get a movie by ID
router.get('/movies/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        //console.log(`Fetching movie with id: ${id}`);
        const movie = getMovieById(id);
        if (movie) {
            console.log('Movie found:', movie);
            const processedMovie: Movie = {
                ...movie,
                cast: JSON.parse(movie.cast || '[]'),
                trailer: JSON.parse(movie.trailer || '{}'),
                reviews: JSON.parse(movie.reviews || '[]'),
            };
            res.status(200).json(processedMovie);
        } else {
            console.log(`No movie found with id: ${id}`);
            res.status(404).json({ message: 'Movie not found' });
        }
    } catch (error) {
        console.error('Detailed error:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: `Error fetching movie: ${error.message}` });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

// New Route to get movies by title, category, and show date
router.get('/searchmovies', async (req, res) => {
    const { title, category, showDate, limit } = req.query;
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : (typeof limit === 'number' ? limit : undefined);

    try {
        const movies = getMoviesByQuery(
            title as string | undefined,
            category as string | undefined,
            showDate as string | undefined,
            parsedLimit
        );
          
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(404).json({ message: 'No movies found matching the criteria' });
        }
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



router.delete('/movies/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        deleteMovie(id); 
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: `Error deleting movie` });
    }
});

router.delete('/movies/:movieId/:showId', isAuthenticated, isAdmin, (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId, 10);
        const showId = parseInt(req.params.showId, 10);

        console.log(movieId, showId)
        
        if (isNaN(movieId) || isNaN(showId)) {
            return res.status(400).json({ message: 'Invalid movie ID or show ID' });
        }

        deleteShow(movieId, showId);
        res.status(204).send();
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: `Error deleting show: ${error.message}` });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

router.get('/shows/:showId/movie', (req, res) => {
    try {
        const showId = parseInt(req.params.showId, 10);
        if (isNaN(showId)) {
            return res.status(400).json({ message: 'Invalid show ID' });
        }
        
        const movie = getMovieByShowId(showId);
        res.status(200).json(movie);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: `Error fetching movie: ${error.message}` });
        } else {
            res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});

export default router;