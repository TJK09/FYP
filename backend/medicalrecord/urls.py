from django.urls import path
from .views import (
    MedicalRecordCreateView,
    MedicalRecordListView,
    PatientListView,
    SaveDepressionReportView,
    MedicalRecordFileView,  # <-- add this
)

urlpatterns = [
    path('patients/', PatientListView.as_view(), name='patients-list'),
    path('records/', MedicalRecordListView.as_view(), name='medical-records-list'),
    path('records/create/', MedicalRecordCreateView.as_view(), name='medical-records-create'),
    path('records/save-depression/', SaveDepressionReportView.as_view()),
    path('records/<int:record_id>/file/', MedicalRecordFileView.as_view(), name='medical-record-file'),  # download
]
