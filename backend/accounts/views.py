from django.conf import settings
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import User, Role
from .serializers import RegisterSerializer, UserSerializer, ChangeRoleSerializer
from .permissions import IsSuperUserOrResponsable

REFRESH_COOKIE_NAME = 'refresh_token'
REFRESH_COOKIE_PATH = '/api/auth/'


def _set_refresh_cookie(response, refresh_token):
    max_age = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh_token,
        max_age=max_age,
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax',
        path=REFRESH_COOKIE_PATH,
    )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CookieTokenObtainPairView(TokenObtainPairView):
    """Login : renvoie l'access token dans le corps de la réponse, place le refresh token dans un cookie httpOnly."""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        refresh = response.data.pop('refresh', None)
        if refresh:
            _set_refresh_cookie(response, refresh)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    """Rafraîchissement : lit le refresh token depuis le cookie httpOnly plutôt que depuis le corps de la requête."""

    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(REFRESH_COOKIE_NAME)
        if not refresh_token:
            return Response({'detail': 'Refresh token manquant.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = TokenRefreshSerializer(data={'refresh': refresh_token})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        response = Response({'access': data['access']})
        new_refresh = data.get('refresh')
        if new_refresh:
            _set_refresh_cookie(response, new_refresh)
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_COOKIE_NAME)
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass  # cookie déjà invalide/expiré : on nettoie quand même côté client

        response = Response(status=status.HTTP_205_RESET_CONTENT)
        response.delete_cookie(REFRESH_COOKIE_NAME, path=REFRESH_COOKIE_PATH)
        return response


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
