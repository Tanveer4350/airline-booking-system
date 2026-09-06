from django.urls import path
from . import views

urlpatterns = [

    path("search_flights/", views.search_flights),

    path("seatmap/<int:flight_id>/", views.seat_map),

    path("register/", views.register_user),

    path("user/login/", views.login_user),

    path("book/", views.book_seat),

    path("bookings/", views.get_bookings),

    path("booking/<int:booking_id>/", views.get_booking),

    path("cancel/<int:booking_id>/", views.cancel_booking),

]