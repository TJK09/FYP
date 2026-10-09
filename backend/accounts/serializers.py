from django.contrib.auth import get_user_model  
from rest_framework import serializers
from django.core.signing import dumps
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()  

# ------------------- User Serializer -------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'contact_number', 'email', 'password', 'role', 'department')
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # Extract department (if any)
        department = validated_data.pop('department', None)

        user = User.objects.create_user(**validated_data)

        if user.role == 'doctor' and department:
            user.department = department
        user.email_verified = False
        user.save()

        # Send verification email
        token = dumps({'user_id': user.id})
        verification_url = f"{settings.FRONTEND_URL}/verify-email-token?token={token}"
        send_mail(
            subject='Verify your email',
            message=f'Please click the following link to verify your email address: {verification_url}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return user

# ------------------- JWT Serializer -------------------
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.email_verified:
            raise serializers.ValidationError('Email not verified. Please verify your email before logging in.')

        return data
