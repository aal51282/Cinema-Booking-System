CREATE TABLE IF NOT EXISTS Movies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    synopsis TEXT NOT NULL,
    category TEXT NOT NULL,
    mpaa_rating TEXT,
    status TEXT, -- will be either currently running or coming soon
    cast TEXT NOT NULL, -- Store as JSON string
    director TEXT NOT NULL,
    producer TEXT NOT NULL,
    movie_poster TEXT,
    trailer TEXT NOT NULL,
    reviews TEXT NOT NULL, -- Store as JSON string
    showDates TEXT NOT NULL, -- Store as JSON string
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Movies (title, synopsis, category, mpaa_rating, status, cast, director, producer, movie_poster, trailer, reviews, showDates)
VALUES 
('Top Gun: Sky Strike', 
 'A new generation of fighter pilots takes to the skies in a high-stakes mission to protect global security.', 
 'Action', 'PG-13', 'Coming Soon', 
 '["Tom Cruise", "Miles Teller", "Jennifer Connelly"]', 
 'Joseph Kosinski', 
 'Jerry Bruckheimer', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/TopGun.102472_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/TopGunTrailer.jpg", "video": ["https://youtu.be/qSqVVswa420?si=WX25IaOHLRuisPzc"] }', 
 '[{"reviewer": "User1", "comment": "High-octane!", "rating": 5}]', 
 '[{"date": "2024-12-01", "times": ["18:00", "21:00"]}]'),

('Titanic: The Untold Stories', 
 'Dive deep into the lives of the passengers and crew aboard the ill-fated Titanic, uncovering new stories of bravery and tragedy.', 
 'Drama', 'PG-13', 'Coming Soon', 
 '["Kate Winslet", "Leonardo DiCaprio"]', 
 'James Cameron', 
 'Jon Landau', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/Titanic.mpw.102378_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/TitanicTrailer.jpg", "video": ["https://youtu.be/kfy04TtC2f0?si=Fjpsm1ISBRM0lULY"] }', 
 '[{"reviewer": "User2", "comment": "Heart-wrenching!", "rating": 5}]', 
 '[{"date": "2024-11-01", "times": ["15:00", "18:00"]}]'),

('Scarface: Rise of Power', 
 'The rise of Tony Montana from a small-time criminal to a drug kingpin, with a fresh look at his early life.', 
 'Crime', 'R', 'Coming Soon', 
 '["Al Pacino", "Steven Bauer"]', 
 'Brian De Palma', 
 'Martin Bregman', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/scarface.mpw.115473_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/ScarfaceTrailer.jpg", "video": ["https://youtu.be/R1aDzESLtCU?si=kZXwk0sT2gx12rlC"] }', 
 '[{"reviewer": "User3", "comment": "A gritty tale!", "rating": 5}]', 
 '[{"date": "2024-10-05", "times": ["20:00", "23:00"]}]'),

('Back to the Future: Time''s Legacy', 
 'Marty McFly and Doc Brown must prevent a paradox that threatens to unravel the fabric of time itself.', 
 'Sci-Fi', 'PG', 'Currently Running', 
 '["Michael J. Fox", "Christopher Lloyd"]', 
 'Robert Zemeckis', 
 'Steven Spielberg', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/backtofuture.mpw_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/BTTFTrailer.jpg", "video": ["https://youtu.be/kKkag5TyLDk?si=t1uQgEFjUU-DC7L0"] }', 
 '[{"reviewer": "User4", "comment": "Nostalgic and thrilling!", "rating": 5}]', 
 '[{"date": "2024-09-30", "times": ["14:00", "17:00"]}]'),

('Jurassic Park: New Era', 
 'Dinosaurs roam the Earth once more, but this time humanity must find a way to coexist or face extinction.', 
 'Adventure', 'PG-13', 'Coming Soon', 
 '["Chris Pratt", "Bryce Dallas Howard"]', 
 'Colin Trevorrow', 
 'Frank Marshall', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/jurassicpark.mpw_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/JurassicParkTrailer.jpg", "video": ["https://youtu.be/aS9UhwviJko?si=LZ8wiADWWqMOobEp"] }', 
 '[{"reviewer": "User5", "comment": "Dinosaur action at its best!", "rating": 4}]', 
 '[{"date": "2024-10-15", "times": ["12:00", "15:00"]}]'),

('Pulp Fiction: The Underground Chronicles', 
 'Follow the intertwining lives of criminals, hitmen, and a mysterious briefcase in a reimagined tale.', 
 'Crime', 'R', 'Currently Running', 
 '["John Travolta", "Samuel L. Jackson"]', 
 'Quentin Tarantino', 
 'Lawrence Bender', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/products/pulpfiction.2436_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/PulpFictionTrailer.jpg", "video": ["https://youtu.be/s7EdQ4FqbhY?si=cZ8JKOMdP91UFfN-"] }', 
 '[{"reviewer": "User6", "comment": "Masterpiece of dialogue!", "rating": 5}]', 
 '[{"date": "2024-09-25", "times": ["19:00", "22:00"]}]'),

('Interstellar: The Final Frontier', 
 'A team of astronauts embarks on a mission beyond the stars to save Earth from a global crisis.', 
 'Sci-Fi', 'PG-13', 'Coming Soon', 
 '["Matthew McConaughey", "Anne Hathaway"]', 
 'Christopher Nolan', 
 'Emma Thomas', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/interstellar-139399_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/InterstellarTrailer.jpg", "video": ["https://youtu.be/7S5TDrAWBd8?si=zBzqsd_AAFBztJiw"] }', 
 '[{"reviewer": "User7", "comment": "A mind-bending journey!", "rating": 5}]', 
 '[{"date": "2024-09-27", "times": ["14:00", "17:00", "20:00"]}]'),

('Alien: Dark Horizons', 
 'A new chapter in the Alien saga, as a crew faces a deadlier version of the xenomorph species.', 
 'Horror', 'R', 'Coming Soon', 
 '["Sigourney Weaver", "Michael Biehn"]', 
 'Ridley Scott', 
 'Walter Hill', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/Alien.mpw.114883_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/AlienTrailer.jpg", "video": ["https://youtu.be/HlkIKFDPABs?si=C9fqheR8LpFHXh-h"] }', 
 '[{"reviewer": "User8", "comment": "Terrifying and intense!", "rating": 5}]', 
 '[{"date": "2024-12-05", "times": ["18:00", "21:00"]}]'),

('Home Alone: Holiday Havoc', 
 'Kevin McCallister returns, this time protecting his house from a new gang of holiday thieves.', 
 'Comedy', 'PG', 'Coming Soon', 
 '["Macaulay Culkin", "Joe Pesci"]', 
 'Chris Columbus', 
 'Mark Radcliffe', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/homealone.124915_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/HomeAloneTrailer.jpg", "video": ["https://youtu.be/Bb4Mp_NwAls?si=Dn47EhDYUYLljbrn"] }', 
 '[{"reviewer": "User9", "comment": "Festive fun for all ages", "rating": 4}]', 
 '[{"date": "2024-11-15", "times": ["16:00", "19:00"]}]');

('Interstellar: The Final Frontier', 
 'A team of astronauts embarks on a mission beyond the stars to save Earth from a global crisis.', 
 'Sci-Fi', 'PG-13', 'Currently Running', 
 '["Matthew McConaughey", "Anne Hathaway"]', 
 'Christopher Nolan', 
 'Emma Thomas', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/interstellar-139399_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/InterstellarTrailer.jpg", "video": ["https://www.youtube.com/watch?v=trailerInterstellar"] }', 
 '[{"reviewer": "User7", "comment": "A mind-bending journey!", "rating": 5}]', 
 '[{"date": "2024-09-27", "times": ["14:00", "17:00", "20:00"]}]'),

('Alien: Dark Horizons', 
 'A new chapter in the Alien saga, as a crew faces a deadlier version of the xenomorph species.', 
 'Horror', 'R', 'Coming Soon', 
 '["Sigourney Weaver", "Michael Biehn"]', 
 'Ridley Scott', 
 'Walter Hill', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/Alien.mpw.114883_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/AlienTrailer.jpg", "video": ["https://www.youtube.com/watch?v=trailerAlien"] }', 
 '[{"reviewer": "User8", "comment": "Terrifying and intense!", "rating": 5}]', 
 '[{"date": "2024-12-05", "times": ["18:00", "21:00"]}]'),

('Home Alone: Holiday Havoc', 
 'Kevin McCallister returns, this time protecting his house from a new gang of holiday thieves.', 
 'Comedy', 'PG', 'Coming Soon', 
 '["Macaulay Culkin", "Joe Pesci"]', 
 'Chris Columbus', 
 'Mark Radcliffe', 
 'https://cdn.shopify.com/s/files/1/0057/3728/3618/files/homealone.124915_500x749.jpg', 
 '{ "picture": "https://cdn.shopify.com/s/files/1/0057/3728/3618/files/HomeAloneTrailer.jpg", "video": ["https://www.youtube.com/watch?v=trailerHomeAlone"] }', 
 '[{"reviewer": "User9", "comment": "Festive fun for all ages", "rating": 4}]', 
 '[{"date": "2024-11-15", "times": ["16:00", "19:00"]}]'),
 
 ('Love in the City',
'A romantic tale of two strangers who find love amidst the hustle and bustle of urban life.',
'Romance', 'PG-13', 'Currently Running',
'["Jennifer Aniston", "Ryan Gosling"]',
'Sophie Turner',
'Robert White',
'https://example.com/movie_poster3.jpg',
'{ "picture": "https://example.com/trailer_pic3.jpg", "video": ["https://www.youtube.com/watch?v=trailer3"] }',
'[{"reviewer": "User3", "comment": "Heartwarming story!", "rating": 5}]',
'[{"date": "2024-09-25", "times": ["16:00", "19:00"]}]');

CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- This should be stored encrypted
    isAdmin TEXT CHECK(role IN ('user', 'admin')) DEFAULT 'user', -- Role could be 'user' or 'admin'
    account_status TEXT CHECK(status IN ('Active', 'Inactive')) NOT NULL DEFAULT 'Inactive', -- To handle account activation
    phone_number TEXT, -- Optional but could be included in personal information
    billing_address TEXT, -- To store address (JSON or separate fields for street, city, state, etc.)
    isPromoted BOOLEAN DEFAULT FALSE, -- To track if the user is subscribed to promotions
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically store account creation time
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically store the last update time
    verification_code TEXT, -- Store verification code for email confirmation
    password_reset_token TEXT, -- For the password reset functionality
    password_reset_expiry TIMESTAMP -- To ensure reset tokens expire
);
-- Sample data
INSERT INTO USERS (
    firstName, lastName, email, password, isAdmin, account_status, phone_number, billing_address, isPromoted, verification_code, password_reset_token, password_reset_expiry
) VALUES 
('John', 'Doe', 'john.doe@example.com', 'encryptedpassword1', 'user', 'Active', '555-1234', '{"street": "123 Elm St", "city": "Athens", "state": "GA"}', TRUE, 'verif123', NULL, NULL),
('Jane', 'Smith', 'jane.smith@example.com', 'encryptedpassword2', 'admin', 'Inactive', '555-5678', '{"street": "456 Oak St", "city": "Atlanta", "state": "GA"}', FALSE, 'verif456', 'resettoken456', '2024-10-15 12:00:00');
('Alice', 'Johnson', 'alice.johnson@example.com', 'encryptedpassword3', 'user', 'Active', '555-9012', '{"street": "789 Maple St", "city": "Savannah", "state": "GA"}', TRUE, 'verif789', NULL, NULL),
('Bob', 'Williams', 'bob.williams@example.com', 'encryptedpassword4', 'user', 'Inactive', '555-3456', '{"street": "101 Pine St", "city": "Macon", "state": "GA"}', FALSE, 'verif101', 'resettoken101', '2024-10-20 10:30:00'),
('Carol', 'Davis', 'carol.davis@example.com', 'encryptedpassword5', 'admin', 'Active', '555-7890', '{"street": "202 Cedar St", "city": "Augusta", "state": "GA"}', FALSE, 'verif202', NULL, NULL),
('David', 'Martinez', 'david.martinez@example.com', 'encryptedpassword6', 'user', 'Inactive', '555-4567', '{"street": "303 Birch St", "city": "Columbus", "state": "GA"}', TRUE, 'verif303', 'resettoken303', '2024-11-01 09:45:00'),
('Eve', 'Brown', 'eve.brown@example.com', 'encryptedpassword7', 'user', 'Active', '555-6543', '{"street": "404 Redwood St", "city": "Athens", "state": "GA"}', FALSE, 'verif404', NULL, NULL),
('Frank', 'Taylor', 'frank.taylor@example.com', 'encryptedpassword8', 'admin', 'Active', '555-4321', '{"street": "505 Cypress St", "city": "Valdosta", "state": "GA"}', TRUE, 'verif505', NULL, NULL);

CREATE TABLE IF NOT EXISTS Payment_cards (
    card_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL, -- Foreign key to reference the USERS table
    card_type TEXT NOT NULL CHECK(card_type IN ('Visa', 'MasterCard', 'Amex')), -- Ensure card type is one of the accepted values
    cardNumber TEXT NOT NULL, -- Card number should be encrypted
    cardHolderName TEXT NOT NULL, -- Name on the card
    expirationDate TEXT NOT NULL, -- Stored as MM/YY
    billing_address TEXT NOT NULL, -- Can be in JSON format or separate fields (street, city, state, zip)
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically records the creation date
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically records the last update
    FOREIGN KEY (user_id) REFERENCES USERS(user_id) -- Ensures the card belongs to a valid user
);
INSERT INTO PAYMENT_CARDS (user_id, card_type, card_number, cardholder_name, expiration_date, billing_address) VALUES
(1, 'Visa', 'encrypted_card_number_1', 'John Doe', '12/25', '{"street": "123 Elm St", "city": "Athens", "state": "GA", "zip": "30605"}'),
(1, 'MasterCard', 'encrypted_card_number_2', 'John Doe', '10/23', '{"street": "123 Elm St", "city": "Athens", "state": "GA", "zip": "30605"}'),
(2, 'Amex', 'encrypted_card_number_3', 'Jane Smith', '08/24', '{"street": "456 Maple Ave", "city": "Atlanta", "state": "GA", "zip": "30303"}');
 
 SELECT name FROM sqlite_master WHERE type='table';
 SELECT * FROM Movies;
 SELECT * FROM Users;
 SELECT * FROM Payment_cards;
