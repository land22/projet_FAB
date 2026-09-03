from django.db.models import Sum, F, ExpressionWrapper, DecimalField
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsResponsableOrGerant
from .models import ProduitApprovisionnement, Approvisionnement, Revente
from .serializers import ProduitApprovisionnementSerializer, ApprovisionnementSerializer, ReventeSerializer

MONTANT_FIELD = DecimalField(max_digits=12, decimal_places=2)


class ProduitApprovisionnementViewSet(viewsets.ModelViewSet):
    """CRUD sur les produits d'approvisionnement (non cultivés par l'exploitation)."""
    queryset = ProduitApprovisionnement.objects.all()
    serializer_class = ProduitApprovisionnementSerializer
    permission_classes = [IsResponsableOrGerant]


class ApprovisionnementViewSet(viewsets.ModelViewSet):
    """
    CRUD sur les lots achetés (Rubrique E). Un lot est ensuite réparti entre
    une ou plusieurs bayam-sellam via des Reventes.
    """
    serializer_class = ApprovisionnementSerializer
    permission_classes = [IsResponsableOrGerant]

    def get_queryset(self):
        queryset = Approvisionnement.objects.select_related('produit').prefetch_related('reventes').all()
        produit_id = self.request.query_params.get('produit')
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        if produit_id:
            queryset = queryset.filter(produit_id=produit_id)
        if date_debut:
            queryset = queryset.filter(date__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date__lte=date_fin)
        return queryset

    @action(detail=False, methods=['get'])
    def resume(self, request):
        """Agrégation par produit, calculée sur les quantités réellement revendues."""
        approvisionnements = self.get_queryset()

        montant_vente_expr = ExpressionWrapper(
            (F('quantite') - F('avaries')) * F('prix_vente'), output_field=MONTANT_FIELD
        )
        cout_expr = ExpressionWrapper(
            F('quantite') * F('approvisionnement__prix_achat'), output_field=MONTANT_FIELD
        )
        reventes = Revente.objects.filter(approvisionnement__in=approvisionnements)

        par_produit = list(
            reventes.values('approvisionnement__produit_id', produit_nom=F('approvisionnement__produit__nom')).annotate(
                montant_vente=Sum(montant_vente_expr),
                montant_achat=Sum(cout_expr),
                avaries=Sum('avaries'),
            ).order_by('produit_nom')
        )
        for row in par_produit:
            row['produit'] = row.pop('approvisionnement__produit_id')
            row['montant_vente'] = row['montant_vente'] or 0
            row['montant_achat'] = row['montant_achat'] or 0
            row['avaries'] = row['avaries'] or 0
            row['benefice'] = row['montant_vente'] - row['montant_achat']

        totaux = reventes.aggregate(
            montant_vente=Sum(montant_vente_expr),
            montant_achat=Sum(cout_expr),
            avaries=Sum('avaries'),
        )
        totaux['montant_vente'] = totaux['montant_vente'] or 0
        totaux['montant_achat'] = totaux['montant_achat'] or 0
        totaux['avaries'] = totaux['avaries'] or 0
        totaux['benefice'] = totaux['montant_vente'] - totaux['montant_achat']

        return Response({'par_produit': par_produit, 'totaux': totaux})


class ReventeViewSet(viewsets.ModelViewSet):
    """CRUD sur les reventes d'un lot d'approvisionnement à une bayam-sellam donnée."""
    serializer_class = ReventeSerializer
    permission_classes = [IsResponsableOrGerant]

    def get_queryset(self):
        queryset = Revente.objects.select_related('approvisionnement__produit', 'client').all()
        approvisionnement_id = self.request.query_params.get('approvisionnement')
        client_id = self.request.query_params.get('client')
        if approvisionnement_id:
            queryset = queryset.filter(approvisionnement_id=approvisionnement_id)
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        return queryset
