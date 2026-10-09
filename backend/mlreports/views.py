from rest_framework import generics, permissions
from django.http import FileResponse, Http404
from .models import MLReport
from .serializers import MLReportSerializer

class MLReportListView(generics.ListAPIView):
    serializer_class = MLReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'patient':
            return MLReport.objects.filter(patient=user)
        elif user.role == 'doctor':
            # Optionally, return reports for all patients of this doctor
            return MLReport.objects.all()
        return MLReport.objects.none()


class DownloadMLReportView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            report = MLReport.objects.get(pk=pk)
        except MLReport.DoesNotExist:
            raise Http404("Report not found")
        return FileResponse(report.report_file.open("rb"), content_type="application/pdf")
