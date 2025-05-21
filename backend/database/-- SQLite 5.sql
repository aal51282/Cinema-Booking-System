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
INSERT INTO Shows (showId, movieId, roomId, showDate, showTime, endDate)
VALUES 
     ((SELECT id FROM Movies WHERE title = 'Top Gun: Sky Strike'), 1, '2024-10-15', '18:30', '2024-10-15'),
     ((SELECT id FROM Movies WHERE title = 'Alien: Dark Horizons'), 2, '2024-10-16', '20:00', '2024-10-16'),
     ((SELECT id FROM Movies WHERE title = 'Home Alone: Holiday Havoc'), 3, '2024-10-17', '21:00', '2024-10-17');
