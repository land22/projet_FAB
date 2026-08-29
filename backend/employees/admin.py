from django.contrib import admin
from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'poste', 'statut', 'date_embauche')
    list_filter = ('statut', 'poste')
    search_fields = ('first_name', 'last_name')