from django.contrib.auth.models import AbstractUser
from django.db import models

# ------------------- Department -------------------
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


# ------------------- User -------------------
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    email_verified = models.BooleanField(default=False)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Department for doctors only
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="doctors"
    )


# ------------------- Permissions -------------------
from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'admin'

class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'doctor'

class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'patient'
