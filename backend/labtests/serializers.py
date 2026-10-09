from rest_framework import serializers
from datetime import date
from django.utils import timezone
from .models import LabTestBooking, LabTest
from django.contrib.auth import get_user_model

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Return minimum patient info for frontend."""
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = ['id', 'name', 'slug', 'description', 'price', 'ml_required', 'created_at']
        read_only_fields = ['id', 'created_at']


class LabTestBookingSerializer(serializers.ModelSerializer):

    # NEW: return full patient details
    patient_detail = UserBasicSerializer(source="patient", read_only=True)

    doctor_username = serializers.CharField(write_only=True)
    access_token = serializers.CharField(read_only=True)
    token_expires_at = serializers.DateTimeField(read_only=True)
    lab_test_detail = LabTestSerializer(source='lab_test', read_only=True)

    class Meta:
        model = LabTestBooking
        fields = [
            'id', 'patient', 'patient_detail', 'doctor', 'doctor_username',
            'lab_test', 'lab_test_detail', 'date', 'time',
            'created_at', 'access_token', 'token_expires_at'
        ]
        read_only_fields = [
            'id', 'patient', 'created_at', 'access_token',
            'token_expires_at', 'lab_test_detail', 'doctor', 'patient_detail'
        ]
        extra_kwargs = {
            'doctor': {'required': False}
        }

    def validate(self, attrs):
        # Validate date/time
        date_val = attrs.get('date')
        time_val = attrs.get('time')
        lab_test = attrs.get('lab_test')

        if date_val < date.today():
            raise serializers.ValidationError("You cannot book a lab test in the past.")

        if date_val == date.today():
            now_time = timezone.localtime().time()
            if time_val <= now_time:
                raise serializers.ValidationError(
                    "You cannot book a lab test for a past time today."
                )

        # Resolve doctor from username
        doctor_username = attrs.pop('doctor_username', None)
        if not doctor_username:
            raise serializers.ValidationError("doctor_username is required.")

        try:
            doctor = User.objects.get(username=doctor_username, role='doctor')
        except User.DoesNotExist:
            raise serializers.ValidationError(
                f"Doctor '{doctor_username}' does not exist or is not a doctor."
            )

        attrs['doctor'] = doctor

        if not lab_test:
            raise serializers.ValidationError("lab_test is required and must be valid.")

        return attrs

    def create(self, validated_data):
        patient = validated_data.pop('patient', None)
        booking = LabTestBooking.objects.create(patient=patient, **validated_data)

        if booking.lab_test.ml_required:
            booking.generate_token(lifetime_hours=24)

        return booking
