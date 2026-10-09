from django.contrib import admin
from .models import Appointment
from accounts.models import Department, User

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    # Show these fields in the list view
    list_display = (
        'id',
        'patient',
        'doctor',
        'department',
        'date',
        'time',
        'appointment_type',
        'status',
        'created_at',
        'updated_at',
    )

    # Add filters in admin sidebar
    list_filter = ('status', 'appointment_type', 'doctor', 'department', 'date')

    # Search by patient, doctor, and department
    search_fields = ('patient__username', 'patient__first_name', 'patient__last_name',
                     'doctor__username', 'doctor__first_name', 'doctor__last_name',
                     'department__name')

    # Make some fields editable directly from the list view
    list_editable = ('status', 'appointment_type', 'doctor', 'department')

    # Ordering
    ordering = ('date', 'time')

    # Ensure superusers can do everything
    def has_add_permission(self, request):
        return True

    def has_change_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        if request.user.is_superuser:
            return True
        return super().has_delete_permission(request, obj)

    def get_readonly_fields(self, request, obj=None):
        # Only non-superusers get readonly fields; superusers can edit everything
        if request.user.is_superuser:
            return ()
        return super().get_readonly_fields(request, obj)
