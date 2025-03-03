# Overview

This Express-based API server for a restaurant provides routes for managing products, blogs, users, orders, sales, categories, and discounts. It includes authentication middleware, a materialized view update scheduler, and API documentation using Swagger.

## Features
- **User Authentication** (Middleware-protected routes)
- **Product Management** (CRUD operations)
- **Blog Management** (CRUD operations)
- **User Management** (CRUD operations)
- **Order Management** (CRUD operations)
- **Sales Tracking**
- **Category & Discount Handling**
- **Materialized View Update Job** (Scheduled update)
- **API Documentation** (Swagger UI)

## Installation
### Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) database running
- `.env` file with the required configurations

### Steps
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and configure it:
   ```sh
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the server:
   ```sh
   npm start
   ```
## API Documentation
API documentation is available at:
```
http://localhost:5000/api-docs
```
Swagger UI is used for API documentation.

## License
This project is licensed under the MIT License.

---
### Author
Developed by **Your Name**.

