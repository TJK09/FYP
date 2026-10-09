from django.urls import path
from .views import (
    LabTestBookingListCreateView,
    DoctorListView,
    DoctorLabTestListView,
    LabTestListCreateView,
    ValidateAccessTokenView,
)

urlpatterns = [
    # list/create lab tests (GET public; POST requires auth - consider permissioning)
    path('tests/', LabTestListCreateView.as_view(), name='labtest-list-create'),

    # patient booking
    path('book/', LabTestBookingListCreateView.as_view(), name='labtest-book'),

    # list doctors for frontend
    path('doctors/', DoctorListView.as_view(), name='doctor-list'),

    # doctor's own assigned tests
    path('doctor/lab-tests/', DoctorLabTestListView.as_view(), name='doctor-labtests'),

    # validate token for ML flow
    path('validate-token/', ValidateAccessTokenView.as_view(), name='labtest-validate-token'),
]
