import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

export default function Home() {
  const navigate = useNavigate();

  // ===========================
  // SEARCH STATES
  // ===========================
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const [flights, setFlights] = useState([]);

  // ===========================
  // BOOKING STATES
  // ===========================
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [seats, setSeats] = useState([]);

  const [bookingData, setBookingData] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [aircraftLayout, setAircraftLayout] = useState({
    rows: 0,
    cols: 0,
});

  // ===========================
  // SEARCH FLIGHTS
  // ===========================
  const searchFlights = async () => {
    if (!from || !to || !date) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/search_flights/?from=${from}&to=${to}&date=${date}`
      );

      const data = await res.json();

      setFlights(data);
    } catch (err) {
      console.error(err);
      alert("Unable to connect to backend.");
    }
  };

  // ===========================
  // LOAD SEATS
  // ===========================
  const loadSeats = async (flight) => {
    setSelectedFlight(flight);
    setSelectedSeat(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/seatmap/${flight.id}/`
      );

      const data = await res.json();

      const normalizedSeats = (data.seats || data).map((seat) => ({
        ...seat,
        is_booked:
          seat.is_booked === true ||
          seat.is_booked === "true" ||
          seat.is_booked === 1,
      }));

      setAircraftLayout({
    rows: data.rows,
    cols: data.cols,
});

setSeats(normalizedSeats);

console.log(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load seats.");
    }
  };

  // ===========================
  // NORMALIZE SEAT
  // ===========================
  const normalizeSeat = (seatNumber) => {
    if (!seatNumber) return "";

    const sn = seatNumber.toUpperCase();

    const match =
      sn.match(/^([A-F])(\d+)$/) ||
      sn.match(/^(\d+)([A-F])$/);

    if (!match) return sn;

    return isNaN(match[1])
      ? `${match[1]}${match[2]}`
      : `${match[2]}${match[1]}`;
  };

  // ===========================
  // GET ROWS
  // ===========================
  const getRows = () => {
    return Array.from(
        { length: aircraftLayout.rows },
        (_, i) => i + 1
    );
};

  // ===========================
  // GET PARTICULAR SEAT
  // ===========================
  const getSeat = (row, letter) => {
    return seats.find(
      (seat) =>
        normalizeSeat(seat.seat_number) === `${letter}${row}`
    );
  };

  // ===========================
  // BOOK SEAT
  // ===========================
  const bookSeat = async () => {
    if (!selectedSeat) {
      alert("Please select a seat.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/book/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            flight_id: selectedFlight.id,
            seat_id: selectedSeat.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Booking failed.");
        return;
      }

      setBookingData(data);

      setShowTicket(true);

      setSeats((prev) =>
        prev.map((seat) =>
          seat.id === selectedSeat.id
            ? { ...seat, is_booked: true }
            : seat
        )
      );
    } catch (err) {
      console.error(err);
      alert("Booking failed.");
    }
  };
  const seatLetters = [
    ...new Set(
      seats
        .map((seat) => {
          const norm = normalizeSeat(seat?.seat_number);
          const match = norm ? norm.match(/[A-Z]+/) : null;
          return match ? match[0] : null;
        })
        .filter(Boolean)
    ),
  ].sort();

  const mid = Math.ceil(seatLetters.length / 2);

  const leftSeats = seatLetters.slice(0, mid);

  const rightSeats = seatLetters.slice(mid);


  
  return (
<div
  className="min-h-screen bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.15)), url('/bg.png')",
    backgroundAttachment: "fixed",
  }}
>

  {/* HERO SECTION */}
  <section className="min-h-screen flex flex-col justify-center">

    <div className="max-w-7xl mx-auto w-full px-8">

      <div className="mb-12">

        <h1 className="text-7xl font-extrabold text-white leading-tight">
          Book Your
          <br />
          Next Journey
        </h1>

        <p className="text-white text-xl mt-5 max-w-2xl">
          Discover destinations around the world with a fast,
          secure and seamless airline booking experience.
        </p>

      </div>

      {/* SEARCH BOX */}

      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5">

          <input
            placeholder="📍 From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border rounded-2xl p-5 text-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            placeholder="📍 To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border rounded-2xl p-5 text-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-2xl p-5 text-lg outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={searchFlights}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white text-lg font-semibold rounded-2xl"
          >
            🔍 Search Flights
          </button>

        </div>

      </div>

      {/* STATS */}

      <div className="grid md:grid-cols-3 gap-6 mt-12">

        <div className="bg-white/90 rounded-3xl shadow-xl p-6">

          <div className="text-5xl">✈️</div>

          <h3 className="text-3xl font-bold mt-4">
            150+
          </h3>

          <p className="text-gray-600">
            Destinations Worldwide
          </p>

        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl p-6">

          <div className="text-5xl">🛫</div>

          <h3 className="text-3xl font-bold mt-4">
            500+
          </h3>

          <p className="text-gray-600">
            Daily Flights
          </p>

        </div>

        <div className="bg-white/90 rounded-3xl shadow-xl p-6">

          <div className="text-5xl">⭐</div>

          <h3 className="text-3xl font-bold mt-4">
            99%
          </h3>

          <p className="text-gray-600">
            Customer Satisfaction
          </p>

        </div>

      </div>

    </div>

  </section>

  {/* ===================== FLIGHTS ===================== */}
<div className="max-w-6xl mx-auto mt-10 space-y-6">
  {flights.length === 0 ? (
    <div className="text-center text-white text-xl font-semibold bg-white/10 backdrop-blur-md rounded-2xl py-10">
      ✈ Search flights to begin your journey
    </div>
  ) : (
    flights.map((f) => (
      <div
        key={f.id}
        className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-blue-300"
      >
        {/* TOP BAR */}
        <div className="bg-gradient-to-r from-blue-700 to-cyan-500 text-white px-8 py-5 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">
              ✈ {f.flight_name}
            </h2>

            <p className="text-blue-100 mt-1">
              Premium Economy Experience
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm opacity-80">Starting From</p>
            <p className="text-3xl font-bold">
              ₹ {Number(f.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div className="grid md:grid-cols-3 gap-8 p-8">

          {/* LEFT */}
          <div>
            <p className="text-gray-500 text-sm">
              FROM
            </p>

            <h2 className="text-3xl font-bold text-gray-800">
              {f.from}
            </h2>

            <p className="text-gray-500 mt-6 text-sm">
              DEPARTURE
            </p>

            <h3 className="text-xl font-semibold">
              {new Date(f.departure_time).toLocaleTimeString([], {
               hour: "2-digit",
               minute: "2-digit",
               })}
            </h3>
          </div>

          {/* CENTER */}
          <div className="flex flex-col justify-center items-center">

            <div className="text-blue-600 text-4xl">
              ✈
            </div>

            <div className="w-full border-t-2 border-dashed border-blue-300 my-4"></div>

            <span className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold">
              Non Stop
            </span>

            <div className="mt-5 text-gray-500 font-medium">
  {(() => {
    const dep = new Date(f.departure_time);
    const arr = new Date(f.arrival_time);

    const diff = arr - dep;

    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hrs}h ${mins}m`;
  })()}
</div>

          </div>

          {/* RIGHT */}
          <div className="text-right">

            <p className="text-gray-500 text-sm">
              TO
            </p>

            <h2 className="text-3xl font-bold text-gray-800">
              {f.to}
            </h2>

            <p className="text-gray-500 mt-6 text-sm">
              ARRIVAL
            </p>

            <h3 className="text-xl font-semibold">
              {new Date(f.arrival_time).toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
})}
            </h3>

          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-8 py-6 flex flex-wrap justify-between items-center gap-5">

          <div className="flex gap-8 flex-wrap">

            <div>
              <p className="text-gray-400 text-xs">
                Aircraft
              </p>

              <p className="font-semibold">
  {f.aircraft}
</p>
            </div>

            <div>
  <p className="text-gray-400 text-xs">
    Seats Left
  </p>

  <p className="font-semibold">
    {f.available_seats}
  </p>
</div>

            <div>
              <p className="text-gray-400 text-xs">
                Status
              </p>

              <p
  className={`font-semibold ${
    f.status === "Scheduled"
      ? "text-green-600"
      : "text-red-600"
  }`}
>
  {f.status}
</p>
            </div>

          </div>

          <button
            onClick={() => loadSeats(f)}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition duration-300"
          >
            Select Seat →
          </button>

        </div>
      </div>
    ))
  )}
</div>

      {/* =========================
          SEAT SELECTION MODAL
      ========================= */}
      {selectedFlight && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-white/20 animate-fadeIn">

            {/* HEADER WITH PROFESSIONAL BACK BUTTON */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 text-white px-8 py-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedFlight(null);
                    setSelectedSeat(null);
                  }}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm transition-all duration-200 hover:-translate-x-1 shadow-sm"
                  title="Return to search results"
                >
                  <span className="text-lg">←</span> Back to Flights
                </button>

                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
                    <span>✈</span> {selectedFlight.flight_name}
                  </h2>
                  <p className="text-blue-100 text-sm font-medium">
                    {selectedFlight.from} → {selectedFlight.to} • {selectedFlight.aircraft}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs uppercase tracking-wider text-blue-100 opacity-90">Ticket Fare</p>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                    ₹ {Number(selectedFlight.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setSelectedFlight(null);
                    setSelectedSeat(null);
                  }}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition font-bold"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* BODY - SEAT MAP */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50">
              {/* Cockpit */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 px-10 py-2.5 rounded-full text-sm font-bold shadow-inner flex items-center gap-2 border border-slate-300">
                  <span>✈</span> Cockpit & Front Galley
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mb-6 flex-wrap">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-4 h-4 rounded-md bg-emerald-500"></div>
                  <span className="text-xs font-semibold text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-4 h-4 rounded-md bg-rose-500"></div>
                  <span className="text-xs font-semibold text-gray-700">Booked</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
                  <div className="w-4 h-4 rounded-md bg-blue-600 ring-2 ring-blue-300"></div>
                  <span className="text-xs font-semibold text-gray-700">Your Selection</span>
                </div>
              </div>

              {/* Column Headers */}
              <div
                className="grid justify-center text-center font-bold text-sm text-gray-600 mb-4"
                style={{
                  gridTemplateColumns: `50px repeat(${leftSeats.length}, 56px) 60px repeat(${rightSeats.length}, 56px)`
                }}
              >
                <div></div>
                {leftSeats.map((letter) => (
                  <div key={letter} className="py-1 bg-slate-200/70 rounded-md mx-1">{letter}</div>
                ))}
                <div className="text-gray-400 flex items-center justify-center text-xs">AISLE</div>
                {rightSeats.map((letter) => (
                  <div key={letter} className="py-1 bg-slate-200/70 rounded-md mx-1">{letter}</div>
                ))}
              </div>

              {/* ROWS */}
              <div className="space-y-3 pb-4">
                {getRows().map((row) => (
                  <div
                    key={row}
                    className="grid justify-center items-center gap-2"
                    style={{
                      gridTemplateColumns: `50px repeat(${leftSeats.length}, 56px) 60px repeat(${rightSeats.length}, 56px)`
                    }}
                  >
                    {/* Row Number */}
                    <div className="font-bold text-xs text-center text-gray-500 bg-gray-200/60 py-1.5 rounded-md">
                      R{row}
                    </div>

                    {/* LEFT SIDE SEATS */}
                    {leftSeats.map((letter) => {
                      const seat = getSeat(row, letter);
                      const isSelected = normalizeSeat(selectedSeat?.seat_number) === normalizeSeat(seat?.seat_number);

                      return (
                        <button
                          key={letter}
                          disabled={seat?.is_booked}
                          onClick={() => !seat?.is_booked && setSelectedSeat(seat)}
                          className={`
                            h-12 rounded-xl font-bold text-xs transition-all duration-200 shadow-sm flex flex-col items-center justify-center
                            ${
                              isSelected
                                ? "bg-blue-600 text-white scale-105 ring-4 ring-blue-300 shadow-md font-extrabold"
                                : seat?.is_booked
                                ? "bg-rose-100 text-rose-400 border border-rose-200 cursor-not-allowed opacity-60"
                                : "bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white cursor-pointer shadow-emerald-200"
                            }
                          `}
                        >
                          <span>{seat ? normalizeSeat(seat.seat_number) : ""}</span>
                        </button>
                      );
                    })}

                    {/* AISLE */}
                    <div className="text-center text-gray-300 text-xs font-semibold">
                      •
                    </div>

                    {/* RIGHT SIDE SEATS */}
                    {rightSeats.map((letter) => {
                      const seat = getSeat(row, letter);
                      const isSelected = normalizeSeat(selectedSeat?.seat_number) === normalizeSeat(seat?.seat_number);

                      return (
                        <button
                          key={letter}
                          disabled={seat?.is_booked}
                          onClick={() => !seat?.is_booked && setSelectedSeat(seat)}
                          className={`
                            h-12 rounded-xl font-bold text-xs transition-all duration-200 shadow-sm flex flex-col items-center justify-center
                            ${
                              isSelected
                                ? "bg-blue-600 text-white scale-105 ring-4 ring-blue-300 shadow-md font-extrabold"
                                : seat?.is_booked
                                ? "bg-rose-100 text-rose-400 border border-rose-200 cursor-not-allowed opacity-60"
                                : "bg-emerald-500 hover:bg-emerald-600 hover:scale-105 text-white cursor-pointer shadow-emerald-200"
                            }
                          `}
                        >
                          <span>{seat ? normalizeSeat(seat.seat_number) : ""}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* STICKY FOOTER WITH CONFIRM & BACK BUTTONS */}
            <div className="border-t border-gray-200 bg-white px-8 py-4 shrink-0 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2">
                    <p className="text-gray-400 text-xs uppercase font-medium">Selected Seat</p>
                    <p className="text-xl font-extrabold text-blue-600">
                      {selectedSeat ? normalizeSeat(selectedSeat.seat_number) : "--"}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-2">
                    <p className="text-gray-400 text-xs uppercase font-medium">Total Fare</p>
                    <p className="text-xl font-extrabold text-emerald-600">
                      ₹ {Number(selectedFlight.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedFlight(null);
                      setSelectedSeat(null);
                    }}
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold transition text-sm"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={bookSeat}
                    disabled={!selectedSeat}
                    className={`flex-1 sm:flex-initial px-8 py-3 rounded-xl font-bold text-white text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2
                      ${
                        selectedSeat
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-blue-300"
                          : "bg-gray-300 cursor-not-allowed"
                      }
                    `}
                  >
                    <span>Confirm & Book Seat</span>
                    <span>✈</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===========================
          BOOKING SUCCESS & TICKET POPUP
      =========================== */}
      {showTicket && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-scaleUp">

            {/* TOP HEADER */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 text-center relative">
              <button
                onClick={() => {
                  setShowTicket(false);
                  setSelectedFlight(null);
                  setSelectedSeat(null);
                }}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-sm font-bold transition"
                title="Close"
              >
                ✕
              </button>

              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl mx-auto mb-2 backdrop-blur-sm shadow-inner">
                ✓
              </div>

              <h2 className="text-2xl font-black">
                Booking Confirmed!
              </h2>
              <p className="text-emerald-100 text-xs mt-1">
                Your ticket is confirmed and stored in My Bookings.
              </p>
            </div>

            {/* BOARDING PASS STYLE BODY */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-dashed border-gray-300 pb-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Booking PNR</p>
                    <p className="text-xl font-extrabold text-blue-700 tracking-wider">
                      {bookingData?.pnr}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {bookingData?.status || "Confirmed"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-xs text-gray-400">Flight</p>
                    <p className="font-bold text-gray-800">{bookingData?.flight_name || selectedFlight?.flight_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Seat Number</p>
                    <p className="font-extrabold text-blue-600 text-lg">{bookingData?.seat}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Route</p>
                    <p className="font-semibold text-gray-800 text-sm">{bookingData?.from} → {bookingData?.to}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Paid</p>
                    <p className="font-extrabold text-emerald-600 text-base">
                      ₹ {Number(bookingData?.price || selectedFlight?.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS ON TICKET */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => navigate("/bookings")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                  <span>📁 View Saved Bookings</span>
                  <span>→</span>
                </button>

                {bookingData?.booking_id && (
                  <button
                    onClick={() => navigate(`/ticket/${bookingData.booking_id}`)}
                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm"
                  >
                    <span>🖨 Print / Download Boarding Pass</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowTicket(false);
                    setSelectedFlight(null);
                    setSelectedSeat(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-6 rounded-xl transition text-sm"
                >
                  ← Book Another Flight
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===========================
          WHY CHOOSE US
      =========================== */}
      <section className="bg-white/15 backdrop-blur-lg border-t border-white/20 py-8 mt-4">
        <div className="max-w-7xl mx-auto px-8">

    <h2 className="text-4xl font-bold text-center mb-6">
      Why Choose Us
    </h2>

    <div className="grid md:grid-cols-4 gap-5">

      <div className="text-center">

        <div className="text-5xl">🛫</div>

        <h3 className="text-xl font-bold mt-2">
          Fast Booking
        </h3>

        <p className="text-gray-600 sext-sm mt-1">
          Book flights within seconds using our seamless booking system.
        </p>

      </div>

      <div className="text-center">

        <div className="text-6xl">💺</div>

        <h3 className="text-xl font-bold mt-4">
          Seat Selection
        </h3>

        <p className="text-gray-600 mt-2">
          Select your preferred seat in a realistic aircraft layout.
        </p>

      </div>

      <div className="text-center">

        <div className="text-6xl">🔒</div>

        <h3 className="text-xl font-bold mt-4">
          Secure Booking
        </h3>

        <p className="text-gray-600 mt-2">
          Safe booking process with reliable backend integration.
        </p>

      </div>

      <div className="text-center">

        <div className="text-6xl">📞</div>

        <h3 className="text-xl font-bold mt-4">
          24×7 Support
        </h3>

        <p className="text-gray-600 mt-2">
          Always available to assist you during your journey.
        </p>

      </div>

    </div>

  </div>

</section>

{/* ===========================
          FOOTER
=========================== */}

<footer className="bg-black/30 backdrop-blur-md border-t border-white/10">

  <div className="max-w-7xl mx-auto px-8 py-6">

    <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-10">

      {/* LEFT */}

      <div>

        <div className="flex items-center gap-2 mb-3">

          <span className="text-2xl">✈️</span>

          <h2 className="text-2xl font-bold text-white">
            Airline Booking
          </h2>

        </div>

        <p className="text-gray-300 text-sm leading-6 max-w-xs">
          Your trusted platform for seamless flight booking,
          secure reservations and comfortable journeys.
        </p>

      </div>

      {/* CENTER */}

      <div className="text-center">

        <h3 className="text-xl font-semibold text-white mb-3">
          Quick Links
        </h3>

        <ul className="space-y-2 text-gray-300 text-sm">

          <li className="hover:text-white transition cursor-pointer">
            Flights
          </li>

          <li className="hover:text-white transition cursor-pointer">
            Bookings
          </li>

          <li className="hover:text-white transition cursor-pointer">
            Check-in
          </li>

          <li className="hover:text-white transition cursor-pointer">
            Support
          </li>

        </ul>

      </div>

      {/* RIGHT */}

      <div className="text-right">

        <h3 className="text-xl font-semibold text-white mb-3">
          Contact
        </h3>

        <div className="space-y-2 text-gray-300 text-sm">

          <p>
            📧 support@airlinebooking.com
          </p>

          <p>
            📞 +91 9876543210
          </p>

        </div>

      </div>

    </div>

    {/* Divider */}

    <div className="border-t border-white/10 mt-6 pt-4">

      <p className="text-center text-xs text-gray-400">

        © 2026 Airline Booking System • Built with React, Django & PostgreSQL

      </p>

    </div>

  </div>

</footer>

</div>
);
}
