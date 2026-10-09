from rest_framework import serializers
from .models import MLReport

class MLReportSerializer(serializers.ModelSerializer):
    report_file_url = serializers.SerializerMethodField()

    class Meta:
        model = MLReport
        fields = ['id', 'patient', 'medical_record', 'report_type', 'report_file', 'report_file_url', 'created_at']

    def get_report_file_url(self, obj):
        request = self.context.get('request')
        if obj.report_file and hasattr(obj.report_file, 'url'):
            if request:
                return request.build_absolute_uri(obj.report_file.url)
            return obj.report_file.url
        return None
