from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import (
    CreateUserView,
    MyTokenObtainPairView,
    CurrentUserView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
    DepartmentListView,
    DoctorListView,
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # Main API
    path('api/', include('api.urls')),

    # Lab Tests API
    path('api/labtests/', include('labtests.urls')),

    # Depression Analysis API
    path("api/depression/", include("depression_analysis.urls")),

    # Medical Records API
    path('api/medicalrecord/', include('medicalrecord.urls')),

    # ML Reports API (NEW)
    path('api/mlreports/', include('mlreports.urls')),

    # Accounts / Authentication
    path('accounts/user/register/', CreateUserView.as_view(), name="register"),
    path('accounts/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('accounts/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('accounts/user/me/', CurrentUserView.as_view(), name='current_user'),

    # Email Verification
    path('accounts/verify-email/', VerifyEmailView.as_view(), name='verify_email'),

    # Forgot / Reset Password
    path('accounts/forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('accounts/reset-password/', ResetPasswordView.as_view(), name='reset_password'),

    # Departments & Doctors
    path('accounts/departments/', DepartmentListView.as_view(), name='department_list'),
    path('accounts/doctors/', DoctorListView.as_view(), name='doctor_list'),

    # Browsable API auth (optional)
    path('accounts-auth/', include("rest_framework.urls")),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)