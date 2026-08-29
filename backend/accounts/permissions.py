from rest_framework.permissions import BasePermission


class IsResponsable(BasePermission):
    """Accès complet réservé au Responsable (propriétaire de la ferme)."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.is_responsable
        )


class IsGerant(BasePermission):
    """Gère les ventes et l'approvisionnement."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.has_role('gerant')
        )


class IsChefDuPersonnel(BasePermission):
    """Gère les fonctionnalités liées aux employés."""

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.has_role('chef_du_personnel')
        )


class IsResponsableOrGerant(BasePermission):
    """
    Utile pour les endpoints de vente : le Responsable a accès complet,
    le Gérant aussi mais avec des contraintes de champs gérées au niveau
    de la vue/serializer (ex: modification de prix réservée au Responsable).
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.is_responsable or user.has_role('gerant'))
        )
class IsResponsableOrChefDuPersonnel(BasePermission):
    """Le Responsable a accès complet ; le Chef du personnel gère ce module."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user and user.is_authenticated and
            (user.is_responsable or user.has_role('chef_du_personnel'))
        )