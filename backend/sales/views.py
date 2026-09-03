from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsResponsableOrGerant
from .models import Client, Speculation, Livraison, Versement
from .serializers import ClientSerializer, SpeculationSerializer, LivraisonSerializer, VersementSerializer


class SpeculationViewSet(viewsets.ModelViewSet):
    """CRUD sur les spéculations (tomate, piment, pastèque, poivron, ...)."""
    queryset = Speculation.objects.all()
    serializer_class = SpeculationSerializer
    permission_classes = [IsResponsableOrGerant]


class ClientViewSet(viewsets.ModelViewSet):
    """CRUD sur les bayam-sellam (clientes)."""
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsResponsableOrGerant]

    @action(detail=False, methods=['get'])
    def resume(self, request):
        """
        Vue « Gestion des clients » : crédit et versement du jour par client.
        La colonne total des versements est réservée au Responsable.
        """
        today = timezone.now().date()
        rows = []
        credit_total = 0
        for client in self.get_queryset():
            livraisons = client.livraisons.all()
            client_credit = sum((l.credit for l in livraisons), 0)
            versement_du_jour = Versement.objects.filter(
                livraison__client=client, date=today
            ).aggregate(total=Sum('montant'))['total'] or 0
            rows.append({
                'client': client.id,
                'nom': client.nom,
                'credit': client_credit,
                'versement_du_jour': versement_du_jour,
            })
            credit_total += client_credit

        data = {
            'clients': rows,
            'credit_total': credit_total,
        }
        if request.user.is_superuser or request.user.is_responsable:
            data['total_versements'] = Versement.objects.aggregate(
                total=Sum('montant')
            )['total'] or 0

        return Response(data)


class LivraisonViewSet(viewsets.ModelViewSet):
    """
    CRUD sur les livraisons (ventes). Le Gérant peut créer/consulter/appliquer une
    remise ; seul le Responsable peut corriger le prix d'une livraison déjà enregistrée
    (contrôle appliqué dans LivraisonSerializer.validate).
    """
    serializer_class = LivraisonSerializer
    permission_classes = [IsResponsableOrGerant]

    def get_queryset(self):
        queryset = Livraison.objects.select_related('client', 'speculation').all()
        client_id = self.request.query_params.get('client')
        speculation_id = self.request.query_params.get('speculation')
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        if speculation_id:
            queryset = queryset.filter(speculation_id=speculation_id)
        if date_debut:
            queryset = queryset.filter(date__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date__lte=date_fin)
        return queryset


class VersementViewSet(viewsets.ModelViewSet):
    """CRUD sur les versements (recouvrements), toujours rattachés à une livraison précise."""
    serializer_class = VersementSerializer
    permission_classes = [IsResponsableOrGerant]

    def get_queryset(self):
        queryset = Versement.objects.select_related('livraison', 'livraison__client').all()
        livraison_id = self.request.query_params.get('livraison')
        client_id = self.request.query_params.get('client')
        if livraison_id:
            queryset = queryset.filter(livraison_id=livraison_id)
        if client_id:
            queryset = queryset.filter(livraison__client_id=client_id)
        return queryset
