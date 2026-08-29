from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role


class RoleInline(admin.TabularInline):
    model = User.roles.through
    extra = 1
    verbose_name = "Rôle"
    verbose_name_plural = "Rôles attribués"


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Colonnes visibles dans la liste des utilisateurs
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_responsable', 'get_roles', 'is_staff')
    list_filter = ('is_responsable', 'roles', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name')

    # Ajoute la section "Rôles métier" au formulaire de détail d'un user existant
    fieldsets = UserAdmin.fieldsets + (
        ('Rôles métier (Projet FAB)', {'fields': ('is_responsable', 'roles')}),
    )

    # Permet aussi de définir ça à la création d'un user depuis l'admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Rôles métier (Projet FAB)', {'fields': ('is_responsable', 'roles')}),
    )

    filter_horizontal = UserAdmin.filter_horizontal + ('roles',)

    def get_roles(self, obj):
        return ", ".join([r.get_name_display() for r in obj.roles.all()]) or "—"
    get_roles.short_description = "Rôles"


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name',)