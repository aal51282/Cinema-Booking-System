import { Request, Response } from 'express';
import Database from 'better-sqlite3';
import { Movie } from '../models/movie';  


const db = new Database('./database/cinema.db');

type ShowInfo = {
    showId: number;
    showDate: number; 
    endTime: number; 
    roomId: number
}; 

type DatabaseMovie = Omit<Movie, 'cast' | 'trailer' | 'reviews'> & {
    cast: string;
    trailer: string;
    reviews: string;
    earliestShowTime?: string;
    shows: ShowInfo[];
};


export const getAllCategories = () => {
    try {
        const stmt = db.prepare('SELECT DISTINCT category FROM Movies');
        const categories = stmt.all();
        return categories.map((category: any) => category.category);
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw new Error('Could not retrieve categories');
    }
};

export const getAllRooms = () => {
    try {
        const stmt = db.prepare('SELECT roomId, roomName, capacity FROM Rooms');
        const roomData = stmt.all();
        return roomData.map((room: any) => ({
            roomId: room.roomId,
            roomName: room.roomName,
            capacity: room.capacity
        }));
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw new Error('Could not retrieve rooms');
    }
};

//get showSeats by showId
export const getShowSeats = async (req: Request, res: Response) => {
    const { showId } = req.params; 
    if (!showId) {
        return res.status(400).json({ error: 'Missing showId parameter' });
    }
    try {
        const stmt = db.prepare(`
            SELECT s.seatNumber 
            FROM ShowSeats s 
            WHERE s.showId = ?
        `);
        const seats = stmt.all(showId);
        res.status(200).json(seats);
        //return stmt.all(showId);
    } catch (error) {
        console.error('Error retrieving showSeats:', error);
        res.status(500).json({ error: 'Could not retrieve showSeats' });
    }
};

// Function to add a new movie
export const addMovie = (req: Request, res: Response) => {
    const {movieId, title, category, cast, director, producer, movie_poster, synopsis, reviews, trailer, mpaa_rating, duration, shows } = req.body;
    if (movieId) {
        const existingMovieStmt = db.prepare('SELECT * FROM Movies WHERE id = ?');
        const existingMovie = existingMovieStmt.get(movieId) as DatabaseMovie;

        if(!existingMovie){
            return res.status(404).json({ message: 'Movie not found' });
        }

        const duration = existingMovie.duration; 

        if (shows && Array.isArray(shows)) {
            const requiredShowFrields = ['roomId', 'showDate'];
            const missingShowFields = shows.flatMap(show =>
                requiredShowFrields.filter(field => !show[field]).map(field => `${field} in show ${JSON.stringify(show)}`)
            );
            if (missingShowFields.length > 0) {
                return res.status(400).json({ message: `Missing required show fields: ${missingShowFields.join(',')}` });
            }
            for (const show of shows) {
                const showDateInt = show.showDate;
                const endTimeInt = showDateInt + (duration * 60); 
                const overlappingStmt = db.prepare(`
                    SELECT COUNT(*) AS count 
                    FROM Shows
                    WHERE roomId = ? 
                        AND (
                            (? BETWEEN showDate AND endTime) OR
                            (? BETWEEN showDate AND endTime) OR
                            (showDate BETWEEN ? AND ?) OR
                            (endTime BETWEEN ? AND ?)
                        )
                `);
                //const endTime = new Date(new Date(`${show.showDate} ${show.startTime}`).getTime() + duration * 60000).toISOString();
                const result = overlappingStmt.get(show.roomId, showDateInt, endTimeInt, showDateInt, endTimeInt, showDateInt, endTimeInt) as { count: number};
    
                if (result.count > 0) {
                    return res.status(400).json({ message: `Show overlaps with an existing show in room ${show.roomId} on ${show.showDate}` });
                }
            }

            const showStmt = db.prepare('INSERT INTO Shows (movieId, roomId, showDate, endTime) VALUES (?,?,?,?)');
            shows.forEach(show => {
                const showDateInt = show.showDate;
                const endTimeInt = showDateInt + (duration * 60); 
                showStmt.run(movieId, show.roomId, showDateInt, endTimeInt);
            });
            return res.status(200).json({ message: 'Shows added to existing movie!' });
        } else {
            return res.status(400).json({ message: 'No shows provided to add to the existing movie' });
        }
    } else {
    //check to make sure all fields of new movie are filled before adding 
    const requiredFields = [
        'title',
        'category', 
        'cast',
        'director',
        'producer',
        'movie_poster', 
        'synopsis',
        'reviews',
        'trailer',
        'mpaa_rating',
        'duration'
    ];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Missing required movie fields: ${missingFields.join(', ')}`});
    }

    if (shows && Array.isArray(shows)) {
        console.log(shows)
        const requiredShowFields = ['roomId', 'showDate'];
        const missingShowFields = shows.flatMap(show =>
            requiredShowFields.filter(field => !show[field]).map(field => `${field} in show ${JSON.stringify(show)}`)
        );

        if (missingShowFields.length > 0) {
            return res.status(400).json({ message: `Missing required show fields: ${missingShowFields.map(show => JSON.stringify(show)).join(', ')}` });
        }

        for (const show of shows) {
            const showDateInt = show.showDate;
            const endTimeInt = showDateInt + (duration * 60); 
            if (showDateInt < Date.now()) {
                return res.status(400).json({ message: `Cannot save because at least one of editted showDates are in the past.`})
            }
            const overlappingStmt = db.prepare(`
                SELECT COUNT(*) AS count 
                FROM Shows
                WHERE roomId = ? 
                    AND (
                        (? BETWEEN showDate AND endTime) OR
                        (? BETWEEN showDate AND endTime) OR
                        (showDate BETWEEN ? AND ?) OR
                        (endTime BETWEEN ? AND ?)
                    )
            `);
            //const endTime = new Date(new Date(`${show.showDate} ${show.startTime}`).getTime() + duration * 60000).toISOString();
            const result = overlappingStmt.get(show.roomId, showDateInt, endTimeInt, showDateInt, endTimeInt, showDateInt, endTimeInt) as { count: number};

            if (result.count > 0) {
                return res.status(400).json({ message: `Show overlaps with an existing show in room ${show.roomId} on ${new Date(show.showDate).toLocaleDateString()} ${new Date(show.showDate).toLocaleTimeString()}` });
            }
        }

    }

    try {
      const stmt = db.prepare(
        'INSERT INTO Movies (title, synopsis, category, mpaa_rating, cast, director, producer, movie_poster, trailer, reviews, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(
        title,
        synopsis,
        category,
        mpaa_rating,
        JSON.stringify(cast),  
        director,
        producer,
        movie_poster,
        JSON.stringify(trailer),
        JSON.stringify(reviews),
        duration
    );
    const movieId = result.lastInsertRowid;

    
   
    if (shows && Array.isArray(shows)) {
        const showStmt = db.prepare(
            'INSERT INTO Shows (movieId, roomId, showDate, endTime) VALUES (?, ?, ?, ?)'
        );
        shows.forEach(show => {
           const showDateInt = parseInt(show.showDate, 10);
           const endTimeInt = showDateInt + duration * 60000;
           showStmt.run(movieId, show.roomId, showDateInt, endTimeInt);
        });
    }
    res.status(201).json({ message: 'Movie and any shows were added successfully' });
    } catch (error) {
        console.error('Error adding movie:', error);
        res.status(500).json({ message: 'Could not add movie' });
    }
};
};

//edit movie function
export const editMovie = (req: Request, res: Response) => {
    const { id, title, category, cast, director, producer, movie_poster, synopsis, reviews, trailer, mpaa_rating, duration, shows } = req.body; 

    const requiredMovieFields = [
        'title',
        'synopsis',
        'category',
        'mpaa_rating',
        'cast',  
        'director',
        'producer',
        'movie_poster',
        'trailer',
        'reviews',
        'duration', 
        'id'
    ];
    const missingMovieFields = requiredMovieFields.filter(field => !req.body[field] );
    if (missingMovieFields.length > 0) {
        return res.status(400).json({ message: `Missing required movie fields: ${missingMovieFields.join(', ')}`});
    }

    try {
        //update movie details 
        const movieStmt = db.prepare(
            'UPDATE Movies SET title = ?, synopsis = ?, category = ?, mpaa_rating = ?, cast = ?, director = ?, producer = ?, movie_poster = ?, trailer = ?, reviews = ?, duration = ? WHERE id = ?'
        );
        movieStmt.run(
            title, 
            synopsis, 
            category, 
            mpaa_rating, 
            JSON.stringify(cast), 
            director, producer, movie_poster, 
            JSON.stringify(trailer), 
            JSON.stringify(reviews),
            duration, 
            id
        );

        if (shows && Array.isArray(shows)) {
            const requiredShowFields = ['showDate', 'roomId'];
            const missingShowFields = shows.flatMap(show =>{
                return requiredShowFields.filter(field => !show[field]).map(field => `${field} in show ${JSON.stringify(show)}`);
            });
            if (missingShowFields.length > 0) {
                return res.status(400).json({ message: `Missing required show fields: ${missingShowFields.join(', ')}` });
            }
            

            const checkForOverlappingShows = (roomId: number, showDateInt: number, endTimeInt: number) => {
                const overlappingStmt = db.prepare(`
                    SELECT COUNT(*) AS count 
                    FROM Shows
                    WHERE roomId = ? 
                        AND (
                            (? BETWEEN showDate AND endTime) OR
                            (? BETWEEN showDate AND endTime) OR
                            (showDate BETWEEN ? AND ?) OR
                            (endTime BETWEEN ? AND ?)
                        )
                `);
                return overlappingStmt.get(roomId, showDateInt, endTimeInt, showDateInt, endTimeInt, showDateInt, endTimeInt) as { count: number};
            };

            for (const show of shows) {
                const showDateInt = show.showDate; 
                const endTimeInt = showDateInt + (duration * 60);
                if (!show.showId) {
                    const showDateInt = show.showDate; 
                    if (showDateInt < Date.now()) {
                        return res.status(400).json({ message: `Cannot save because at least one of editted showDates are in the past.`})
                    }
                    const overlapCheck = checkForOverlappingShows(show.roomId, showDateInt, endTimeInt);
                    if(overlapCheck.count > 0) {
                        return res.status(400).json({ message: `Show overlaps with an existing show in room ${show.roomId} on ${new Date(show.showDate).toLocaleDateString()} ${new Date(show.showDate).toLocaleTimeString()}` });

                    }
                }
                if(show.showId) {
                    const updateShowStmt = db.prepare('UPDATE Shows SET roomId = ?, showDate = ?, endTime = ? WHERE showId = ?');
                    updateShowStmt.run(show.roomId, showDateInt, endTimeInt, show.showId);
                } else {
                    const showStmt = db.prepare('INSERT INTO Shows (movieId, roomId, showDate, endTime) VALUES (?, ?, ?, ?)');
                    showStmt.run(id, show.roomId, showDateInt, endTimeInt);
                }
            }
    }
        res.status(200).json({ message: 'Movie updated successfully' });
    } catch (error) {
        console.error('Error editing movie:', error);
        res.status(500).json({ message: 'Could not edit movie' });
    }
};

// Function to delete a movie
export const deleteMovie = (id: number) => {
    try {
        const deleteShowStmt = db.prepare('DELETE FROM Shows WHERE movieId = ?');
        deleteShowStmt.run(id);
        const stmt = db.prepare('DELETE FROM Movies WHERE id = ?');
        stmt.run(id);
    } catch (error) {
        console.error('Error deleting movie:', error);
        throw new Error('Could not delete movie');
    }
};


export const getMovieById = (id: number): DatabaseMovie | undefined => {
    try {
        const stmt = db.prepare(`
            SELECT m.*
            FROM Movies m
            WHERE m.id = ?
            `);
        const results = stmt.get(id) as DatabaseMovie;

        if (!results) {
            return undefined;
        }
     
        const shows = db.prepare(`
            SELECT s.showId, s.showDate, s.endTime, s.roomId
            FROM Shows s
            WHERE s.movieId = ?
        `);
        const showsResult = shows.all(id) as ShowInfo[];

        return {
            ...results,
            shows: showsResult,
        };
    } catch (error) {
        console.error('Error fetching movie:', error);
        throw new Error('Could not retrieve movie');
    }
};



// Function to get movies by query with optional parameters
export const getMoviesByQuery = (title?: string, category?: string, showDate?: string, limit?: number): Movie[] => {
    try {
        let query = `
            SELECT m.*,
                s.showId, 
                s.showDate,
                s.endTime, 
                s.roomId 
            FROM Movies m
            LEFT JOIN Shows s ON m.id = s.movieId
            WHERE 1=1
        `;
        const params: any[] = [];
        
        if (title) {
            query += ' AND LOWER(m.title) LIKE LOWER(?)';
            params.push(`%${title}%`);
        }

        if (category) {
            query += ' AND LOWER(m.category) LIKE LOWER(?)';
            params.push(`%${category}%`);
        }

        if (showDate) {
            // Convert the date string to Unix timestamp for the start and end of the day
            const selectedDate = new Date(showDate);
            const startOfDay = Math.floor(selectedDate.getTime() / 1000);
            const endOfDay = startOfDay + (24 * 60 * 60); // Add 24 hours in seconds

            query += ' AND s.showDate >= ? AND s.showDate < ?';
            params.push(startOfDay * 1000, endOfDay * 1000);
        }

        query += ' GROUP BY m.id';

        if (limit) {
            query += ' LIMIT ?';
            params.push(limit);
        }

        const stmt = db.prepare(query);
        const results = stmt.all(...params) as (DatabaseMovie & { showId: number; showDate: number; endTime: number; roomId: number })[];
        // console.log('Raw results from database:', results);
        const parseJson = <T>(jsonString: string, defaultValue: T): T => {
            try {
                return JSON.parse(jsonString) as T;
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return defaultValue; 
            }
        };
        //group shows by movie 
        const moviesMap: { [key: number]: Movie & {shows: ShowInfo[]; soonestShow: number } } = {};
        results.forEach(result => {
            const { id, title, synopsis, category, mpaa_rating, cast, director, producer, movie_poster, trailer, reviews, duration, showDate } = result; 
            const parsedCast = parseJson<string[]>(cast, []); 
            const parsedTrailer = parseJson<{ picture: string; video: string[] }>(trailer, { picture: '', video: [] }); 
            const parsedReviews = parseJson<{ reviewer: string; comment: string; rating: number }[]>(reviews, []); 

            if (!moviesMap[id]) {
                moviesMap[id] = {
                    id, 
                    title,  
                    synopsis, 
                    category, 
                    mpaa_rating, 
                    cast: parsedCast, 
                    director, 
                    producer, 
                    movie_poster, 
                    trailer: parsedTrailer, 
                    reviews: parsedReviews,
                    duration, 
                    shows: [], 
                    soonestShow: Infinity
                };
            }
            
            //const showDateTime = new Date(showDate);
            //add show info with formatting 
            moviesMap[id].shows.push({
                showId: result.showId,
                showDate: showDate,
                endTime: result.endTime,
                roomId: result.roomId,
            });
        
        if(showDate !== null ) {
            moviesMap[id].soonestShow = Math.min(moviesMap[id].soonestShow, showDate);
        }
    
});

            
        const orderedMovies = Object.values(moviesMap)
            .sort((a, b) => {
                const aSoonestShow = a.soonestShow === Infinity ? Infinity : a.soonestShow;
                const bSoonestShow = b.soonestShow === Infinity ? Infinity : b.soonestShow;

                if (aSoonestShow === Infinity && bSoonestShow === Infinity) return 0; 
                if (aSoonestShow === Infinity) return 1; 
                if (bSoonestShow === Infinity) return -1;
                return aSoonestShow - bSoonestShow; 
            })
            .slice(0, limit);


        return orderedMovies;

    } catch (error) {
        console.error('Error fetching movies by query:', error); 
        throw new Error('Could not retrieve movies by query');
    }
};

export const getMovieByShowId = (showId: number) => {
    try {
        const stmt = db.prepare(`
            SELECT 
                m.*,
                s.showId,
                s.showDate,
                s.endTime,
                s.roomId
            FROM Movies m
            JOIN Shows s ON m.id = s.movieId
            WHERE s.showId = ?
        `);

        const result = stmt.get(showId) as DatabaseMovie & {
            showId: number;
            showDate: number;
            endTime: number;
            roomId: number;
        };

        if (!result) {
            throw new Error('Movie not found for given show ID');
        }

        // Extract show details
        const show = {
            showId: result.showId,
            showDate: result.showDate,
            endTime: result.endTime,
            roomId: result.roomId
        };

        // Parse JSON strings
        const movie = {
            id: result.id,
            title: result.title,
            category: result.category,
            cast: JSON.parse(result.cast),
            director: result.director,
            producer: result.producer,
            movie_poster: result.movie_poster,
            synopsis: result.synopsis,
            reviews: JSON.parse(result.reviews),
            trailer: JSON.parse(result.trailer),
            mpaa_rating: result.mpaa_rating,
            duration: result.duration,
            shows: [show]
        };

        return movie;

    } catch (error) {
        console.error('Error fetching movie by show ID:', error);
        throw new Error('Could not retrieve movie by show ID');
    }
};


// Add this function with the other exports
export const deleteShow = (movieId: number, showId: number) => {
    try {
        // First verify the show exists and belongs to the movie
        const verifyStmt = db.prepare('SELECT showId FROM Shows WHERE movieId = ? AND showId = ?');
        const show = verifyStmt.get(movieId, showId);
        
        if (!show) {
            throw new Error('Show not found or does not belong to the specified movie');
        }

        // Delete the show
        const deleteStmt = db.prepare('DELETE FROM Shows WHERE showId = ? AND movieId = ?');
        deleteStmt.run(showId, movieId);
    } catch (error) {
        console.error('Error deleting show:', error);
        throw new Error('Could not delete show');
    }
};


