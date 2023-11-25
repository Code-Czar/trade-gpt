from django.contrib import admin
from .models import User  # Import your model here

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'details', 'role', 'permission_level')  # Fields to display in the admin list view
    search_fields = ('id',)  # Fields to search in the admin
    list_filter = ('role', 'permission_level')  # Fields to filter in the admin
    ordering = ('id',)  # Default ordering

    # If you want to customize the form view, you can do so here:
    # fieldsets = (
    #     (None, {
    #         'fields': ('id', 'details', 'role', 'permission_level')
    #     }),
    # )
