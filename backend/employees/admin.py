from django.contrib import admin
from .models import Employee, Avance, Maladie


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'poste', 'statut', 'date_embauche')
    list_filter = ('statut', 'poste')
    search_fields = ('first_name', 'last_name')


@admin.register(Avance)
class AvanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'montant', 'date')
    list_filter = ('date',)
    search_fields = ('employee__first_name', 'employee__last_name')


@admin.register(Maladie)
class MaladieAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date_debut', 'nombre_jours', 'montant_depense')
    list_filter = ('date_debut',)
    search_fields = ('employee__first_name', 'employee__last_name')