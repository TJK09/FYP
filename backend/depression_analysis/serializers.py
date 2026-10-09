from rest_framework import serializers
from .models import DepressionTest

class DepressionTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepressionTest
        fields = "__all__"
        read_only_fields = ("user", "created_at")
