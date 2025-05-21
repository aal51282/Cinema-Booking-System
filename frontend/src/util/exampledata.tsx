import { Order, Movie, Purchase } from '@/util/types'

const movies:Movie[] = [
  {
    id: 1,
    title: "Top Gun: Sky Strike",
    category: "Action",
    cast: ["Tom Cruise", "Val Kilmer", "Jennifer Connelly"],
    director: "Tony Scott",
    producer: "Jerry Bruckheimer",
    synopsis: "A group of elite pilots must push their limits in a high-stakes aerial mission to protect national security.",
    reviews: [
      { reviewer: "Film Critic A", comment: "A thrilling return to the skies!", rating: 9.0 },
      { reviewer: "Film Critic B", comment: "Heart-pounding action and nostalgia.", rating: 8.7 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/TopGun.102472_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420", "https://www.youtube.com/watch?v=xAR6N9N8e6U"]
    },
    mpaaRating: "PG-13",
    showDates: [
      { date: "2023-10-01", times: ["14:00", "17:00", "20:00"] }
    ],
    releaseDate: "2023-10-15",
    status: "currentlyRunning"
  },
  {
    id: 2,
    title: "Titanic: The Untold Stories",
    category: "Historical Drama",
    cast: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane"],
    director: "James Cameron",
    producer: "20th Century Fox",
    synopsis: "A reimagined tale of untold stories from the Titanic disaster and the survivors' harrowing experiences.",
    reviews: [
      { reviewer: "Film Critic C", comment: "A deeply emotional revisit to the past.", rating: 8.8 },
      { reviewer: "Film Critic D", comment: "Heart-wrenching and beautifully crafted.", rating: 9.0 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/Titanic.mpw.102378_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "PG-13",
    showDates: [
      { date: "2024-09-28", times: ["18:00", "21:00"] }
    ],
    releaseDate: "2023-11-20",
    status: "comingSoon"
  },
  {
    id: 3,
    title: "Scarface: Rise of Power",
    category: "Crime",
    cast: ["Al Pacino", "Michelle Pfeiffer", "Steven Bauer"],
    director: "Brian De Palma",
    producer: "Universal Pictures",
    synopsis: "The gritty rise of Tony Montana and the violent underworld he creates as he rises to power in Miami.",
    reviews: [
      { reviewer: "Film Critic E", comment: "A raw and unflinching portrayal of crime.", rating: 8.5 },
      { reviewer: "Film Critic F", comment: "Al Pacino delivers an iconic performance.", rating: 9.2 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/scarface.mpw.115473_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "R",
    showDates: [
      { date: "2024-09-25", times: ["19:00", "22:00"] }
    ],
    releaseDate: "2024-01-10",
    status: "comingSoon"
  },
  {
    id: 4,
    title: "Back to the Future: Time's Legacy",
    category: "Science Fiction",
    cast: ["Michael J. Fox", "Christopher Lloyd", "Lea Thompson"],
    director: "Robert Zemeckis",
    producer: "Amblin Entertainment",
    synopsis: "Marty McFly returns for a new adventure in time, but this time the stakes are higher as the past threatens the future.",
    reviews: [
      { reviewer: "Film Critic G", comment: "A nostalgic yet refreshing new adventure.", rating: 8.7 },
      { reviewer: "Film Critic H", comment: "Time travel at its best, filled with surprises.", rating: 9.0 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/backtofuture.mpw_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "PG",
    showDates: [
      { date: "2024-09-30", times: ["17:00", "20:00"] }
    ],
    releaseDate: "2023-10-15",
    status: "currentlyRunning"
  },
  {
    id: 5,
    title: "Jurassic Park: New Era",
    category: "Adventure",
    cast: ["Sam Neill", "Laura Dern", "Jeff Goldblum"],
    director: "Steven Spielberg",
    producer: "Universal Pictures",
    synopsis: "Dinosaurs are back, but this time, the stakes are even higher as they roam freely in modern society.",
    reviews: [
      { reviewer: "Film Critic I", comment: "A thrilling, dino-packed adventure.", rating: 8.5 },
      { reviewer: "Film Critic J", comment: "Jurassic Park's legacy continues with epic action.", rating: 9.1 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/jurassicpark.mpw_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "PG-13",
    showDates: [
      { date: "2024-09-22", times: ["14:00", "17:00"] }
    ],
    releaseDate: "2023-11-20",
    status: "currentlyRunning"
  },
  {
    id: 6,
    title: "Pulp Fiction: The Underground Chronicles",
    category: "Crime Drama",
    cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman"],
    director: "Quentin Tarantino",
    producer: "Miramax",
    synopsis: "A deep dive into the lives of Los Angeles criminals as they navigate betrayal, violence, and loyalty.",
    reviews: [
      { reviewer: "Film Critic K", comment: "An unapologetic masterpiece of chaos.", rating: 9.0 },
      { reviewer: "Film Critic L", comment: "Tarantino's best work comes to life again.", rating: 9.4 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/products/pulpfiction.2436_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "R",
    showDates: [
      { date: "2024-10-03", times: ["18:00", "21:00"] }
    ],
    releaseDate: "2024-01-10",
    status: "comingSoon"
  },
  {
    id: 7,
    title: "Interstellar: The Final Frontier",
    category: "Science Fiction",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    director: "Christopher Nolan",
    producer: "Warner Bros.",
    synopsis: "A team of astronauts ventures into space in a race to save humanity from an imminent extinction event.",
    reviews: [
      { reviewer: "Film Critic M", comment: "A visual masterpiece that challenges the mind.", rating: 9.5 },
      { reviewer: "Film Critic N", comment: "Nolan delivers yet another sci-fi epic.", rating: 9.2 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/interstellar-139399_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "PG-13",
    showDates: [
      { date: "2024-09-19", times: ["19:00", "22:00"] }
    ],
    releaseDate: "2023-10-15",
    status: "currentlyRunning"
  },
  {
    id: 8,
    title: "Alien: Dark Horizons",
    category: "Horror",
    cast: ["Sigourney Weaver", "Tom Skerritt", "John Hurt"],
    director: "Ridley Scott",
    producer: "20th Century Fox",
    synopsis: "The crew of the spaceship Nostromo encounters an unknown alien species that begins hunting them one by one.",
    reviews: [
      { reviewer: "Film Critic O", comment: "Chilling and unforgettable.", rating: 9.1 },
      { reviewer: "Film Critic P", comment: "A terrifying ride that redefines sci-fi horror.", rating: 8.9 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/Alien.mpw.114883_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "R",
    showDates: [
      { date: "2024-09-29", times: ["20:00", "22:30"] }
    ],
    releaseDate: "2023-11-20",
    status: "currentlyRunning"
  },
  {
    id: 9,
    title: "Home Alone: Holiday Havoc",
    category: "Comedy",
    cast: ["Macaulay Culkin", "Joe Pesci", "Daniel Stern"],
    director: "Chris Columbus",
    producer: "20th Century Fox",
    synopsis: "Kevin McCallister returns, now as a grown-up, to save his family from burglars once again during a chaotic holiday season.",
    reviews: [
      { reviewer: "Film Critic Q", comment: "Laugh-out-loud moments with heartfelt nostalgia.", rating: 8.0 },
      { reviewer: "Film Critic R", comment: "Home Alone for the new generation.", rating: 8.3 }
    ],
    trailer: {
      picture: "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/homealone.124915_500x749.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "PG",
    showDates: [
      { date: "2024-12-24", times: ["14:00", "17:00"] }
    ],
    releaseDate: "2023-10-15",
    status: "currentlyRunning"
  },
  {
    id: 10,
    title: "Skyfall: New Mission",
    category: "Action",
    cast: ["Daniel Craig", "Javier Bardem", "Naomie Harris"],
    director: "Sam Mendes",
    producer: "Sony Pictures",
    synopsis: "James Bond returns to face a new enemy that threatens to unleash chaos on the world.",
    reviews: [
      { reviewer: "Film Critic S", comment: "Bond at his best.", rating: 9.0 },
      { reviewer: "Film Critic T", comment: "An exhilarating action-packed ride.", rating: 9.3 }
    ],
    trailer: {
      picture: "https://www.movieposters.com/cdn/shop/files/skyfall_c668003e_240x360_crop_center.progressive.jpg",
      video: ["https://www.youtube.com/embed/qSqVVswa420"]
    },
    mpaaRating: "PG-13",
    showDates: [
      { date: "2024-09-14", times: ["15:00", "18:00"] }
    ],
    releaseDate: "2023-11-20",
    status: "currentlyRunning"
  }
];

const orderHistory: Order[] = [
  {
    invoice: "INV-1001",
    movieId: 1,
    dateOrdered: new Date("2024-09-05"),
    dateShowing: new Date("2024-10-01T17:00:00"),
    totalAmount: 15.00,
    paymentMethod: "Visa **** 1234",
  },
  {
    invoice: "INV-1002",
    movieId: 2,
    dateOrdered: new Date("2024-09-07"),
    dateShowing: new Date("2024-09-28T18:00:00"),
    totalAmount: 12.50,
    paymentMethod: "MasterCard **** 5678",
  },
  {
    invoice: "INV-1003",
    movieId: 3,
    dateOrdered: new Date("2024-09-10"),
    dateShowing: new Date("2024-09-25T22:00:00"),
    totalAmount: 18.00,
    paymentMethod: "Visa **** 1234",
  },
  {
    invoice: "INV-1004",
    movieId: 4,
    dateOrdered: new Date("2024-09-12"),
    dateShowing: new Date("2024-09-30T20:00:00"),
    totalAmount: 14.00,
    paymentMethod: "American Express **** 9012",
  },
  {
    invoice: "INV-1005",
    movieId: 5,
    dateOrdered: new Date("2024-09-15"),
    dateShowing: new Date("2024-09-22T17:00:00"),
    totalAmount: 13.50,
    paymentMethod: "Visa **** 3456",
  },
  {
    invoice: "INV-1006",
    movieId: 6,
    dateOrdered: new Date("2024-09-18"),
    dateShowing: new Date("2024-10-03T21:00:00"),
    totalAmount: 16.00,
    paymentMethod: "MasterCard **** 7890",
  },
  {
    invoice: "INV-1007",
    movieId: 7,
    dateOrdered: new Date("2024-09-20"),
    dateShowing: new Date("2024-09-19T19:00:00"),
    totalAmount: 20.00,
    paymentMethod: "Visa **** 2345",
  },
  {
    invoice: "INV-1008",
    movieId: 8,
    dateOrdered: new Date("2024-09-22"),
    dateShowing: new Date("2024-09-29T22:30:00"),
    totalAmount: 15.50,
    paymentMethod: "Visa **** 1234",
  },
  {
    invoice: "INV-1009",
    movieId: 9,
    dateOrdered: new Date("2024-12-01"),
    dateShowing: new Date("2024-12-24T14:00:00"),
    totalAmount: 10.00,
    paymentMethod: "American Express **** 6789",
  },
  {
    invoice: "INV-1010",
    movieId: 10,
    dateOrdered: new Date("2024-09-25"),
    dateShowing: new Date("2024-09-14T18:00:00"),
    totalAmount: 17.00,
    paymentMethod: "Visa **** 5678",
  },
];

const GetMovies = (startIndex: number, endIndex: number) => {
    return movies.filter((_, index) => {
        return index >= startIndex && index < endIndex;
    });
};

const MovieQuery = (query: string): Movie[] => {
  if (!query) {
      return GetMovies(0, 9);
  }

  const lowerCaseQuery = query.toLowerCase();

  return movies.filter(movie => 
      movie.title.toLowerCase().includes(lowerCaseQuery)
  );
};


const GetMovieById = (id: number) => {
  return movies.find(movie => (movie.id == id))
}

const GetAllOrders = (userId: number) => {
  return orderHistory;
}

const GetUserPurchases = (userId: number): Purchase[] => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
  const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return [
    {
      id: 1,
      movieId: 1,
      datePurchased: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      showTime: twoDaysFromNow, // Eligible for refund
      totalAmount: 15.00,
      paymentMethod: "Visa **** 1234",
      seats: ['A1', 'A3'],
    },
    {
      id: 2,
      movieId: 2,
      datePurchased: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      showTime: oneHourFromNow, // Just eligible for refund
      totalAmount: 12.50,
      paymentMethod: "MasterCard **** 5678",
      seats: ['B3'],
    },
    {
      id: 3,
      movieId: 3,
      datePurchased: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      showTime: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now, not eligible
      totalAmount: 18.00,
      paymentMethod: "Visa **** 1234",
      seats: ['C1', 'C2', 'C3'],
    },
    {
      id: 4,
      movieId: 4,
      datePurchased: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      showTime: yesterday, // Past show, not eligible
      totalAmount: 10.00,
      paymentMethod: "American Express **** 9012",
      seats: ['D5'],
    },
    {
      id: 5,
      movieId: 5,
      datePurchased: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      showTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      totalAmount: 13.50,
      paymentMethod: "Visa **** 3456",
      seats: ['E2', 'E3'],
    }
  ];
};

// Export all functions together at the end of the file
export { 
  GetMovies, 
  MovieQuery, 
  GetMovieById, 
  GetAllOrders, 
  GetUserPurchases
};