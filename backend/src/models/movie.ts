// models/movie.ts
// export interface Review {
//     reviewer: string; 
//     comment: string; 
//     rating: number; 
// }
export interface Movie {
    id: number; // Optional for new movies
    title: string;
    category: string;
    //status: string; should be deleted from db as well 
    cast: string[]; // JSON string
    director: string;
    producer: string;
    movie_poster: string; 
    synopsis: string;
    reviews: {reviewer: string; comment: string; rating: number}[];
    trailer: { picture: string; video: string[] }; // JSON string
    mpaa_rating: string;
    duration: number;
    soonestShow?: number;
}
