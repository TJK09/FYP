from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from django.core.files.base import ContentFile
from django.http import FileResponse, Http404

from .models import MedicalRecord
from .serializers import MedicalRecordSerializer, PatientSerializer
from accounts.models import User
from labtests.models import LabTestBooking

import requests
import os
import mimetypes

# ------------------ Patient List ------------------
class PatientListView(generics.ListAPIView):
    queryset = User.objects.filter(role='patient')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

# ------------------ Medical Record Create ------------------
class MedicalRecordCreateView(generics.CreateAPIView):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != "doctor":
            raise PermissionDenied("Only doctors can create medical records.")
        serializer.save(doctor=self.request.user)

# ------------------ List Medical Records ------------------
class MedicalRecordListView(generics.ListAPIView):
    serializer_class = MedicalRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "doctor":
            return MedicalRecord.objects.filter(doctor=user)
        if user.role == "patient":
            return MedicalRecord.objects.filter(patient=user)
        if user.role == "admin":
            return MedicalRecord.objects.all()
        return MedicalRecord.objects.none()

# ------------------ Save Depression Report ------------------
class SaveDepressionReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        lab_test_booking_id = request.data.get("lab_test_booking_id")
        report_link = request.data.get("report_link")

        if not lab_test_booking_id or not report_link:
            return Response(
                {"error": "Missing lab_test_booking_id or report_link"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking = LabTestBooking.objects.get(id=lab_test_booking_id, patient=user)
        except LabTestBooking.DoesNotExist:
            return Response({"error": "Lab booking not found"}, status=404)

        # Download file
        try:
            resp = requests.get(report_link, stream=True, timeout=20)
            resp.raise_for_status()
        except Exception as e:
            return Response(
                {"error": "Failed to fetch file", "details": str(e)},
                status=502
            )

        file_bytes = b""
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                file_bytes += chunk

        # Get extension from URL
        filename_ext = os.path.splitext(report_link)[-1] or ".pdf"
        timestamp = timezone.now().strftime("%Y%m%d%H%M%S")
        filename = f"depression_report_booking_{booking.id}_{timestamp}{filename_ext}"

        content_file = ContentFile(file_bytes, name=filename)

        try:
            record, created = MedicalRecord.objects.get_or_create(
                patient=user,
                doctor=booking.doctor,
                defaults={"diagnosis": "", "lab_results": ""}
            )
            record.lab_results.save(filename, content_file, save=True)

            note_append = f"\nDepression report added on {timezone.now().strftime('%Y-%m-%d %H:%M:%S')} (booking id: {booking.id})"
            record.notes = (record.notes or "") + note_append
            record.save(update_fields=["notes"])
        except Exception as e:
            return Response(
                {"error": "Failed to save file", "details": str(e)},
                status=500
            )

        serializer = MedicalRecordSerializer(record, context={"request": request})
        return Response(serializer.data, status=200)

# ------------------ Download any file ------------------
import os
import mimetypes
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import MedicalRecord

class MedicalRecordFileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, record_id):
        try:
            record = MedicalRecord.objects.get(id=record_id)
        except MedicalRecord.DoesNotExist:
            raise Http404("Record not found")

        # Permission checks
        if request.user.role == "patient" and request.user != record.patient:
            return Response({"error": "Unauthorized"}, status=403)
        if request.user.role == "doctor" and request.user != record.doctor:
            return Response({"error": "Unauthorized"}, status=403)

        if not record.lab_results:
            return Response({"error": "No file uploaded"}, status=404)

        file_path = record.lab_results.path
        filename = os.path.basename(file_path)

        if not os.path.exists(file_path):
            raise Http404("File not found on server")

        # Detect MIME type automatically
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"  # fallback for unknown types

        response = FileResponse(open(file_path, "rb"), content_type=mime_type)
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Access-Control-Expose-Headers"] = "Content-Disposition"

        return response

