# 🌙 Cosmigo

A web application that gamifies the Pomodoro technique to make productivity more engaging and fun.

---

## ✨ Features

- ⏱️ Pomodoro timer with gamification elements  
- 👤 User accounts stored in **MySQL**  
- 🖥️ Frontend built with **Vue 3** using **PrimeVue**, **Quill**, and **Pinia**  
- ⚙️ Backend powered by **Node.js** and **Express**  
- 🐳 **Docker** support for fast and consistent setup  


---

## ⚙️ Setup Guide

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>

2. MySQL connection

You’ll find the MySQL connection configuration in the backend.

Make sure your database is running before starting the backend.

3. Install dependencies

Run the following commands in both the frontend and backend folders:

npm install

If needed, also install in frontend:

npm install primevue quill pinia

Backend:
npm install express

4. Database setup

Run all SQL commands found in the provided DB file to create the necessary tables:

db.sql

5. Create a user

Use Insomnia (or Postman) to create a user by sending a POST request to your backend’s user endpoint, for example:

POST http://localhost:3000/api/users

Include the required fields:
{
    "userName": "user",
    "userEmail": "user@test.com",
    "userLevel": "1",
    "userExperience": "0"
}

6. Run with Docker (optional)

If Docker is configured:

docker-compose up --build

This will spin up containers for both backend and database.

7. Start the application

Start frontend:

npm run dev

Start backend:
node app.js

Access the app in your browser at http://localhost:5173 (or whatever port Vue runs on).

✅ Done!

Your Pomodoro Gamification App is now running locally.
Stay productive and have fun while working! ☕🔥

