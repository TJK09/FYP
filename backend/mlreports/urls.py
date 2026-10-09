from django.urls import path
from .views import MLReportListView, DownloadMLReportView

urlpatterns = [
    path('', MLReportListView.as_view(), name='mlreports-list'),
    path('<int:pk>/download/', DownloadMLReportView.as_view(), name='mlreports-download'),
]
