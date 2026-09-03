from django.db.models import Sum
from rest_framework import serializers
from .models import ProduitApprovisionnement, Approvisionnement, Revente


class ProduitApprovisionnementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProduitApprovisionnement
        fields = '__all__'


class ReventeSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    produit_nom = serializers.CharField(source='approvisionnement.produit.nom', read_only=True)
    quantite_vendue = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    montant_vente = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    cout = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    benefice = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Revente
        fields = [
            'id', 'approvisionnement', 'produit_nom', 'client', 'client_nom',
            'quantite', 'avaries', 'prix_vente', 'date',
            'quantite_vendue', 'montant_vente', 'cout', 'benefice',
            'created_at', 'updated_at',
        ]

    def validate(self, attrs):
        approvisionnement = attrs.get('approvisionnement') or getattr(self.instance, 'approvisionnement', None)
        quantite = attrs.get('quantite', getattr(self.instance, 'quantite', 0))
        if approvisionnement is not None:
            deja_distribuee = approvisionnement.reventes.exclude(
                pk=self.instance.pk if self.instance else None
            ).aggregate(total=Sum('quantite'))['total'] or 0
            if deja_distribuee + quantite > approvisionnement.quantite:
                restante = approvisionnement.quantite - deja_distribuee
                raise serializers.ValidationError({
                    'quantite': f"Quantité disponible dans ce lot : {restante}.",
                })
        return attrs


class ApprovisionnementSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source='produit.nom', read_only=True)
    montant_achat = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    quantite_distribuee = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    quantite_restante = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    montant_vente_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    benefice_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    reventes = ReventeSerializer(many=True, read_only=True)

    class Meta:
        model = Approvisionnement
        fields = [
            'id', 'produit', 'produit_nom', 'quantite', 'prix_achat', 'date',
            'montant_achat', 'quantite_distribuee', 'quantite_restante',
            'montant_vente_total', 'benefice_total', 'reventes',
            'created_at', 'updated_at',
        ]
