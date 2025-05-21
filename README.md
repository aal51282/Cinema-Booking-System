# Cinema E-Booking System

## Project Overview

The Cinema E-Booking System is a web-based application that allows users to view movie information, book tickets, and select seats online. It provides a comprehensive solution for cinema management and customer interaction.

## Key Features

- User registration and authentication
- Movie browsing and searching
- Ticket booking with seat selection
- Online payment processing
- Admin panel for managing movies, users, and promotions
- Email notifications for promotions and booking confirmations
- Order history for registered users
- Responsive web design for various devices

## Technology Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express.js
- Database: MySQL
- Authentication: JWT (JSON Web Tokens)
- Styling: Tailwind CSS
- State Management: React Context API
- HTTP Client: Axios

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm (v8 or later)
- MySQL (v8 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/aal51282/Cinema-Booking-System
   ```

2. Navigate to the project directory:
   ```
   cd Cinema-Booking-System
   ```

3. Install dependencies for both frontend and backend:
   ```
   cd frontend && pnpm install
   cd ../backend && pnpm install
   ```

4. Set up the database:
   - Create a MySQL database named `cinema_booking`
   - Update the database configuration in `backend/.env`

5. Start the backend server:
   ```
   cd backend && pnpm dev
   ```

6. Start the frontend development server:
   ```
   cd frontend && pnpm dev
   ```

7. Open your browser and visit `http://localhost:3000`

## Development Process

This project follows a hybrid incremental model combining Waterfall and Agile methodologies:

- Overall project planning follows the Waterfall model
- Development is organized into sprints, following Agile practices
- Prototypes are used for UI design to gather feedback
- Testing is incorporated throughout the development process

## Contributing

We welcome contributions to improve the Cinema E-Booking System!


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
