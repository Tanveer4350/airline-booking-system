from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import (
    Aircraft,
    Route,
    Flight,
    Seat,
    User,
    Booking,
)

from .serializers import (
    AircraftSerializer,
    RouteSerializer,
    FlightSerializer,
    SeatSerializer,
    UserSerializer,
    BookingSerializer,
)


# ==========================================================
# SEARCH FLIGHTS
# ==========================================================

@api_view(["GET"])
def search_flights(request):

    from_city = request.GET.get("from")
    to_city = request.GET.get("to")
    date = request.GET.get("date")

    if not from_city or not to_city or not date:
        return Response(
            {"error": "Missing search parameters"},
            status=400
        )

    flights = Flight.objects.filter(
        route__source_airport__iexact=from_city,
        route__destination_airport__iexact=to_city,
        departure_datetime__date=date
    ).select_related(
        "route",
        "aircraft"
    )

    data = []

    for flight in flights:

        available = Seat.objects.filter(
            flight=flight,
            is_booked=False
        ).count()

        total = flight.aircraft.total_seats

        booked = total - available

        seat_factor = Decimal(booked) / Decimal(total)

        dynamic_price = (
            flight.base_price +
            (flight.base_price * seat_factor * Decimal("0.50"))
        )

        data.append({

            "id": flight.id,

            "flight_name": f"Flight {flight.id}",

            "from": flight.route.source_airport,

            "to": flight.route.destination_airport,

            "departure_time": flight.departure_datetime,

            "arrival_time": flight.arrival_datetime,

            "price": float(dynamic_price),

            "status": flight.status,

            "available_seats": available,

            "aircraft": flight.aircraft.model_name,

        })

    return Response(data)


# ==========================================================
# SEAT MAP
# ==========================================================

@api_view(["GET"])
def seat_map(request, flight_id):

    flight = get_object_or_404(
        Flight,
        id=flight_id
    )

    seats = Seat.objects.filter(
        flight=flight
    ).order_by("seat_number")

    serializer = SeatSerializer(
        seats,
        many=True
    )

    return Response({

        "rows": flight.aircraft.rows,

        "cols": flight.aircraft.cols,

        "aircraft": flight.aircraft.model_name,

        "seats": serializer.data

    })
# ==========================================================
# REGISTER USER
# ==========================================================

@api_view(["POST"])
def register_user(request):

    serializer = UserSerializer(
        data=request.data
    )

    if serializer.is_valid():
        serializer.save()

        return Response(
            {
                "message": "Registration Successful",
                "user": serializer.data
            }
        )

    return Response(
        serializer.errors,
        status=400
    )


# ==========================================================
# LOGIN USER
# ==========================================================

@api_view(["POST"])
def login_user(request):

    email = request.data.get("email")

    password = request.data.get("password")

    try:

        user = User.objects.get(
            email=email,
            password=password
        )

        return Response({

            "message": "Login Successful",

            "user_id": user.id,

            "name": user.name,

            "email": user.email

        })

    except User.DoesNotExist:

        return Response(

            {

                "error": "Invalid Email or Password"

            },

            status=400

        )
        
        # ==========================================================
# BOOK SEAT
# ==========================================================

@api_view(["POST"])
def book_seat(request):

    user_id = request.data.get("user_id")
    flight_id = request.data.get("flight_id")
    seat_id = request.data.get("seat_id")

    if not flight_id or not seat_id:
        return Response(
            {"error": "Flight ID and Seat ID are required"},
            status=400
        )

    flight = get_object_or_404(
        Flight,
        id=flight_id
    )

    seat = get_object_or_404(
        Seat,
        id=seat_id,
        flight=flight
    )

    if seat.is_booked:
        return Response(
            {"error": "Seat already booked"},
            status=400
        )

    seat.is_booked = True
    seat.save()

    user = None

    if user_id:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            user = None

    booking = Booking.objects.create(

        user=user,

        flight=flight,

        seat=seat,

        price_paid=flight.base_price,

        payment_status="Paid"

    )

    return Response({

        "success": True,

        "booking_id": booking.id,

        "pnr": booking.pnr,

        "flight_id": flight.id,

        "flight_name": f"Flight {flight.id}",

        "from": flight.route.source_airport,

        "to": flight.route.destination_airport,

        "departure": flight.departure_datetime,

        "arrival": flight.arrival_datetime,

        "seat": seat.seat_number,

        "price": float(booking.price_paid),

        "status": booking.payment_status

    })


# ==========================================================
# GET BOOKINGS
# ==========================================================

@api_view(["GET"])
def get_bookings(request):
    pnr_query = request.GET.get("pnr", "").strip()
    limit = int(request.GET.get("limit", 50))

    bookings_qs = Booking.objects.select_related(
        "flight",
        "flight__route",
        "flight__aircraft",
        "seat",
        "user"
    ).order_by("-booking_time")

    if pnr_query:
        bookings_qs = bookings_qs.filter(pnr__icontains=pnr_query)

    bookings = bookings_qs[:limit]

    data = []

    for booking in bookings:

        flight = booking.flight

        data.append({

            "id": booking.id,

            "pnr": booking.pnr,

            "flight_id": flight.id,

            "flight_name": flight.flight_number or f"Flight {flight.id}",

            "from": flight.route.source_airport,

            "to": flight.route.destination_airport,

            "departure": flight.departure_datetime,

            "arrival": flight.arrival_datetime,

            "aircraft": flight.aircraft.model_name,

            "seat": booking.seat.seat_number,

            "seat_class": booking.seat.seat_class,

            "price": float(booking.price_paid),

            "status": booking.payment_status,

            "booking_time": booking.booking_time,

            "passenger": booking.user.name if booking.user else "Guest"

        })

    return Response(data)


# ==========================================================
# GET SINGLE BOOKING
# ==========================================================

@api_view(["GET"])
def get_booking(request, booking_id):

    booking = get_object_or_404(
        Booking,
        id=booking_id
    )

    flight = booking.flight

    return Response({

        "id": booking.id,

        "pnr": booking.pnr,

        "flight_name": flight.flight_number,

        "passenger": booking.user.name if booking.user else "Guest",

        "from": flight.route.source_airport,

        "to": flight.route.destination_airport,

        "departure": flight.departure_datetime,

        "arrival": flight.arrival_datetime,

        "aircraft": flight.aircraft.model_name,

        "seat": booking.seat.seat_number,

        "seat_class": booking.seat.seat_class,

        "price": float(booking.price_paid),

        "status": booking.payment_status,

        "booking_time": booking.booking_time

    })


# ==========================================================
# CANCEL BOOKING
# ==========================================================

@api_view(["DELETE"])
def cancel_booking(request, booking_id):

    booking = get_object_or_404(
        Booking,
        id=booking_id
    )

    seat = booking.seat

    seat.is_booked = False
    seat.save()

    booking.delete()

    return Response({

        "success": True,

        "message": "Booking cancelled successfully"

    })