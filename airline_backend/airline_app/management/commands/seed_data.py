from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.db.models.signals import post_save
from datetime import datetime, timedelta
import random

from airline_app.models import Aircraft, Route, Flight, Seat
from airline_app import models as airline_models


AIRCRAFT_LIST = [
    {"model_name": "Boeing 737",  "total_seats": 30, "rows": 5, "cols": 6},
    {"model_name": "Airbus A320", "total_seats": 30, "rows": 5, "cols": 6},
    {"model_name": "Boeing 787",  "total_seats": 30, "rows": 5, "cols": 6},
    {"model_name": "Airbus A380", "total_seats": 30, "rows": 5, "cols": 6},
    {"model_name": "Boeing 777",  "total_seats": 30, "rows": 5, "cols": 6},
]

ROUTES = [
    # Indian domestic
    ("Delhi",     "Mumbai",    1400),
    ("Mumbai",    "Delhi",     1400),
    ("Delhi",     "Bangalore", 1740),
    ("Bangalore", "Delhi",     1740),
    ("Mumbai",    "Bangalore",  980),
    ("Bangalore", "Mumbai",     980),
    ("Delhi",     "Kolkata",   1300),
    ("Kolkata",   "Delhi",     1300),
    ("Mumbai",    "Chennai",   1340),
    ("Chennai",   "Mumbai",    1340),
    ("Delhi",     "Chennai",   2200),
    ("Chennai",   "Delhi",     2200),
    ("Hyderabad", "Delhi",     1500),
    ("Delhi",     "Hyderabad", 1500),
    ("Hyderabad", "Mumbai",     710),
    ("Mumbai",    "Hyderabad",  710),
    ("Bangalore", "Kolkata",   1870),
    ("Kolkata",   "Bangalore", 1870),
    ("Delhi",     "Goa",       1900),
    ("Goa",       "Delhi",     1900),
    ("Mumbai",    "Goa",        580),
    ("Goa",       "Mumbai",     580),
    # International
    ("Delhi",     "Dubai",     2210),
    ("Dubai",     "Delhi",     2210),
    ("Mumbai",    "Dubai",     1920),
    ("Dubai",     "Mumbai",    1920),
    ("Delhi",     "London",    6740),
    ("London",    "Delhi",     6740),
    ("Delhi",     "Singapore", 5600),
    ("Singapore", "Delhi",     5600),
    ("Mumbai",    "Singapore", 5200),
    ("Singapore", "Mumbai",    5200),
]

FLIGHT_SLOTS = [
    (5, 30),
    (7, 0),
    (9, 15),
    (11, 45),
    (14, 0),
    (16, 30),
    (19, 0),
    (21, 30),
]

BASE_PRICES = {
    "short":  [2999, 3499, 3999, 4499, 4999],
    "medium": [4999, 5999, 6999, 7499, 7999],
    "long":   [12999, 15999, 18999, 22999, 27999],
}

AIRLINE_CODES = ["AI", "6E", "SG", "UK", "G8", "IX"]
LETTERS = [chr(65 + i) for i in range(6)]  # A-F


def get_price_tier(distance):
    if distance < 1000:
        return "short"
    elif distance < 2500:
        return "medium"
    return "long"


def avg_speed_kmh(distance):
    if distance < 1000:
        return 750
    elif distance < 3000:
        return 830
    return 870


def build_seats_for_flight(flight, rows, cols):
    letters = [chr(65 + i) for i in range(cols)]
    seats = []
    for row in range(1, rows + 1):
        for letter in letters:
            seats.append(Seat(
                flight=flight,
                seat_number=f"{letter}{row}",
                seat_class="Economy",
                is_booked=False,
            ))
    return seats


class Command(BaseCommand):
    help = "Seed flights for every route across the next N days (fast bulk insert)"

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=30)
        parser.add_argument("--clear", action="store_true")

    def handle(self, *args, **options):
        # Disconnect the post_save signal so we can bulk-create seats ourselves
        from airline_app.models import create_seats_for_flight
        post_save.disconnect(create_seats_for_flight, sender=Flight)

        try:
            self._run(options)
        finally:
            # Always reconnect the signal
            post_save.connect(create_seats_for_flight, sender=Flight)

    def _run(self, options):
        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            Seat.objects.all().delete()
            Flight.objects.all().delete()
            Route.objects.all().delete()
            Aircraft.objects.all().delete()
            self.stdout.write("  Cleared.")

        # 1. Aircraft
        self.stdout.write("Creating aircraft...")
        aircraft_objs = []
        for ac in AIRCRAFT_LIST:
            obj, _ = Aircraft.objects.get_or_create(
                model_name=ac["model_name"],
                defaults={"total_seats": ac["total_seats"], "rows": ac["rows"], "cols": ac["cols"]},
            )
            aircraft_objs.append(obj)
        self.stdout.write(f"  {len(aircraft_objs)} aircraft ready.")

        # 2. Routes
        self.stdout.write("Creating routes...")
        route_objs = {}
        for src, dst, dist in ROUTES:
            obj, _ = Route.objects.get_or_create(
                source_airport=src,
                destination_airport=dst,
                defaults={"distance_km": dist},
            )
            route_objs[(src, dst)] = obj
        self.stdout.write(f"  {len(route_objs)} routes ready.")

        # 3. Flights + Seats (bulk)
        self.stdout.write(f"Generating flights for {options['days']} days...")
        today = timezone.now().date()
        existing_numbers = set(Flight.objects.values_list("flight_number", flat=True))

        total_flights = 0
        total_seats = 0

        with transaction.atomic():
            for day_offset in range(options["days"]):
                flight_date = today + timedelta(days=day_offset)
                flights_to_create = []

                for (src, dst), route in route_objs.items():
                    dist = route.distance_km
                    tier = get_price_tier(dist)
                    speed = avg_speed_kmh(dist)
                    duration_td = timedelta(hours=dist / speed)

                    for slot_idx, (dep_h, dep_m) in enumerate(FLIGHT_SLOTS):
                        aircraft = random.choice(aircraft_objs)
                        airline_code = random.choice(AIRLINE_CODES)
                        flight_num = (
                            f"{airline_code}"
                            f"{abs(hash((src, dst, str(flight_date), slot_idx))) % 9000 + 1000}"
                        )
                        if flight_num in existing_numbers:
                            flight_num = f"{flight_num}X{slot_idx}"
                        existing_numbers.add(flight_num)

                        dep_dt = datetime(
                            flight_date.year, flight_date.month, flight_date.day,
                            dep_h, dep_m, 0,
                            tzinfo=timezone.get_current_timezone(),
                        )
                        arr_dt = dep_dt + duration_td
                        base_price = random.choice(BASE_PRICES[tier])

                        flights_to_create.append(Flight(
                            flight_number=flight_num,
                            route=route,
                            aircraft=aircraft,
                            departure_datetime=dep_dt,
                            arrival_datetime=arr_dt,
                            base_price=base_price,
                            status="Scheduled",
                        ))

                # Bulk create all flights for this day
                flight_numbers = [f.flight_number for f in flights_to_create]
                Flight.objects.bulk_create(flights_to_create, ignore_conflicts=True)

                # Re-query to get real PKs (bulk_create doesn't always return them)
                created_flights = list(
                    Flight.objects.filter(flight_number__in=flight_numbers)
                    .select_related("aircraft")
                )
                total_flights += len(created_flights)

                # Bulk create seats for all those flights
                seats_to_create = []
                for flight in created_flights:
                    seats_to_create.extend(
                        build_seats_for_flight(flight, flight.aircraft.rows, flight.aircraft.cols)
                    )

                Seat.objects.bulk_create(seats_to_create, ignore_conflicts=True)
                total_seats += len(seats_to_create)

                self.stdout.write(
                    f"  Day {day_offset + 1}/{options['days']}: "
                    f"{len(created_flights)} flights, {len(seats_to_create)} seats"
                )

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! {total_flights} flights and {total_seats} seats created."
        ))
