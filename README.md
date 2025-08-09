# Campus Marketplace

A full-stack web application for campus resale and rental marketplace built with React.js and Python Flask.

## Features

- User Authentication (Login/Register)
- Item Listing with Images/Videos
- Fixed Price and Bidding System
- Search and Filter Listings
- Rental System
- Chat/Messaging System

## Tech Stack

- Frontend: React.js with Bootstrap
- Backend: Python Flask
- Database: SQLite
- File Storage: Local Storage

## Setup Instructions

### Backend Setup

1. Install Python dependencies:
```bash
pip install flask flask-sqlalchemy flask-login flask-cors pillow
```

2. Navigate to the backend directory and run:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the frontend directory
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Project Structure

```
campus-marketplace/
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   └── static/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── README.md
```
