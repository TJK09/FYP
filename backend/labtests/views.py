from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .models import LabTestBooking, LabTest
from .serializers import LabTestBookingSerializer, LabTestSerializer
from rest_framework.serializers import ModelSerializer
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied

# Added imports for email
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings

User = get_user_model()

# -------------------------
# LabTest endpoints
# -------------------------
class LabTestListCreateView(generics.ListCreateAPIView):
    """
    GET: list available lab tests
    POST: (admin) create new lab test types
    """
    queryset = LabTest.objects.all().order_by('name')
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# -------------------------
# Booking endpoints
# -------------------------
def send_lab_test_email(patient_email, patient_name, lab_test_name, date, time):
    """
    Helper function to send booking confirmation email.
    """
    subject = "Lab Test Booking Confirmation"
    from_email = settings.DEFAULT_FROM_EMAIL
    to_email = [patient_email]

    # Text content
    text_content = f"""
    Hello {patient_name},

    Your lab test '{lab_test_name}' has been booked successfully.

    Date: {date}
    Time: {time}

    Thank you!
    """

    # HTML content
    html_content = f"""
    <p>Hello <b>{patient_name}</b>,</p>
    <p>Your lab test '<b>{lab_test_name}</b>' has been booked successfully.</p>
    <p><b>Date:</b> {date}<br><b>Time:</b> {time}</p>
    <p>Thank you!</p>
    """

    msg = EmailMultiAlternatives(subject, text_content, from_email, to_email)
    msg.attach_alternative(html_content, "text/html")
    msg.send()


class LabTestBookingListCreateView(generics.ListCreateAPIView):
    """
    GET: patient -> list their bookings
    POST: create a booking (patient is taken from request.user)
    """
    serializer_class = LabTestBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # patient sees their own bookings
        user = self.request.user
        return LabTestBooking.objects.filter(patient=user).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'role', None) != 'patient':
            raise PermissionDenied("Only patients can book lab tests.")

        booking = serializer.save(patient=user)

        # Send confirmation email
        send_lab_test_email(
            patient_email=user.email,
            patient_name=user.get_full_name() or user.username,
            lab_test_name=booking.lab_test.name,
            date=booking.date,
            time=booking.time
        )


# -------------------------
# Doctor list (for assignment)
# -------------------------
class DoctorSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class DoctorListView(generics.ListAPIView):
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='doctor')


# -------------------------
# Doctor view: list tests assigned to logged-in doctor
# -------------------------
class DoctorLabTestListView(generics.ListAPIView):
    serializer_class = LabTestBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self.request.user, 'role', None) != 'doctor':
            raise PermissionDenied("Only doctors can access assigned lab tests.")
        return LabTestBooking.objects.filter(doctor=self.request.user).order_by('-created_at')


# -------------------------
# Validate token endpoint (for ML flow)
# -------------------------
class ValidateAccessTokenView(APIView):
    """
    POST { "token": "<access_token>" } -> returns booking info if token is valid.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            raise ValidationError("Token is required.")

        try:
            booking = LabTestBooking.objects.get(access_token=token)
        except LabTestBooking.DoesNotExist:
            raise ValidationError("Invalid token.")

        if not booking.token_is_valid():
            raise ValidationError("Token expired or invalid.")

        # return minimal booking info and lab_test data to allow ML flow
        return Response({
            "booking_id": booking.id,
            "patient_id": booking.patient.id,
            "lab_test": {
                "id": booking.lab_test.id,
                "name": booking.lab_test.name,
                "slug": booking.lab_test.slug,
                "ml_required": booking.lab_test.ml_required,
            },
            "expires_at": booking.token_expires_at,
        }, status=status.HTTP_200_OK)
