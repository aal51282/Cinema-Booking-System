-- SQLite
DROP TABLE IF EXISTS Shows;

CREATE TABLE IF NOT EXISTS Shows (
    showId INTEGER PRIMARY KEY AUTOINCREMENT,
    movieId INTEGER NOT NULL,
    roomId INTEGER NOT NULL, -- Foreign key to Rooms 
    showDate INTEGER NOT NULL,
    endTime INTEGER NOT NULL,
    FOREIGN KEY (movieId) REFERENCES Movies(id),
    FOREIGN KEY (roomId) REFERENCES Rooms(roomId)
);

INSERT INTO Shows (movieId, roomId, showDate, endTime)
VALUES 
     ((SELECT id FROM Movies WHERE title = 'Top Gun: Sky Strike'), 
     1, strftime('%s', '2024-10-15'), strftime('%s', '2024-10-15 20:30:00')),
    ((SELECT id FROM Movies WHERE title = 'Alien: Dark Horizons'), 
     2, strftime('%s', '2024-10-16'), strftime('%s', '2024-10-16 21:00:00')),
    ((SELECT id FROM Movies WHERE title = 'Home Alone: Holiday Havoc'), 
     3, strftime('%s', '2024-10-17'), strftime('%s', '2024-10-17 19:30:00'));

SELECT * FROM Shows;
-- To verify the tables exist
SELECT name FROM sqlite_master WHERE type='table';

-- To verify inserted data
SELECT * FROM Shows;

