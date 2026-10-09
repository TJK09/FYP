from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department

# ------------------- Department Admin -------------------
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)
    ordering = ('name',)

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

# ------------------- User Admin -------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Fields displayed in the admin list view
    list_display = (
        'id', 'username', 'first_name', 'last_name', 'email', 
        'role', 'department', 'is_staff', 'is_superuser', 'email_verified'
    )
    list_filter = ('role', 'is_staff', 'is_superuser', 'email_verified', 'department')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'contact_number')
    ordering = ('username',)

    # Fields editable from list view
    list_editable = ('role', 'department', 'email_verified')

    # Add and change forms
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'contact_number')}),
        ('Role & Department', {'fields': ('role', 'department', 'email_verified')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role', 'department')
        }),
    )

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
        if request.user.is_superuser:
            return ()
        return super().get_readonly_fields(request, obj)
