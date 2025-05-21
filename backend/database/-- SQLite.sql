-- SQLite
DROP TABLE IF EXISTS Users;
CREATE TABLE IF NOT EXISTS Users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- This should be stored encrypted
    isAdmin INTEGER DEFAULT 0, -- 0 for false User and 1 for true Admin
    accountStatus TEXT CHECK(accountStatus IN ('Active', 'Inactive')) NOT NULL DEFAULT 'Inactive', -- To handle account activation
    phone_number TEXT, -- Optional but could be included in personal information
    billingAddress TEXT, -- To store address (JSON or separate fields for street, city, state, etc.)
    isPromoted BOOLEAN DEFAULT 0, -- To track if the user is subscribed to promotions
    usedPromotions TEXT, -- To store the promotion codes used by the user
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Automatically store account creation time
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatically store the last update time
    -- verification_code TEXT, -- Store verification code for email confirmation
    -- password_reset_token TEXT, -- For the password reset functionality
    -- password_reset_expiry TIMESTAMP -- To ensure reset tokens expire
);
SELECT name FROM sqlite_master WHERE type='table';

-- To verify inserted data
SELECT * FROM Users;