-- SQLite
-- SQLite
DROP TABLE IF EXISTS Movies;
CREATE TABLE IF NOT EXISTS Movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    synopsis TEXT NOT NULL,
    category TEXT NOT NULL,
    mpaa_rating TEXT,
    cast TEXT NOT NULL, -- Store as JSON string
    director TEXT NOT NULL,
    producer TEXT NOT NULL,
    movie_poster TEXT,
    trailer TEXT NOT NULL,
    reviews TEXT NOT NULL, -- Store as JSON string
    duration INTEGER NOT NULL,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Movies (title, synopsis, category, mpaa_rating, cast, director, producer, movie_poster, trailer, reviews, duration)
VALUES 
('Top Gun: Sky Strike', 
 'A new generation of fighter pilots takes to the skies in a high-stakes mission to protect global security.', 
 'Action', 'PG-13',  
 '["Tom Cruise", "Miles Teller", "Jennifer Connelly"]', 
 'Joseph Kosinski', 
 'Jerry Bruckheimer', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/TopGun.102472_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/TopGunTrailer.jpg", "video": ["https://youtu.be/qSqVVswa420?si=WX25IaOHLRuisPzc"] }', 
 '[{"reviewer": "User1", "comment": "High-octane!", "rating": 5}]', 120), 
 

('Titanic: The Untold Stories', 
 'Dive deep into the lives of the passengers and crew aboard the ill-fated Titanic, uncovering new stories of bravery and tragedy.', 
 'Drama', 'PG-13',  
 '["Kate Winslet", "Leonardo DiCaprio"]', 
 'James Cameron', 
 'Jon Landau', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/Titanic.mpw.102378_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/TitanicTrailer.jpg", "video": ["https://youtu.be/kfy04TtC2f0?si=Fjpsm1ISBRM0lULY"] }', 
 '[{"reviewer": "User2", "comment": "Heart-wrenching!", "rating": 5}]', 175), 
 

('Scarface: Rise of Power', 
 'The rise of Tony Montana from a small-time criminal to a drug kingpin, with a fresh look at his early life.', 
 'Crime', 'R', 
 '["Al Pacino", "Steven Bauer"]', 
 'Brian De Palma', 
 'Martin Bregman', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/scarface.mpw.115473_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/ScarfaceTrailer.jpg", "video": ["https://youtu.be/R1aDzESLtCU?si=kZXwk0sT2gx12rlC"] }', 
 '[{"reviewer": "User3", "comment": "A gritty tale!", "rating": 5}]', 180), 
 

('Back to the Future: Time''s Legacy', 
 'Marty McFly and Doc Brown must prevent a paradox that threatens to unravel the fabric of time itself.', 
 'Sci-Fi', 'PG', 
 '["Michael J. Fox", "Christopher Lloyd"]', 
 'Robert Zemeckis', 
 'Steven Spielberg', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/backtofuture.mpw_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/BTTFTrailer.jpg", "video": ["https://youtu.be/kKkag5TyLDk?si=t1uQgEFjUU-DC7L0"] }', 
 '[{"reviewer": "User4", "comment": "Nostalgic and thrilling!", "rating": 5}]', 115),

('Jurassic Park: New Era', 
 'Dinosaurs roam the Earth once more, but this time humanity must find a way to coexist or face extinction.', 
 'Adventure', 'PG-13', 
 '["Chris Pratt", "Bryce Dallas Howard"]', 
 'Colin Trevorrow', 
 'Frank Marshall', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/jurassicpark.mpw_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/JurassicParkTrailer.jpg", "video": ["https://youtu.be/aS9UhwviJko?si=LZ8wiADWWqMOobEp"] }', 
 '[{"reviewer": "User5", "comment": "Dinosaur action at its best!", "rating": 4}]', 160),

('Pulp Fiction: The Underground Chronicles', 
 'Follow the intertwining lives of criminals, hitmen, and a mysterious briefcase in a reimagined tale.', 
 'Crime', 'R', 
 '["John Travolta", "Samuel L. Jackson"]', 
 'Quentin Tarantino', 
 'Lawrence Bender', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/products/pulpfiction.2436_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/PulpFictionTrailer.jpg", "video": ["https://youtu.be/s7EdQ4FqbhY?si=cZ8JKOMdP91UFfN-"] }', 
 '[{"reviewer": "User6", "comment": "Masterpiece of dialogue!", "rating": 5}]', 165),

('Interstellar: The Final Frontier', 
 'A team of astronauts embarks on a mission beyond the stars to save Earth from a global crisis.', 
 'Sci-Fi', 'PG-13', 
 '["Matthew McConaughey", "Anne Hathaway"]', 
 'Christopher Nolan', 
 'Emma Thomas', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/interstellar-139399_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/InterstellarTrailer.jpg", "video": ["https://youtu.be/7S5TDrAWBd8?si=zBzqsd_AAFBztJiw"] }', 
 '[{"reviewer": "User7", "comment": "A mind-bending journey!", "rating": 5}]', 180),

('Alien: Dark Horizons', 
 'A new chapter in the Alien saga, as a crew faces a deadlier version of the xenomorph species.', 
 'Horror', 'R', 
 '["Sigourney Weaver", "Michael Biehn"]', 
 'Ridley Scott', 
 'Walter Hill', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/Alien.mpw.114883_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/AlienTrailer.jpg", "video": ["https://youtu.be/HlkIKFDPABs?si=C9fqheR8LpFHXh-h"] }', 
 '[{"reviewer": "User8", "comment": "Terrifying and intense!", "rating": 5}]', 180),

('Home Alone: Holiday Havoc', 
 'Kevin McCallister returns, this time protecting his house from a new gang of holiday thieves.', 
 'Comedy', 'PG', 
 '["Macaulay Culkin", "Joe Pesci"]', 
 'Chris Columbus', 
 'Mark Radcliffe', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/homealone.124915_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/HomeAloneTrailer.jpg", "video": ["https://youtu.be/Bb4Mp_NwAls?si=Dn47EhDYUYLljbrn"] }', 
 '[{"reviewer": "User9", "comment": "Festive fun for all ages", "rating": 4}]', 120),

('Interstellar: The Final Frontier', 
 'A team of astronauts embarks on a mission beyond the stars to save Earth from a global crisis.', 
 'Sci-Fi', 'PG-13', 
 '["Matthew McConaughey", "Anne Hathaway"]', 
 'Christopher Nolan', 
 'Emma Thomas', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/interstellar-139399_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/InterstellarTrailer.jpg", "video": ["https://www.youtube.com/watch?v=trailerInterstellar"] }', 
 '[{"reviewer": "User7", "comment": "A mind-bending journey!", "rating": 5}]', 180),

('Alien: Dark Horizons', 
 'A new chapter in the Alien saga, as a crew faces a deadlier version of the xenomorph species.', 
 'Horror', 'R', 
 '["Sigourney Weaver", "Michael Biehn"]', 
 'Ridley Scott', 
 'Walter Hill', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/Alien.mpw.114883_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/AlienTrailer.jpg", "video": ["https://www.youtube.com/watch?v=trailerAlien"] }', 
 '[{"reviewer": "User8", "comment": "Terrifying and intense!", "rating": 5}]', 175),

('Home Alone: Holiday Havoc', 
 'Kevin McCallister returns, this time protecting his house from a new gang of holiday thieves.', 
 'Comedy', 'PG', 
 '["Macaulay Culkin", "Joe Pesci"]', 
 'Chris Columbus', 
 'Mark Radcliffe', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/homealone.124915_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/HomeAloneTrailer.jpg", "video": ["https://www.youtube.com/watch?v=trailerHomeAlone"] }', 
 '[{"reviewer": "User9", "comment": "Festive fun for all ages", "rating": 4}]', 145);
 


SELECT name FROM sqlite_master WHERE type='table';
 SELECT * FROM Movies;