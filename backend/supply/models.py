from django.db import models
from sales.models import Client


class ProduitApprovisionnement(models.Model):
    """
    Produit non cultivé par l'exploitation, acheté ailleurs puis revendu
    (ex : pomme de terre, carotte). Distinct des Spéculations de la Rubrique B.
    """

    nom = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Approvisionnement(models.Model):
    """
    Achat d'un lot d'un produit non cultivé par l'exploitation. Un même lot est
    ensuite réparti et revendu à une ou plusieurs bayam-sellam (voir Revente).
    """

    produit = models.ForeignKey(ProduitApprovisionnement, on_delete=models.PROTECT, related_name='approvisionnements')
    quantite = models.DecimalField(max_digits=10, decimal_places=2)
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.produit} — {self.quantite} ({self.date})"

    @property
    def montant_achat(self):
        return self.quantite * self.prix_achat

    @property
    def quantite_distribuee(self):
        return self.reventes.aggregate(total=models.Sum('quantite'))['total'] or 0

    @property
    def quantite_restante(self):
        return self.quantite - self.quantite_distribuee

    @property
    def montant_vente_total(self):
        return sum((r.montant_vente for r in self.reventes.all()), 0)

    @property
    def benefice_total(self):
        return sum((r.benefice for r in self.reventes.all()), 0)


class Revente(models.Model):
    """
    Dépôt/revente d'une partie d'un lot d'approvisionnement chez une bayam-sellam.
    Un même approvisionnement peut avoir plusieurs reventes (une par cliente).
    """

    approvisionnement = models.ForeignKey(Approvisionnement, on_delete=models.CASCADE, related_name='reventes')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='reventes')
    quantite = models.DecimalField(max_digits=10, decimal_places=2)
    avaries = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Revente {self.approvisionnement.produit} — {self.client} ({self.date})"

    @property
    def quantite_vendue(self):
        return self.quantite - self.avaries

    @property
    def montant_vente(self):
        return self.quantite_vendue * self.prix_vente

    @property
    def cout(self):
        return self.quantite * self.approvisionnement.prix_achat

    @property
    def benefice(self):
        return self.montant_vente - self.cout
