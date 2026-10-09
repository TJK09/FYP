from django.db import models
from accounts.models import User


class MedicalRecord(models.Model):
    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='medical_records',
        limit_choices_to={'role': 'patient'}
    )
    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='doctor_records',
        limit_choices_to={'role': 'doctor'}
    )

    diagnosis = models.TextField()
    prescriptions = models.TextField(blank=True, null=True)
    lab_results = models.FileField(upload_to="medical_reports/", blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.username} - {self.created_at.strftime('%Y-%m-%d')}"
