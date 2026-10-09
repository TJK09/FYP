from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid
from datetime import timedelta

User = settings.AUTH_USER_MODEL


class LabTest(models.Model):
    """
    Available laboratory/test types. Can mark a test as requiring an ML flow (ml_required).
    """
    name = models.CharField(max_length=200, unique=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)
    ml_required = models.BooleanField(default=False)  # e.g. Depression analysis
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class LabTestBooking(models.Model):
    """
    Booking record for a lab test.
    """
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='lab_tests'
    )
    # Allow NULL initially to fix migration issues
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lab_tests_assigned',
        null=True, 
        blank=True
)

    lab_test = models.ForeignKey(
        LabTest,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    test_type = models.CharField(max_length=255)
    date = models.DateField()
    time = models.TimeField(default="09:00")
    created_at = models.DateTimeField(auto_now_add=True)

    # Token fields for ML-required tests
    access_token = models.CharField(max_length=100, blank=True, null=True)
    token_created_at = models.DateTimeField(blank=True, null=True)
    token_expires_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        lab_test_name = self.lab_test.name if self.lab_test else "No Test"
        return f"{self.patient.username} - {lab_test_name} on {self.date} {self.time}"

    def generate_token(self, lifetime_hours: int = 24):
        """
        Generate and store an access token (UUID-based) valid for `lifetime_hours`.
        """
        token = uuid.uuid4().hex
        now = timezone.now()
        self.access_token = token
        self.token_created_at = now
        self.token_expires_at = now + timedelta(hours=lifetime_hours)
        self.save(update_fields=['access_token', 'token_created_at', 'token_expires_at'])
        return token

    def token_is_valid(self):
        """
        Return True if access_token exists and is not expired.
        """
        if not self.access_token or not self.token_expires_at:
            return False
        return timezone.now() <= self.token_expires_at
