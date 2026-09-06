import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/?limit=100`);
      if (!res.ok) throw new Error("Server responded with error");
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert("Unable to load bookings from backend.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    const ok = window.confirm("Are you sure you want to cancel this booking?");
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/cancel/${id}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchBookings();
      } else {
        alert("Unable to cancel booking.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "--";
    try {
      const date = new Date(isoString);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return isoString;
    }
  };

  // Filtered bookings based on search query
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      (b.pnr && b.pnr.toLowerCase().includes(q)) ||
      (b.flight_name && b.flight_name.toLowerCase().includes(q)) ||
      (b.passenger && b.passenger.toLowerCase().includes(q)) ||
      (b.from && b.from.toLowerCase().includes(q)) ||
      (b.to && b.to.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6 md:p-12"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.85)), url('/bg.png')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-6xl mx-auto space-y-8">

        {/* TOP ACTION BAR WITH BACK BUTTON */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-2xl font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-x-1 shadow-md border border-white/10"
              title="Return to flight search"
            >
              <span className="text-lg">←</span> Back to Search
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                ✈ My Bookings
              </h1>
              <p className="text-blue-200 text-sm mt-0.5">
                {bookings.length} reservations loaded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="bg-white/15 hover:bg-white/25 text-white px-4 py-2.5 rounded-2xl font-semibold backdrop-blur-md transition shadow-md border border-white/10 text-sm"
              title="Refresh bookings"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-2xl font-bold shadow-lg transition duration-200 flex items-center gap-2 text-sm"
            >
              <span>+ Book New Flight</span>
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-3">
          <span className="text-white text-xl">🔍</span>
          <input
            type="text"
            placeholder="Search bookings by PNR (e.g. PNR...), Passenger, Route, or Flight number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-white placeholder-gray-300 text-sm outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-white/60 hover:text-white text-sm font-bold px-2"
            >
              ✕
            </button>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-16 text-center text-white">
            <div className="text-5xl animate-bounce mb-3">✈</div>
            <p className="text-xl font-bold">Loading your bookings...</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredBookings.length === 0 && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 text-center shadow-2xl max-w-xl mx-auto border border-white/20">
            <div className="text-6xl mb-4">🎫</div>
            <h2 className="text-2xl font-bold text-gray-800">
              {searchQuery ? "No Matching Bookings Found" : "No Bookings Found"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {searchQuery
                ? `No reservations match "${searchQuery}". Try searching for another PNR or route.`
                : "You haven't reserved any flight tickets yet."}
            </p>
            <button
              onClick={() => {
                if (searchQuery) setSearchQuery("");
                else navigate("/");
              }}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg"
            >
              {searchQuery ? "Clear Search" : "Search & Book Flights"}
            </button>
          </div>
        )}

        {/* BOOKINGS LIST */}
        {!loading && paginatedBookings.length > 0 && (
          <div className="grid gap-6">
            {paginatedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-6 md:p-8 hover:shadow-2xl transition duration-300 border border-white/40"
              >
                {/* CARD TOP */}
                <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
                      ✈
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {booking.flight_name}
                      </h2>
                      <p className="text-gray-500 text-xs font-medium">
                        {booking.aircraft} • Passenger: <span className="font-semibold text-gray-800">{booking.passenger || "Guest"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-semibold">PNR</p>
                      <span className="font-extrabold text-blue-700 tracking-wider bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                        {booking.pnr}
                      </span>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wide">
                      {booking.status}
                    </span>
                  </div>
                </div>

                {/* CARD DETAILS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 my-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Route</p>
                    <h3 className="font-bold text-gray-800 text-sm mt-1">
                      {booking.from} → {booking.to}
                    </h3>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Seat</p>
                    <h3 className="font-extrabold text-blue-600 text-base mt-1">
                      {booking.seat} <span className="text-xs font-normal text-gray-500">({booking.seat_class || "Economy"})</span>
                    </h3>
                  </div>

                  <div className="sm:col-span-1 md:col-span-2">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Departure</p>
                    <p className="font-semibold text-gray-800 text-xs mt-1">
                      {formatDateTime(booking.departure)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Arrival</p>
                    <p className="font-semibold text-gray-800 text-xs mt-1">
                      {formatDateTime(booking.arrival)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Fare Paid</p>
                    <h3 className="font-extrabold text-emerald-600 text-base mt-1">
                      ₹ {Number(booking.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </h3>
                  </div>
                </div>

                {/* CARD ACTIONS */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Booked on: {formatDateTime(booking.booking_time)}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/ticket/${booking.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition duration-200 shadow-md text-sm flex items-center gap-2"
                    >
                      <span>🎫 View Boarding Pass</span>
                    </button>

                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-semibold px-5 py-2.5 rounded-xl transition duration-200 text-sm"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-xl transition text-sm backdrop-blur-md"
                >
                  ← Previous
                </button>
                <span className="text-white text-sm font-semibold bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-xl transition text-sm backdrop-blur-md"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}