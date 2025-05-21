import React, { ChangeEvent, useState, useCallback, useEffect } from "react";
import { Input } from "../ui/input";
import { Search } from 'lucide-react';
import debounce from 'lodash.debounce';
import { getCategories, getMovies } from '@/services/movieAPI';
import { Movie, MovieFilter } from '@/util/types';
import { cn } from "@/lib/utils";

interface SearchBoxProps {
  onMoviesUpdate: (movies: Movie[]) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onMoviesUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedFetchMovies = useCallback(
    debounce(async (query: string, category: string, date: string) => {
      setIsLoading(true);
      try {
        const filters: MovieFilter = {};
        
        // Only add filters if they have values
        if (query.trim()) filters.title = query.trim();
        if (category.trim()) filters.category = category.trim();
        if (date) filters.showDate = date;
        
        const fetchedMovies = await getMovies(filters);
        onMoviesUpdate(fetchedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
        onMoviesUpdate([]); // Reset movies on error
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [onMoviesUpdate]
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newSearch = event.target.value;
    setSearchQuery(newSearch);
    debouncedFetchMovies(newSearch, selectedCategory, selectedDate);
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    debouncedFetchMovies(searchQuery, newCategory, selectedDate);
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    if (newDate) {
      // Convert the date to ISO string format (YYYY-MM-DD)
      const formattedDate = new Date(newDate).toISOString().split('T')[0];
      debouncedFetchMovies(searchQuery, selectedCategory, formattedDate);
    } else {
      debouncedFetchMovies(searchQuery, selectedCategory, '');
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [initialMovies, fetchedCategories] = await Promise.all([
          getMovies(),
          getCategories()
        ]);
        onMoviesUpdate(initialMovies);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        onMoviesUpdate([]); // Reset movies on error
      }
    };

    fetchInitialData();
  }, [onMoviesUpdate]);

  return (
    <div className="m-auto pt-4 w-full max-w-lg flex flex-col justify-center items-center relative group">
      <div className="w-full flex items-center relative">
        <Search 
          size={16} 
          className={cn(
            "absolute right-4",
            isLoading ? "animate-spin text-primary" : "text-darkgray-300"
          )} 
        />
        <Input 
          className={cn(
            "border-darkgray-500 bg-darkgray-800 p-6 text-white text-lg rounded-xl text-center w-full",
            "group-focus-within:rounded-b-none group-focus-within:border-b-0",
            (selectedCategory || selectedDate) && 'rounded-b-none',
            isLoading && "pr-10"
          )}
          placeholder="Search Movies..."
          value={searchQuery}
          onChange={handleInputChange}
        />
      </div>
      <div className={cn(
        "border border-darkgray-500 w-full grid grid-cols-2 gap-1 bg-darkgray-800 rounded-b-xl p-1 transition-all duration-300",
        selectedCategory || selectedDate ? 'max-h-full opacity-100' : 'max-h-0 opacity-0',
        "group-focus-within:max-h-full group-focus-within:opacity-100"
      )}>
        <select 
          className="bg-darkgray-700 text-white p-2 rounded mb-2 h-full" 
          onChange={handleCategoryChange} 
          title="Category Selector"
          value={selectedCategory}
        >
          <option value="">All Categories</option>
          {categories.map((category: string) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input 
          title="Date Selector"
          type="date" 
          className="bg-darkgray-700 text-white p-2 rounded [&::-webkit-calendar-picker-indicator]:invert-[0.8] [&::-webkit-calendar-picker-indicator]:hover:cursor-pointer"
          onChange={handleDateChange}
          value={selectedDate}
          min={new Date().toISOString().split('T')[0]} // Only allow future dates
        />
      </div>
    </div>
  );
};

export default SearchBox;
