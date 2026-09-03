from rest_framework.permissions import BasePermission


class IsSuperUser(BasePermission):
    """Réservé au super administrateur Django (gestion des comptes et des rôles)."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_superuser
        )


class IsSuperUserOrResponsable(BasePermission):
    """
    Le super user gère tout sans restriction. Le Responsable peut aussi accéder
    à la gestion des utilisateurs, mais avec des restrictions métier appliquées
    au niveau de la vue (ne peut pas toucher au statut Responsable, ni aux rôles
    d'un autre Responsable).
    """

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_superuser or request.user.is_responsable)
        )


class IsResponsable(BasePermission):
    """Accès complet réservé au Responsable (propriétaire de la ferme) et au super user."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.is_superuser or user.is_responsable)
        )


class IsGerant(BasePermission):
    """Gère les ventes et l'approvisionnement. Le super user a toujours accès."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.is_superuser or user.has_role('gerant'))
        )


class IsChefDuPersonnel(BasePermission):
    """Gère les fonctionnalités liées aux employés. Le super user a toujours accès."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.is_superuser or user.has_role('chef_du_personnel'))
        )


class IsResponsableOrGerant(BasePermission):
    """
    Utile pour les endpoints de vente : le Responsable et le super user ont accès
    complet, le Gérant aussi mais avec des contraintes de champs gérées au niveau
    de la vue/serializer (ex: modification de prix réservée au Responsable).
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.is_superuser or user.is_responsable or user.has_role('gerant'))
        )


class IsResponsableOrChefDuPersonnel(BasePermission):
    """Le Responsable et le super user ont accès complet ; le Chef du personnel gère ce module."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.is_superuser or user.is_responsable or user.has_role('chef_du_personnel'))
        )