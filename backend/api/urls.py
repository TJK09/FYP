from django.urls import path
from .views import AppointmentListCreateView, DoctorListView, AppointmentDetailView

urlpatterns = [
    path('appointments/', AppointmentListCreateView.as_view(), name='appointments-list-create'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointments-detail'),
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),
]
