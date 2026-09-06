import { Routes, Route, NavLink, Link } from "react-router-dom";
import Home from "./pages/Home";
import Bookings from "./pages/Bookings";
import Ticket from "./pages/Ticket";

function Checkin() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-10 shadow-2xl max-w-md w-full border border-gray-100">
        <div className="text-6xl mb-4 animate-pulse">🛫</div>
        <h2 className="text-2xl font-bold text-gray-800">Online Web Check-In</h2>
        <p className="text-gray-500 mt-2 text-sm">
          Web check-in opens 24 hours prior to departure. Please have your PNR and last name ready.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md text-sm"
        >
          ← Back to Flight Search
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-700 shadow-sm"
        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
    }`;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* PROFESSIONAL NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 flex items-center justify-center text-white text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
              ✈
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900 block leading-tight">
                AIRLINE<span className="text-blue-600">.</span>
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block">
                Sky Booking
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink to="/" className={linkClass}>
              Search Flights
            </NavLink>
            <NavLink to="/bookings" className={linkClass}>
              My Bookings
            </NavLink>
            <NavLink to="/checkin" className={linkClass}>
              Check-In
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/bookings"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm shadow-blue-200 flex items-center gap-1.5"
            >
              <span>🎫</span>
              <span>View Bookings</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ROUTES */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route path="/ticket/:id" element={<Ticket />} />
        </Routes>
      </main>
    </div>
  );
}