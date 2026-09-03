from django.contrib import admin
from .models import Client, Speculation, Livraison, Versement


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('nom', 'telephone', 'adresse')
    search_fields = ('nom',)


@admin.register(Speculation)
class SpeculationAdmin(admin.ModelAdmin):
    list_display = ('nom',)
    search_fields = ('nom',)


@admin.register(Livraison)
class LivraisonAdmin(admin.ModelAdmin):
    list_display = ('client', 'speculation', 'quantite', 'prix_unitaire', 'remise', 'date')
    list_filter = ('speculation', 'date')
    search_fields = ('client__nom',)


@admin.register(Versement)
class VersementAdmin(admin.ModelAdmin):
    list_display = ('livraison', 'montant', 'date')
    list_filter = ('date',)
    search_fields = ('livraison__client__nom',)
