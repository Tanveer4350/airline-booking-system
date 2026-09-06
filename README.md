# ✈️ Airline Booking System

A full-stack **Airline Booking System** developed as a **Database Management Systems (DBMS) project** using React, Django REST Framework, and PostgreSQL.

The application simulates a real-world airline reservation platform where users can search for flights, check availability, select seats, and manage their bookings through an interactive web interface.

---

## 🌐 Live Demo

🔗 **Live Application:** https://airline-frontend-a1ns.onrender.com/

---

## 📌 Project Overview

The Airline Booking System was developed to demonstrate how **DBMS concepts can be integrated into a real-world full-stack application**.

The system manages different entities involved in airline reservations, including:

* 👤 Users
* ✈️ Flights
* 💺 Seats
* 🎫 Bookings
* 🧑‍💼 Passengers
* 💳 Payment/Booking information

The React frontend communicates with the Django REST API, while Django handles the business logic and PostgreSQL manages the relational data.

### 🔄 Application Flow

```text
User
  │
  ▼
React Frontend
  │
  │ REST API
  ▼
Django Backend
  │
  │ Database Queries
  ▼
PostgreSQL Database
```

---

# 🚀 Features

## 👤 User Authentication

* User registration
* User login
* User-specific data
* Authentication-based access
* Secure backend communication

## ✈️ Flight Search

Users can:

* Search for available flights
* Select source and destination
* View flight details
* Check available seats
* View flight schedules

## 💺 Seat Selection

The system provides an interactive seat-selection experience.

Features include:

* Available seats
* Occupied seats
* Selected seat indication
* Prevention of duplicate seat bookings
* Database-backed seat availability

## 🎫 Flight Booking

Users can:

* Select a flight
* Enter passenger information
* Select seats
* Confirm bookings
* View booking details

## 📋 Booking Management

Users can view their reservations and retrieve relevant booking information from the database.

---

# 🗄️ DBMS Implementation

Since this project was developed as a **DBMS project**, database design and data management are a core part of the system.

### Main Entities

```text
USER
 │
 ├──────────────┐
 │              │
 ▼              ▼
PASSENGER     BOOKING
                 │
                 ▼
               FLIGHT
                 │
                 ▼
                SEAT
```

### Database Concepts Used

* Relational database design
* Primary keys
* Foreign keys
* Entity relationships
* One-to-many relationships
* Data integrity
* Constraints
* Normalization
* CRUD operations
* SQL queries
* Database-backed validation
* Referential integrity

The database ensures that relationships between users, flights, seats, passengers, and bookings remain consistent.

---

# 🏗️ System Architecture

```text
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│  • Login / Register         │
│  • Flight Search            │
│  • Seat Selection           │
│  • Booking Interface        │
│  • Booking Management       │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│       Django Backend        │
│                             │
│  • Authentication           │
│  • Business Logic           │
│  • API Endpoints             │
│  • Validation                │
│  • Database Operations       │
└──────────────┬──────────────┘
               │
               │ SQL / ORM
               ▼
┌─────────────────────────────┐
│       PostgreSQL            │
│                             │
│  • Users                    │
│  • Flights                  │
│  • Seats                    │
│  • Passengers               │
│  • Bookings                 │
└─────────────────────────────┘
```

---

# 🛠️ Technology Stack

| Technology               | Purpose                        |
| ------------------------ | ------------------------------ |
| ⚛️ React.js              | Frontend development           |
| 🐍 Python                | Backend programming            |
| 🎯 Django                | Backend framework              |
| 🔗 Django REST Framework | REST API development           |
| 🐘 PostgreSQL            | Relational database            |
| 📡 REST API              | Frontend-backend communication |
| 🔧 Git                   | Version control                |
| 🐙 GitHub                | Source code management         |
| ▲ Vercel                 | Frontend deployment            |
| 🚀 Render                | Backend deployment             |

---

# 📁 Project Structure

```text
airline-booking-system/
│
├── backend/
│   │
│   ├── manage.py
│   ├── requirements.txt
│   │
│   ├── project/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── ...
│   │
│   └── apps/
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       ├── urls.py
│       └── ...
│
├── frontend/
│   │
│   ├── package.json
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   │
│   └── public/
│
├── .gitignore
└── README.md
```

> The exact folder structure may vary depending on the implementation.

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/airline-booking-system.git
cd airline-booking-system
```

---

# 🐍 Backend Setup

Navigate to the backend:

```bash
cd backend
```

### Create a Virtual Environment

```bash
python -m venv venv
```

### Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

# 🗄️ Database Configuration

Make sure PostgreSQL is installed and running.

Create a PostgreSQL database for the project.

Configure your database credentials using environment variables.

Example:

```env
DB_NAME=airline_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

> ⚠️ Never commit passwords, API keys, or other secrets to GitHub.

---

# 🔄 Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

# 👨‍💻 Run Django Backend

```bash
python manage.py runserver
```

The backend will normally be available at:

```text
http://127.0.0.1:8000/
```

---

# ⚛️ Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173/
```

---

# 🔐 Environment Variables

Create a `.env` file where required.

Example frontend configuration:

```env
VITE_API_URL=http://127.0.0.1:8000
```

For production:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

Do not commit `.env` files containing sensitive credentials.

---

# 🌍 Deployment

The project is designed to be deployed using separate frontend and backend services.

### Frontend

**Vercel**

```text
React Application
       │
       ▼
    Vercel
```

### Backend

**Render**

```text
Django REST API
       │
       ▼
    Render
```

### Database

**PostgreSQL**

```text
Django
  │
  ▼
PostgreSQL
```

---

# 🔌 API Communication

The frontend communicates with the Django backend using REST APIs.

Typical operations include:

```text
Frontend
   │
   ├── Authentication
   │
   ├── Flight Search
   │
   ├── Seat Availability
   │
   ├── Booking
   │
   └── Booking Retrieval
   │
   ▼
Django REST API
   │
   ▼
PostgreSQL
```

---

# 🧪 Testing the Application

Before deployment, verify:

### Authentication

* [ ] User registration works
* [ ] Login works
* [ ] Invalid credentials are handled

### Flights

* [ ] Flight search works
* [ ] Flight information is displayed correctly
* [ ] Availability is accurate

### Seats

* [ ] Available seats can be selected
* [ ] Occupied seats cannot be selected
* [ ] Duplicate seat booking is prevented

### Bookings

* [ ] Booking can be created
* [ ] Booking information is stored
* [ ] User can view bookings

### Deployment

* [ ] Frontend connects to production backend
* [ ] CORS is configured correctly
* [ ] Environment variables are configured
* [ ] Production database connection works

---

# 🎯 Learning Objectives

Through this project, we gained practical experience in:

* Database design
* Relational database management
* SQL and ORM operations
* Normalization
* Primary and foreign keys
* REST API development
* Full-stack web development
* Authentication
* Frontend-backend integration
* PostgreSQL
* Deployment
* Git and GitHub
* Team collaboration
* Debugging and problem solving

---

# 👥 Team

This project was collaboratively developed by:

| Member            | Role                   |
| ----------------- | ---------------------- |
| **Tanveer Singh** | Full-Stack Development |
| **Simerose**      | Project Development    |
| **Harleen**       | Project Development    |

> Roles can be updated to reflect the specific contributions of each team member.

---

# 🔮 Future Improvements

Some possible future enhancements include:

* 💳 Integrated online payment gateway
* 📧 Email booking confirmation
* 📱 Fully responsive mobile UI
* 🔔 Booking notifications
* 👨‍💼 Admin dashboard
* ✈️ Advanced flight filtering
* 🔎 Advanced search and sorting
* 📊 Booking analytics
* 🎟️ Digital boarding pass
* 🔐 Enhanced authentication and authorization

---

# 📸 Screenshots

Add screenshots of the major pages here.

### 🏠 Home Page

```text
Add screenshot here
```

### ✈️ Flight Search

```text
Add screenshot here
```

### 💺 Seat Selection

```text
Add screenshot here
```

### 🎫 Booking

```text
Add screenshot here
```

---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/new-feature
```

3. Make your changes
4. Commit your changes

```bash
git commit -m "Add new feature"
```

5. Push the branch

```bash
git push origin feature/new-feature
```

6. Open a Pull Request

---

# 📄 License

This project was developed for **educational purposes as part of a DBMS course project**.

---

# ⭐ Support

If you found this project interesting, consider giving the repository a ⭐ on GitHub!

---

**Built with ❤️ using React, Django & PostgreSQL**
