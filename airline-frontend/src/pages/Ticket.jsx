import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Ticket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/booking/${id}/`);
      const data = await res.json();
      setTicket(data);
    } catch (err) {
      console.log(err);
      alert("Unable to load ticket");
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "--";
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (!ticket) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white text-2xl font-semibold">
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl animate-bounce">✈</div>
          <p>Loading Boarding Pass...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center p-6 md:p-12 flex flex-col items-center justify-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.85)), url('/bg.png')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* TOP NAVIGATION BAR WITH BACK BUTTONS */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <button
          onClick={() => navigate("/bookings")}
          className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-2xl font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-x-1 shadow-md border border-white/10 text-sm"
        >
          <span>←</span> Back to Bookings
        </button>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-2xl font-semibold backdrop-blur-md transition-all duration-200 shadow-md border border-white/10 text-sm"
        >
          <span>🏠</span> Home / Search
        </button>
      </div>

      {/* BOARDING PASS CARD */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/40">

        {/* PASS HEADER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 text-white p-8 relative">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                Official Boarding Pass
              </span>
              <h1 className="text-3xl md:text-4xl font-black mt-2">
                ✈ {ticket.flight_name}
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                {ticket.aircraft} • Non-Stop Service
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-blue-100 font-semibold">Booking PNR</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-widest text-white mt-1 bg-white/10 px-3 py-1 rounded-xl">
                {ticket.pnr}
              </h2>
            </div>
          </div>
        </div>

        {/* ROUTE BANNER */}
        <div className="bg-slate-50 border-b border-gray-200 px-8 py-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Origin</p>
            <h2 className="text-2xl font-extrabold text-gray-800">{ticket.from}</h2>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-blue-600 text-xl font-bold">✈</span>
            <div className="w-24 border-t-2 border-dashed border-blue-300 my-1"></div>
            <span className="text-xs text-gray-400 font-semibold">Direct Flight</span>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase font-semibold">Destination</p>
            <h2 className="text-2xl font-extrabold text-gray-800">{ticket.to}</h2>
          </div>
        </div>

        {/* PASSENGER & FLIGHT DETAILS */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Passenger</p>
              <h2 className="text-lg font-bold text-gray-800 mt-1">
                {ticket.passenger || "Guest Passenger"}
              </h2>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Seat Number</p>
              <h2 className="text-2xl font-black text-blue-600 mt-0.5">
                {ticket.seat}
              </h2>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Class</p>
              <h2 className="text-lg font-bold text-gray-800 mt-1">
                {ticket.seat_class || "Economy"}
              </h2>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Departure Time</p>
              <h2 className="text-sm font-bold text-gray-800 mt-1">
                {formatDateTime(ticket.departure)}
              </h2>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Arrival Time</p>
              <h2 className="text-sm font-bold text-gray-800 mt-1">
                {formatDateTime(ticket.arrival)}
              </h2>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Fare Paid</p>
              <h2 className="text-xl font-extrabold text-emerald-600 mt-0.5">
                ₹ {Number(ticket.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          {/* BARCODE / TICKET FOOTER */}
          <div className="border-t-2 border-dashed border-gray-200 pt-6">
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="font-mono text-xs text-gray-500 tracking-widest text-center sm:text-left">
                <p className="font-bold text-gray-700">ELECTRONIC TICKET / BOARDING PASS</p>
                <p className="mt-1">GATE OPENS 45 MIN BEFORE DEPARTURE</p>
                <p className="text-[10px] text-gray-400 mt-0.5">AUTH CODE: {ticket.pnr}-VERIFIED</p>
              </div>

              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                <span className="text-3xl">▦</span>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Fast Track</p>
                  <p className="text-xs font-extrabold text-gray-700">SCAN AT GATE</p>
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition duration-200 flex items-center justify-center gap-2"
            >
              <span>🖨 Print / Save PDF</span>
            </button>

            <button
              onClick={() => navigate("/bookings")}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-6 rounded-2xl transition duration-200 flex items-center justify-center gap-2"
            >
              <span>← Back to My Bookings</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}