from django.urls import path
from .views import me, register, mon_recuperateur
urlpatterns = [
    path('me/',               me),
    path('register/',         register),
    path('mon-recuperateur/', mon_recuperateur),
]
