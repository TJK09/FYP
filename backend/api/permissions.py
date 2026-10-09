from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsPatientOrReadOnly(BasePermission):
    """
    Allow safe methods to anyone authenticated.
    Allow POST only if user.role == 'patient'.
    For other methods, rely on more specific permissions per-view.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        # creation-only guard
        if request.method == 'POST':
            return getattr(request.user, 'role', None) == 'patient'
        return True

class IsAppointmentOwnerOrDoctor(BasePermission):
    """
    Object-level permission:
     - Doctors can retrieve and update appointments where they are the doctor
     - Patients can retrieve and cancel their own appointments (or view)
     - Other users: deny (superusers can use admin site as you requested)
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        # superusers: allow (they can still use admin)
        if user.is_superuser:
            return True

        if getattr(user, 'role', None) == 'doctor':
            # doctor can view & update appointments related to them
            return obj.doctor_id == user.id

        if getattr(user, 'role', None) == 'patient':
            # patient can view and perform limited updates (e.g. cancel their own appointment)
            return obj.patient_id == user.id

        # default deny
        return False
