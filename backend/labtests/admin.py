from django.contrib import admin
from .models import LabTest, LabTestBooking


# -------------------------
# LabTest Admin
# -------------------------
@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'price', 'ml_required', 'created_at')
    search_fields = ('name', 'slug', 'description')
    list_filter = ('ml_required', 'created_at')
    ordering = ('name',)
    prepopulated_fields = {"slug": ("name",)}


# -------------------------
# LabTestBooking Admin
# -------------------------
@admin.register(LabTestBooking)
class LabTestBookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'patient',
        'doctor',
        'lab_test_display',
        'date',
        'time',
        'created_at',
        'access_token',
        'token_expires_at'
    )

    list_filter = (
        'date',
        'doctor',
        'lab_test',
    )

    search_fields = (
        'patient__username',
        'patient__first_name',
        'patient__last_name',
        'doctor__username',
        'doctor__first_name',
        'doctor__last_name',
        'lab_test__name'
    )

    ordering = ('-created_at',)

    readonly_fields = (
        'created_at',
        'access_token',
        'token_created_at',
        'token_expires_at',
    )

    fieldsets = (
        ("Patient & Doctor", {
            "fields": ('patient', 'doctor')
        }),
        ("Test Info", {
            "fields": ('lab_test', 'date', 'time')
        }),
        ("Token (Auto for ML tests)", {
            "fields": (
                'access_token',
                'token_created_at',
                'token_expires_at',
            )
        }),
        ("Timestamps", {
            "fields": ('created_at',)
        })
    )

    # Safe display for lab_test (avoid NoneType error)
    def lab_test_display(self, obj):
        return obj.lab_test.name if obj.lab_test else "—"
    lab_test_display.short_description = "Lab Test"
