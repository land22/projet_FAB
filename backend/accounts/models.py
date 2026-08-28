from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    """
    Rôles cumulables : un utilisateur peut être Gérant ET Chef du personnel
    en même temps (relation many-to-many avec User).
    """
    GERANT = 'gerant'
    CHEF_DU_PERSONNEL = 'chef_du_personnel'

    ROLE_CHOICES = [
        (GERANT, 'Gérant'),
        (CHEF_DU_PERSONNEL, 'Chef du personnel'),
    ]

    name = models.CharField(max_length=50, choices=ROLE_CHOICES, unique=True)

    def __str__(self):
        return self.get_name_display()


class User(AbstractUser):
    """
    Custom User.
    - is_responsable : True pour le Responsable (accès complet, un ou plusieurs
      utilisateurs peuvent porter ce statut selon le besoin métier).
    - roles : many-to-many vers Role, pour permettre le cumul Gérant / Chef du personnel.
    - Super admin = is_superuser (standard Django), accès technique uniquement.
    """
    is_responsable = models.BooleanField(default=False)
    roles = models.ManyToManyField(Role, blank=True, related_name='users')

    def has_role(self, role_name):
        return self.roles.filter(name=role_name).exists()

    def __str__(self):
        return self.username