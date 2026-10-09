from rest_framework import serializers
from .models import MedicalRecord
from accounts.models import User


class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class MedicalRecordSerializer(serializers.ModelSerializer):
    doctor = UserBasicSerializer(read_only=True)
    patient = UserBasicSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(
        source='patient',
        queryset=User.objects.filter(role='patient'),
        write_only=True
    )
    # NEW: full URL for the PDF file
    lab_results_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MedicalRecord
        fields = [
            'id',
            'patient',
            'patient_id',
            'doctor',
            'diagnosis',
            'prescriptions',
            'lab_results',      # keep raw path if you want
            'lab_results_url',  # full absolute URL
            'notes',
            'created_at',
        ]

    def get_lab_results_url(self, obj):
        """
        Return a full absolute URL for the lab_results file,
        e.g. http://127.0.0.1:8000/media/medical_reports/.....pdf
        """
        request = self.context.get('request')
        if obj.lab_results and hasattr(obj.lab_results, 'url'):
            if request:
                return request.build_absolute_uri(obj.lab_results.url)
            # fallback if no request in context
            return obj.lab_results.url
        return None



class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
