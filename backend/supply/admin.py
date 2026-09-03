from django.contrib import admin
from .models import ProduitApprovisionnement, Approvisionnement, Revente


@admin.register(ProduitApprovisionnement)
class ProduitApprovisionnementAdmin(admin.ModelAdmin):
    list_display = ('nom',)
    search_fields = ('nom',)


@admin.register(Approvisionnement)
class ApprovisionnementAdmin(admin.ModelAdmin):
    list_display = ('produit', 'quantite', 'prix_achat', 'date')
    list_filter = ('produit', 'date')
    search_fields = ('produit__nom',)


@admin.register(Revente)
class ReventeAdmin(admin.ModelAdmin):
    list_display = ('approvisionnement', 'client', 'quantite', 'avaries', 'prix_vente', 'date')
    list_filter = ('date',)
    search_fields = ('client__nom', 'approvisionnement__produit__nom')
