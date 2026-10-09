from django.db import models
from accounts.models import User
from medicalrecord.models import MedicalRecord

class MLReport(models.Model):
    patient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        limit_choices_to={'role': 'patient'}
    )
    medical_record = models.ForeignKey(
        MedicalRecord,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    report_file = models.FileField(upload_to="ml_reports/")
    report_type = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.patient.username} - {self.report_type or 'ML Report'} - {self.created_at.strftime('%Y-%m-%d')}"
