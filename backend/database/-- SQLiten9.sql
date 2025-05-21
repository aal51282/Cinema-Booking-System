-- SQLite
DROP TABLE IF EXISTS Promotions;

CREATE TABLE IF NOT EXISTS Promotions (
    promotionId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    discountPercentage DECIMAL(5, 2) NOT NULL,
    startDate TIMESTAMP NOT NULL,      
    endDate TIMESTAMP NOT NULL,        
    isSent BOOLEAN DEFAULT 0,     -- To track if promotion has been sent
    sendTime TEXT DEFAULT '10:00:00' -- Time to send the promotion
);
INSERT INTO Promotions (title, description, discountPercentage, startDate, endDate)
VALUES 
('Summer Sale', 'Get 20% off on all tickets', 20.00, '2024-06-01 00:00:00', '2024-08-31 23:59:59'),
('Holiday Special', '15% off on weekend shows', 15.00, '2024-12-01 00:00:00', '2024-12-31 23:59:59'),
('Student Discount', '10% off for students', 10.00, '2024-09-01 00:00:00', '2025-11-30 23:59:59');

SELECT name FROM sqlite_master WHERE type='table';
 SELECT * FROM Promotions;