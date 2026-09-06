from django.db import models


class Aircraft(models.Model):
    model_name = models.CharField(max_length=100)
    total_seats = models.IntegerField()
    rows = models.IntegerField()
    cols = models.IntegerField()

    def __str__(self):
        return self.model_name


class Route(models.Model):
    source_airport = models.CharField(max_length=50)
    destination_airport = models.CharField(max_length=50)
    distance_km = models.IntegerField()

    def __str__(self):
        return f"{self.source_airport} → {self.destination_airport}"


class Flight(models.Model):
    flight_number = models.CharField(
    max_length=20,
    unique=True
)

    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE)

    departure_datetime = models.DateTimeField()
    arrival_datetime = models.DateTimeField()

    base_price = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20, default="Scheduled")

    def __str__(self):
        return self.flight_number


class Seat(models.Model):
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE)
    seat_number = models.CharField(max_length=10)
    seat_class = models.CharField(max_length=20, default="Economy")
    is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.seat_number} - Flight {self.flight.id}"


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    def __str__(self):
        return self.name


import uuid

class Booking(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    flight = models.ForeignKey(Flight, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)

    pnr = models.CharField(
    max_length=20,
    unique=True,
    editable=False
)

    price_paid = models.DecimalField(max_digits=10, decimal_places=2)
    booking_time = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, default="Paid")

    def save(self, *args, **kwargs):
        if not self.pnr:
            self.pnr = "PNR" + uuid.uuid4().hex[:6].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.pnr} - {self.flight}"

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Flight)
def create_seats_for_flight(sender, instance, created, **kwargs):
    if created:
        rows = instance.aircraft.rows
        cols = instance.aircraft.cols

        letters = [chr(65 + i) for i in range(cols)]  # A, B, C, ...

        for row in range(1, rows + 1):
            for letter in letters:
                Seat.objects.create(
                    flight=instance,
                    seat_number=f"{letter}{row}",
                    seat_class="Economy",
                    is_booked=False,
                )
