from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, Role
from .serializers import RegisterSerializer, UserSerializer, ChangeRoleSerializer
from .permissions import IsSuperUserOrResponsable


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except (KeyError, TokenError):
            return Response(
                {"detail": "Refresh token invalide ou manquant."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangeUserRoleView(generics.UpdateAPIView):
    """
    Attribution du statut Responsable et des rôles à un utilisateur.
    - Le super user peut tout modifier, sur tout le monde.
    - Le Responsable peut attribuer/retirer les rôles Gérant et Chef du personnel,
      sur n'importe qui sauf un autre Responsable, mais ne peut jamais toucher au
      statut Responsable lui-même.
    """
    queryset = User.objects.all()
    serializer_class = ChangeRoleSerializer
    permission_classes = [IsSuperUserOrResponsable]

    def update(self, request, *args, **kwargs):
        target_user = self.get_object()
        requester = request.user

        if not requester.is_superuser:
            if 'is_responsable' in request.data:
                return Response(
                    {'detail': "Seul le super administrateur peut attribuer ou retirer le statut Responsable."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            if target_user.is_responsable and target_user.id != requester.id:
                return Response(
                    {'detail': "Un Responsable ne peut pas modifier les rôles d'un autre Responsable."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = self.get_serializer(target_user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()
        return Response(UserSerializer(updated_user).data)


class UserListView(generics.ListAPIView):
    """Liste de tous les utilisateurs — accessible au super user et au Responsable."""
    queryset = User.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsSuperUserOrResponsable]


class RoleListView(APIView):
    """Liste des rôles disponibles (Gérant, Chef du personnel, ...)."""
    permission_classes = [IsSuperUserOrResponsable]

    def get(self, request):
        return Response([{'value': value, 'label': label} for value, label in Role.ROLE_CHOICES])
