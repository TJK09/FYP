from django.urls import path
from .views import (
    CreateUserView,
    MyTokenObtainPairView,
    CurrentUserView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
)

urlpatterns = [
    # Registration
    path("user/register/", CreateUserView.as_view(), name="user-register"),

    # JWT Login
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # Current User
    path("user/me/", CurrentUserView.as_view(), name="current-user"),

    # Email Verification
    path("verify-email-token/", VerifyEmailView.as_view(), name="verify-email"),

    # Forgot & Reset Password
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/", ResetPasswordView.as_view(), name="reset-password"),
]
