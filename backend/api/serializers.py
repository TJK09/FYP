from rest_framework import serializers
from .models import Appointment
# import Department from accounts to avoid duplicate model classes
from accounts.models import Department, User as AccountsUser
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from datetime import datetime

# Department serializer (optional - still fine)
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']


class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField(read_only=True)
    patient_name = serializers.SerializerMethodField(read_only=True)
    department_name = serializers.SerializerMethodField(read_only=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Appointment
        fields = [
            'id',
            'patient',
            'patient_name',
            'doctor',
            'doctor_name',
            'department',
            'department_name',
            'date',
            'time',
            'appointment_type',
            'symptoms',
            'description',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_doctor_name(self, obj):
        if obj.doctor:
            full_name = f"{obj.doctor.first_name} {obj.doctor.last_name}".strip()
            return full_name or obj.doctor.username
        return None

    def get_patient_name(self, obj):
        if obj.patient:
            full_name = f"{obj.patient.first_name} {obj.patient.last_name}".strip()
            return full_name or obj.patient.username
        return None

    def get_department_name(self, obj):
        return obj.department.name if obj.department else None

    def validate(self, data):
        request = self.context.get('request')
        method = request.method if request else None
        instance = getattr(self, 'instance', None)

        date_val = data.get('date', getattr(instance, 'date', None))
        time_val = data.get('time', getattr(instance, 'time', None))
        doctor = data.get('doctor', getattr(instance, 'doctor', None))

        if method == 'POST':
            if not date_val or not time_val:
                raise DRFValidationError("Date and time are required to book an appointment.")
            if not doctor:
                raise DRFValidationError("Please select a doctor.")

        if date_val and time_val:
            combined = datetime.combine(date_val, time_val)
            if combined <= datetime.now():
                raise DRFValidationError("Appointment must be scheduled for the future.")
            if doctor:
                qs = Appointment.objects.filter(doctor=doctor, date=date_val, time=time_val)
                if instance:
                    qs = qs.exclude(pk=instance.pk)
                if qs.exists():
                    raise DRFValidationError("Selected doctor already has an appointment at that date & time.")

        return data

    def create(self, validated_data):
        appt = super().create(validated_data)
        try:
            appt.clean()
        except DjangoValidationError as e:
            appt.delete()
            raise DRFValidationError(e.messages)
        return appt

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise DRFValidationError(e.messages)
        return instance
