import { Movie, MovieFilter } from '@/util/types';
import axios from 'axios';
import { api } from './baseAPI';

export const getMovies = async (filters: MovieFilter = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.title?.trim()) params.append('title', filters.title.trim());
        if (filters.category?.trim()) params.append('category', filters.category.trim());
        if (filters.showDate) params.append('showDate', filters.showDate);
        if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
        if (filters.offset !== undefined) params.append('offset', filters.offset.toString());

        const response = await api.get('/searchmovies', { params });
        if (response.status === 404) {
            return [];
        }
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                return [];
            }
            console.error('Error fetching movies:', error);
        }
        return [];
    }
};

export const deleteMovie = async (movieId: number) => {
    try {
        await api.delete(`/movies/${movieId}`);
    } catch (error) {
        alert('Unable to delete movie. Please try again later.');
        throw error;
    }
};

export const deleteShow = async (movieId: number, showId: number) => {
    try {
        await api.delete(`/movies/${movieId}/${showId}`);
    } catch (error) {
        alert('Unable to delete show time. Please try again later.');
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        alert('Unable to fetch movie categories. Please try again later.');
        return [];
    }
};

export const getAllRooms = async () => {
    try {
        const response = await api.get('/rooms');
        return response.data;
    } catch (error) {
        alert('Unable to fetch theater rooms. Please try again later.');
        return [];
    }
};

export const getShowSeats = async (showId:string) => {
    try {
        const response = await api.get(`/showSeats/${showId}`);
        console.log(response);
        return response.data;
    } catch (error) {
        alert('Unable to fetch theater rooms. Please try again later.');
        return [];
    }
};

export const addMovie = async (movieData: any) => {
    try {
        const response = await api.post('/movies', movieData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else if (error.response?.status === 400) {
                alert('Please check all required fields are filled correctly.');
            } else {
                alert('Unable to add movie. Please try again later.');
            }
        } else {
            alert('An unexpected error occurred while adding the movie.');
        }
        throw error;
    }
};

export const editMovie = async (movieId: number, movieData: any) => {
    try {
        const response = await api.put(`/movies/${movieId}`, movieData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else if (error.response?.status === 400) {
                alert('Please check all required fields are filled correctly.');
            } else if (error.response?.status === 404) {
                alert('Movie not found.');
            } else {
                alert('Unable to edit movie. Please try again later.');
            }
        } else {
            alert('An unexpected error occurred while editing the movie.');
        }
        throw error;
    }
};

export const getMovieById = async (id: number) => {
    try {
        const response = await api.get(`/movies/${id}`);
        const movie = response.data;
        
        // Parse JSON strings, but handle cases where they might already be objects or arrays
        movie.cast = typeof movie.cast === 'string' ? movie.cast.split(', ') : movie.cast;
        movie.reviews = typeof movie.reviews === 'string' ? JSON.parse(movie.reviews) : movie.reviews;
        movie.trailer = typeof movie.trailer === 'string' ? JSON.parse(movie.trailer) : movie.trailer;
        movie.showDates = typeof movie.showDates === 'string' ? JSON.parse(movie.showDates) : movie.showDates;
        
        return movie;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                alert('Movie not found.');
            } else {
                alert('Unable to fetch movie details. Please try again later.');
            }
        } else {
            alert('An unexpected error occurred while fetching the movie.');
        }
        throw error;
    }
};

export const getMovieByShowId = async (showId: number) => {
    try {
        const response = await api.get(`/shows/${showId}/movie`);
        const movie = response.data as Movie;
        
        // Parse JSON strings if they haven't already been parsed by the backend
        movie.cast = typeof movie.cast === 'string' ? JSON.parse(movie.cast) : movie.cast;
        movie.reviews = typeof movie.reviews === 'string' ? JSON.parse(movie.reviews) : movie.reviews;
        movie.trailer = typeof movie.trailer === 'string' ? JSON.parse(movie.trailer) : movie.trailer;
        
        return movie;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                throw new Error('Movie not found for this show.');
            } else {
                throw new Error('Unable to fetch movie details. Please try again later.');
            }
        } else {
            throw new Error('An unexpected error occurred while fetching the movie.');
        }
    }
};

export default api;
