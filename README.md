# cv-management-platform

## Overview
This project includes both frontend and backend components. Below are the steps to run the project and the dependencies used.

## Prerequisites
- Node.js
- npm
- Python
- pip

## Backend Setup
1. Navigate to the backend directory:
    ```sh
    cd backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up the environment variables:
    
   create a file .env and write this : DATABASE_URL="postgresql://postgres:your_password@localhost:5432/your_db_name?schema=public"

4. Run the backend server:
    ```sh
    nest start
    ```
ps if you encounter some errors it's probably due to missing libs so you gotta copy the error and ask gpt to give you the command for them.

## Frontend Setup
1. Navigate to the frontend directory:
    ```sh
    cd frontend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Run the frontend server:
    ```sh
    npm start
    ```

same thing here if you encounter problems it's due to libs not installed like material ui do the same as you did with backend and copy the error test to gpt to give you the commands to run.

## FileServer Setup
you know this better than me

## Dependencies
### Backend
- NestJS
- Prisma

### Frontend
- React
- Material UI

### FileServer


## Running the Project
1. Start the backend server.
2. Start the frontend server.
3. Start the file server.

