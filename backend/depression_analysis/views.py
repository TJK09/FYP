from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import DepressionTest
from .serializers import DepressionTestSerializer
from labtests.models import LabTestBooking
from medicalrecord.models import MedicalRecord
from django.utils import timezone
from django.conf import settings
from django.core.mail import EmailMessage
import os, requests

FASTAPI_URL = "http://51.21.131.234:8000/predict"

class AnalyzeDepressionView(APIView):
    permission_classes = [IsAuthenticated]  # JWT-based authentication

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Token is required"}, status=403)

        try:
            booking = LabTestBooking.objects.get(access_token=token, patient=request.user)
            if not booking.token_is_valid():
                return Response({"error": "Invalid or expired token"}, status=403)
        except LabTestBooking.DoesNotExist:
            return Response({"error": "Invalid token"}, status=403)

        audio_file = request.FILES.get("file")
        if not audio_file:
            return Response({"error": "No audio file uploaded"}, status=400)

        # Send to FastAPI
        try:
            response = requests.post(FASTAPI_URL, files={"file": audio_file})
            response.raise_for_status()
        except Exception as e:
            return Response({"error": "Failed to analyze audio", "details": str(e)}, status=500)

        data = response.json()
        result = data.get("final_prediction")
        probability = data.get("final_probability")
        report_link = f"http://51.21.131.234:8000{data.get('report_link','')}"

        test_instance = DepressionTest.objects.create(
            user=request.user,
            audio_file=audio_file,
            result=result,
            probability=probability,
            report_link=report_link
        )

        # Expire token
        booking.token_expires_at = timezone.now()
        booking.save(update_fields=['token_expires_at'])

        # Save PDF to MedicalRecord
        try:
            pdf_response = requests.get(report_link)
            pdf_response.raise_for_status()
            filename = f"depression_report_{request.user.id}_{int(timezone.now().timestamp())}.pdf"
            save_dir = os.path.join(settings.MEDIA_ROOT, "medical_records")
            os.makedirs(save_dir, exist_ok=True)
            save_path = os.path.join(save_dir, filename)
            with open(save_path, "wb") as f:
                f.write(pdf_response.content)

            MedicalRecord.objects.create(
                patient=request.user,
                doctor=None,
                diagnosis="Depression Test Report",
                lab_results=f"medical_records/{filename}",
                notes="Automatically generated Depression ML report."
            )
        except Exception as e:
            print("Failed to save PDF:", e)

        # Send email
        try:
            email = EmailMessage(
                subject="Depression Test Result",
                body=f"Result: {result}\nConfidence: {probability*100:.2f}%\nReport: {report_link}",
                to=[request.user.email]
            )
            email.send(fail_silently=True)
        except Exception as e:
            print("Failed to send email:", e)

        serializer = DepressionTestSerializer(test_instance)
        return Response(serializer.data, status=201)
