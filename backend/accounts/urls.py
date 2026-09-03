from django.urls import path
from .views import (
    RegisterView, LogoutView, MeView, ChangeUserRoleView, UserListView, RoleListView,
    CookieTokenObtainPairView, CookieTokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CookieTokenObtainPairView.as_view(), name='login'),
    path('login/refresh/', CookieTokenRefreshView.as_view(), name='login-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', MeView.as_view(), name='me'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/role/', ChangeUserRoleView.as_view(), name='change-role'),
    path('roles/', RoleListView.as_view(), name='role-list'),
]
