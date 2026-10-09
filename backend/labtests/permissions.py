from rest_framework import permissions

class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'doctor'

class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == 'patient'
