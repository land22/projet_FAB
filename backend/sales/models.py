from django.db import models


class Client(models.Model):
    """Bayam-sellam : vendeuse partenaire à qui l'entreprise dépose de la marchandise."""

    nom = models.CharField(max_length=150)
    telephone = models.CharField(max_length=30, blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Speculation(models.Model):
    """Type de produit maraîcher vendu (tomate, piment, pastèque, poivron, ...)."""

    nom = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom


class Livraison(models.Model):
    """
    Dépôt quotidien de marchandise chez une bayam-sellam.
    Le prix unitaire est figé une fois la livraison enregistrée : seul le
    Responsable est autorisé à le corriger (contrôle appliqué au niveau vue/serializer).
    """

    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='livraisons')
    speculation = models.ForeignKey(Speculation, on_delete=models.PROTECT, related_name='livraisons')
    quantite = models.DecimalField(max_digits=10, decimal_places=2)
    prix_unitaire = models.DecimalField(max_digits=10, decimal_places=2)
    remise = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.speculation} — {self.client} ({self.date})"

    @property
    def montant_total(self):
        return (self.quantite * self.prix_unitaire) - self.remise

    @property
    def total_verse(self):
        return self.versements.aggregate(total=models.Sum('montant'))['total'] or 0

    @property
    def credit(self):
        return self.montant_total - self.total_verse


class Versement(models.Model):
    """Recouvrement effectué par une bayam-sellam, rattaché à une livraison précise."""

    livraison = models.ForeignKey(Livraison, on_delete=models.CASCADE, related_name='versements')
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Versement {self.montant} — {self.livraison} ({self.date})"
