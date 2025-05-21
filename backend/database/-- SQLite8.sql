-- SQLite
DROP TABLE IF EXISTS Shows;

CREATE TABLE IF NOT EXISTS Shows (
    showId INTEGER PRIMARY KEY AUTOINCREMENT,
    movieId INTEGER NOT NULL,
    roomId INTEGER NOT NULL, -- Foreign key to Rooms 
    showDate TIMESTAMP NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    FOREIGN KEY (movieId) REFERENCES Movies(id),
    FOREIGN KEY (roomId) REFERENCES Rooms(roomId)
);

INSERT INTO Shows (movieId, roomId, showDate, startTime, endTime)
VALUES 
     ((SELECT id FROM Movies WHERE title = 'Top Gun: Sky Strike'), 1, '2024-10-15', '18:30', '20:30'),
     ((SELECT id FROM Movies WHERE title = 'Alien: Dark Horizons'), 2, '2024-10-16', '20:00', '22:00'),
     ((SELECT id FROM Movies WHERE title = 'Home Alone: Holiday Havoc'), 3, '2024-10-17', '21:00', '23:00');

-- To verify the tables exist
SELECT name FROM sqlite_master WHERE type='table';

-- To verify inserted data
SELECT * FROM Shows;

