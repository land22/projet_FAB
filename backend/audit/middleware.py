import json

from .models import AuditLog

MUTATING_METHODS = {'POST', 'PUT', 'PATCH', 'DELETE'}
EXCLUDED_PATHS = ('/api/auth/login/refresh/',)


class AuditLogMiddleware:
    """
    Journalise chaque action de modification (POST/PUT/PATCH/DELETE) sur l'API,
    y compris les connexions : utilisateur, IP, méthode, endpoint, code de statut.

    Le nom d'utilisateur soumis est capturé même pour les requêtes non authentifiées
    (ex : tentative de connexion, échouée ou non), afin de tracer qui a essayé quoi.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        self._log(request, response)
        return response

    def _log(self, request, response):
        if request.method not in MUTATING_METHODS:
            return
        if not request.path.startswith('/api/') or request.path in EXCLUDED_PATHS:
            return

        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            username = user.username
        else:
            user = None
            username = self._extract_username(request)

        AuditLog.objects.create(
            user=user,
            username=username,
            ip_address=self._get_client_ip(request),
            method=request.method,
            path=request.path,
            status_code=response.status_code,
        )

    @staticmethod
    def _extract_username(request):
        try:
            body = json.loads(request.body or b'{}')
            return body.get('username', '') or ''
        except (ValueError, TypeError):
            return ''

    @staticmethod
    def _get_client_ip(request):
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
