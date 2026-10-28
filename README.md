# TaskFlow – MERN Task Management App

TaskFlow helps users manage projects, organize daily tasks, and stay on top of deadlines through a clean and responsive interface.

## Features
- User registration and login with JWT authentication
- Dashboard with task statistics and upcoming deadlines
- Create, edit, delete, and complete tasks
- Set task priorities, statuses, and due dates
- Organize tasks into projects and track progress
- Search, filter, sort, and paginate tasks
- Manage profile details and change password
- Secure user-specific data access

## Tech Stack
- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **API:** REST APIs with Axios

## Getting Started

**Prerequisites:** Node.js and MongoDB (local installation or Atlas).

### 1. Clone the repository
```bash
git clone https://github.com/ommeena20/taskFlow.git
cd taskFlow
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file using `.env.example` and configure `MONGO_URI` and `JWT_SECRET`.

```bash
npm run dev
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
```

Configure the frontend environment using `.env.example`, then run:

```bash
npm run dev
```

Open the local URL shown in the terminal.

## API Overview
- **Auth:** Register, login, logout, and current user
- **Tasks:** Create, view, update, delete, and complete tasks
- **Projects:** Create and manage projects and their tasks
- **Profile:** View and update user information

## Future Improvements
- Team collaboration and task sharing
- Email reminders for upcoming deadlines
- Drag-and-drop task organization
