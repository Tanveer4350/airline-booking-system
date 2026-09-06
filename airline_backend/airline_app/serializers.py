from rest_framework import serializers
from datetime import datetime
from decimal import Decimal

from .models import Aircraft, Route, Flight, Seat, User, Booking


# ---------------- Aircraft ---------------- #

class AircraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aircraft
        fields = "__all__"


# ---------------- Route ---------------- #

class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = "__all__"


# ---------------- Flight ---------------- #

class FlightSerializer(serializers.ModelSerializer):

    dynamic_price = serializers.SerializerMethodField()

    route = RouteSerializer(read_only=True)

    aircraft = AircraftSerializer(read_only=True)

    available_seats = serializers.SerializerMethodField()

    class Meta:
        model = Flight
        fields = [
            "id",
            "route",
            "aircraft",
            "departure_datetime",
            "arrival_datetime",
            "base_price",
            "dynamic_price",
            "available_seats",
            "status",
        ]

    def get_available_seats(self, obj):
        return Seat.objects.filter(
            flight=obj,
            is_booked=False
        ).count()

    def get_dynamic_price(self, obj):

        total_seats = obj.aircraft.total_seats

        booked_seats = Seat.objects.filter(
            flight=obj,
            is_booked=True
        ).count()

        seat_factor = Decimal(booked_seats) / Decimal(total_seats)

        days_left = (
            obj.departure_datetime.date()
            - datetime.now().date()
        ).days

        if days_left <= 1:
            time_factor = Decimal("0.60")

        elif days_left <= 3:
            time_factor = Decimal("0.40")

        elif days_left <= 7:
            time_factor = Decimal("0.20")

        else:
            time_factor = Decimal("0.00")

        dynamic_price = (

            obj.base_price

            + (obj.base_price * seat_factor * Decimal("1.5"))

            + (obj.base_price * time_factor)

        )

        return round(dynamic_price, 2)


# ---------------- Seat ---------------- #

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = "__all__"


# ---------------- User ---------------- #

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


# ---------------- Booking ---------------- #

class BookingSerializer(serializers.ModelSerializer):

    flight = FlightSerializer(read_only=True)

    seat = SeatSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = "__all__"