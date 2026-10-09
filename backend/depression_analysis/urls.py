from django.urls import path
from .views import AnalyzeDepressionView

urlpatterns = [
    path("submit/", AnalyzeDepressionView.as_view(), name="depression-submit"),
]
