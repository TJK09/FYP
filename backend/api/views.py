from datetime import datetime
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from .models import Appointment
from .serializers import AppointmentSerializer
from accounts.models import Department, User
from .permissions import IsPatientOrReadOnly, IsAppointmentOwnerOrDoctor
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

# -------------------- Email Helper --------------------
def send_appointment_email(appointment: Appointment, action: str = 'booked'):
    """
    Send email notification to the patient when an appointment is booked or updated.
    """
    subject = f"Appointment {action.capitalize()} - {appointment.date} {appointment.time}"
    message = (
        f"Hello {appointment.patient.get_full_name() or appointment.patient.username},\n\n"
        f"Your appointment has been {action} with Dr. {appointment.doctor.get_full_name() or appointment.doctor.username}.\n"
        f"Date: {appointment.date}\n"
        f"Time: {appointment.time}\n"
        f"Department: {appointment.department.name if appointment.department else 'N/A'}\n\n"
        "Thank you for using our service."
    )
    recipient_list = [appointment.patient.email]
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipient_list, fail_silently=True)


# -------------------- Existing Notification Helper --------------------
def send_notification(appointment: Appointment, action: str):
    print(f"[Notification] Appointment {appointment.id} -> {action}")


# -------------------- Appointment Views --------------------
class AppointmentListCreateView(generics.ListCreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsPatientOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) == 'doctor':
            return Appointment.objects.filter(doctor=user).order_by('date', 'time')
        if getattr(user, 'role', None) == 'patient':
            return Appointment.objects.filter(patient=user).order_by('date', 'time')
        return Appointment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, 'role', None) != 'patient':
            raise PermissionDenied("Only patients can book appointments.")

        doctor_id = self.request.data.get('doctor')
        if not doctor_id:
            raise ValidationError("Please select a doctor.")

        try:
            doctor = User.objects.get(id=doctor_id, role='doctor')
        except User.DoesNotExist:
            raise ValidationError("Selected doctor does not exist.")

        department_instance = doctor.department if doctor.department else None

        appointment_date = self.request.data.get("date")
        appointment_time = self.request.data.get("time")
        if not appointment_date or not appointment_time:
            raise ValidationError("Date and time are required.")

        try:
            selected_datetime = datetime.combine(
                datetime.strptime(appointment_date, "%Y-%m-%d").date(),
                datetime.strptime(appointment_time, "%H:%M").time()
            )
        except Exception:
            raise ValidationError("Invalid date/time format. Use YYYY-MM-DD and HH:MM.")

        # make timezone-aware if naive
        if timezone.is_naive(selected_datetime):
            selected_datetime = timezone.make_aware(selected_datetime, timezone.get_current_timezone())

        if selected_datetime <= timezone.now():
            raise ValidationError("Appointment must be scheduled for the future.")

        # Use parsed date/time objects for DB filtering (coerce strings to proper types)
        appt_date = datetime.strptime(appointment_date, "%Y-%m-%d").date()
        appt_time = datetime.strptime(appointment_time, "%H:%M").time()

        if Appointment.objects.filter(doctor=doctor, date=appt_date, time=appt_time).exists():
            raise ValidationError("Selected doctor already has an appointment at that date & time.")

        appt = serializer.save(
            patient=user,
            doctor=doctor,
            status=Appointment.STATUS_PENDING,
            department=department_instance
        )

        try:
            appt.clean()
        except Exception as e:
            appt.delete()
            raise ValidationError(str(e))

        send_notification(appt, 'created')
        send_appointment_email(appt, action='booked')


class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, IsAppointmentOwnerOrDoctor]

    def patch(self, request, *args, **kwargs):
        appointment = self.get_object()
        user = request.user
        data = request.data.copy()

        # Doctor logic
        if getattr(user, 'role', None) == 'doctor' and appointment.doctor_id == user.id:
            new_status = data.get('status')
            new_date = data.get('date')
            new_time = data.get('time')

            if new_date or new_time:
                from datetime import datetime as _dt
                date_val = new_date if new_date else appointment.date.isoformat()
                time_val = new_time if new_time else appointment.time.strftime("%H:%M:%S")

                try:
                    parsed_date = _dt.strptime(date_val, "%Y-%m-%d").date() if isinstance(date_val, str) else date_val
                    try:
                        parsed_time = _dt.strptime(time_val, "%H:%M").time()
                    except ValueError:
                        parsed_time = _dt.strptime(time_val, "%H:%M:%S").time()
                    combined = _dt.combine(parsed_date, parsed_time)
                except Exception:
                    raise ValidationError("Invalid date/time format.")

                if timezone.is_naive(combined):
                    combined = timezone.make_aware(combined, timezone.get_current_timezone())

                if combined <= timezone.now():
                    raise ValidationError("Rescheduled appointment must be set to a future datetime.")

                conflicts = Appointment.objects.filter(
                    doctor=user, date=parsed_date, time=parsed_time
                ).exclude(pk=appointment.pk)
                if conflicts.exists():
                    raise ValidationError("Doctor already has an appointment at that date & time.")

                data['date'] = parsed_date
                data['time'] = parsed_time
                if not new_status:
                    data['status'] = Appointment.STATUS_RESCHEDULED

            if new_status and new_status not in dict(Appointment.STATUS_CHOICES).keys():
                raise ValidationError("Invalid status value.")

        # Patient logic
        elif getattr(user, 'role', None) == 'patient' and appointment.patient_id == user.id:
            new_status = data.get('status')
            if new_status and new_status != Appointment.STATUS_CANCELLED:
                raise PermissionDenied("Patients may only cancel their appointments.")
            if new_status == Appointment.STATUS_CANCELLED:
                from datetime import datetime as _dt
                combined = _dt.combine(appointment.date, appointment.time)
                if timezone.is_naive(combined):
                    combined = timezone.make_aware(combined, timezone.get_current_timezone())
                if combined <= timezone.now():
                    raise ValidationError("Cannot cancel past appointments.")
            if 'date' in data or 'time' in data or 'doctor' in data:
                raise PermissionDenied("Patients cannot reschedule via API.")

        else:
            raise PermissionDenied("You do not have permission to modify this appointment.")

        serializer = self.get_serializer(appointment, data=data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()

        try:
            updated.clean()
        except Exception as e:
            raise ValidationError(str(e))

        action = 'updated'
        if 'status' in data:
            action = f"status_changed_to_{data.get('status')}"
        elif 'date' in data or 'time' in data:
            action = 'rescheduled'

        send_notification(updated, action)
        send_appointment_email(updated, action=action)
        return Response(serializer.data, status=200)


class DoctorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        department_id = request.query_params.get("department")
        qs = User.objects.filter(role='doctor')

        if department_id:
            try:
                department_id = int(department_id)
                qs = qs.filter(department_id=department_id)
            except (ValueError, TypeError):
                pass

        data = [
            {
                "id": d.id,
                "name": f"{d.first_name} {d.last_name}".strip() or d.username,
                "department_id": d.department.id if d.department else None,
                "department_name": d.department.name if d.department else None
            }
            for d in qs
        ]
        return Response(data)
