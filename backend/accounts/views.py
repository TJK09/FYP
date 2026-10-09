from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.signing import dumps, loads, BadSignature, SignatureExpired
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, MyTokenObtainPairSerializer
from .models import Department

User = get_user_model()

# ------------------- User Registration -------------------
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# ------------------- JWT Login -------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# ------------------- Current Logged-in User -------------------
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# ------------------- Email Verification -------------------
class VerifyEmailView(APIView):
    permission_classes = []

    def get(self, request):
        token = request.GET.get('token')
        if not token:
            return Response({'detail': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            data = loads(token, max_age=60*60*24)  # 24 hours
            user_id = data.get('user_id')
            user = User.objects.get(id=user_id)
            user.email_verified = True
            user.save()
            return Response({'detail': 'Email verified successfully'})
        except SignatureExpired:
            return Response({'detail': 'Verification link expired'}, status=status.HTTP_400_BAD_REQUEST)
        except (BadSignature, User.DoesNotExist):
            return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

# ------------------- Forgot Password -------------------
class ForgotPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')

        if not username or not email:
            return Response(
                {'detail': 'Both username and email are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(username=username, email=email)
            token = dumps({'user_id': user.id})
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

            send_mail(
                subject='Reset your password',
                message=f'Click the link to reset your password: {reset_url}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False
            )
            # Return token to frontend for redirect
            return Response({
                'detail': 'Password reset link sent to your email.',
                'token': token
            })
        except User.DoesNotExist:
            return Response(
                {'detail': 'No user found with this username and email combination.'},
                status=status.HTTP_404_NOT_FOUND
            )

# ------------------- Reset Password -------------------
class ResetPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not token or not new_password:
            return Response(
                {'detail': 'Token and new password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            data = loads(token, max_age=60*60*24)  # token valid 24h
            user_id = data.get('user_id')
            user = User.objects.get(id=user_id)
            user.set_password(new_password)
            user.save()
            return Response({'detail': 'Password reset successfully.'})
        except SignatureExpired:
            return Response({'detail': 'Reset link expired.'}, status=status.HTTP_400_BAD_REQUEST)
        except (BadSignature, User.DoesNotExist):
            return Response({'detail': 'Invalid reset link.'}, status=status.HTTP_400_BAD_REQUEST)

# ------------------- Department List -------------------
class DepartmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        departments = Department.objects.all()
        data = [{"id": d.id, "name": d.name} for d in departments]
        return Response(data)

# ------------------- Doctor List (optional filter by department) -------------------
class DoctorListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        department_id = request.query_params.get("department")
        doctors = User.objects.filter(role='doctor')
        if department_id:
            doctors = doctors.filter(department_id=department_id)
        data = [
            {
                "id": d.id,
                "name": f"{d.first_name} {d.last_name}".strip() or d.username,
                "department": d.department.name if d.department else None
            }
            for d in doctors
        ]
        return Response(data)
