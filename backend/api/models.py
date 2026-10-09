from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from datetime import datetime, date as date_cls

# NOTE: Use the Department model that lives in accounts app.
# Do NOT re-declare Department here to avoid duplicate model classes.
# The FK below references 'accounts.Department' by app_label.model_name string.

class Appointment(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'
    STATUS_RESCHEDULED = 'rescheduled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_RESCHEDULED, 'Rescheduled'),
    ]

    TYPE_CHECKUP = 'checkup'
    TYPE_FOLLOW_UP = 'follow_up'
    TYPE_EMERGENCY = 'emergency'
    TYPE_CONSULTATION = 'consultation'

    TYPE_CHOICES = [
        (TYPE_CHECKUP, 'Checkup'),
        (TYPE_FOLLOW_UP, 'Follow Up'),
        (TYPE_EMERGENCY, 'Emergency'),
        (TYPE_CONSULTATION, 'Consultation'),
    ]

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='patient_appointments',
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'patient'},
        null=True,
        blank=True
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='doctor_appointments',
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'doctor'},
        null=True,
        blank=True
    )
    # Reference the single Department model in accounts app (avoid duplicate model)
    department = models.ForeignKey(
        'accounts.Department',   # string reference to accounts.Department
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='appointments'
    )
    date = models.DateField()
    time = models.TimeField()
    appointment_type = models.CharField(
        max_length=32,
        choices=TYPE_CHOICES,
        default=TYPE_CONSULTATION
    )
    symptoms = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'time']

    def clean(self):
        """Ensure appointment is in the future and prevent double booking."""
        if self.date < date_cls.today():
            raise ValidationError("Appointment date cannot be in the past.")

        now = datetime.now()
        if self.date == date_cls.today() and self.time <= now.time():
            raise ValidationError("Appointment time must be in the future.")

        if self.doctor:
            conflicts = Appointment.objects.filter(
                doctor=self.doctor,
                date=self.date,
                time=self.time
            )
            if self.pk:
                conflicts = conflicts.exclude(pk=self.pk)
            if conflicts.exists():
                raise ValidationError("This doctor already has an appointment at the selected date and time.")

    def __str__(self):
        return f"Appointment({self.id}) with {self.doctor} on {self.date} at {self.time} - {self.status}"
