from rest_framework import serializers
from .models import Client, Speculation, Livraison, Versement


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class SpeculationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Speculation
        fields = '__all__'


class VersementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Versement
        fields = ['id', 'livraison', 'montant', 'date', 'created_at']


class LivraisonSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    speculation_nom = serializers.CharField(source='speculation.nom', read_only=True)
    montant_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_verse = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    credit = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    versements = VersementSerializer(many=True, read_only=True)

    class Meta:
        model = Livraison
        fields = [
            'id', 'client', 'client_nom', 'speculation', 'speculation_nom',
            'quantite', 'prix_unitaire', 'remise', 'date',
            'montant_total', 'total_verse', 'credit', 'versements',
            'created_at', 'updated_at',
        ]

    def validate(self, attrs):
        request = self.context.get('request')
        if self.instance is not None and 'prix_unitaire' in attrs:
            if attrs['prix_unitaire'] != self.instance.prix_unitaire:
                user = getattr(request, 'user', None)
                if not (user and user.is_authenticated and (user.is_superuser or user.is_responsable)):
                    raise serializers.ValidationError({
                        'prix_unitaire': "Seul le Responsable peut modifier le prix d'une vente déjà enregistrée.",
                    })
        return attrs
