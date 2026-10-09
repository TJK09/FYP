from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class DepressionTest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    audio_file = models.FileField(upload_to="depression_audio/")
    result = models.CharField(max_length=50)
    probability = models.FloatField(null=True, blank=True)
    report_link = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.result}"
