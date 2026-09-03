from django.conf import settings
from django.db import models


class AuditLog(models.Model):
    """
    Trace des actions de modification effectuées via l'API (créations, modifications,
    suppressions, connexions) : qui, depuis quelle IP, quelle action, à quelle date.
    Permet de retracer qui a fait quoi en cas de problème.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='audit_logs',
    )
    username = models.CharField(max_length=150, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    method = models.CharField(max_length=10)
    path = models.CharField(max_length=255)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.method} {self.path} — {self.username or 'anonyme'} ({self.created_at:%Y-%m-%d %H:%M})"
