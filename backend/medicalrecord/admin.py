from django.contrib import admin
from .models import MedicalRecord


@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = (
        "id", "patient", "doctor",
        "short_diagnosis", "created_at"
    )

    list_filter = ("doctor", "patient", "created_at")

    search_fields = (
        "patient__username",
        "doctor__username",
        "diagnosis",
        "prescriptions",
    )

    readonly_fields = ("created_at",)

    fieldsets = (
        ("Patient & Doctor Info", {
            "fields": ("patient", "doctor"),
            "classes": ("wide",)
        }),

        ("Medical Details", {
            "fields": ("diagnosis", "prescriptions", "lab_results", "notes"),
            "classes": ("collapse",)
        }),

        ("System Information", {
            "fields": ("created_at",),
        }),
    )

    def short_diagnosis(self, obj):
        return (obj.diagnosis[:40] + "...") if len(obj.diagnosis) > 40 else obj.diagnosis

    short_diagnosis.short_description = "Diagnosis"
