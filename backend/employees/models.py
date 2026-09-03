from django.db import models


class Employee(models.Model):
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    poste = models.CharField(max_length=100)
    telephone = models.CharField(max_length=30, blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    date_embauche = models.DateField()
    salaire = models.DecimalField(max_digits=10, decimal_places=2)
    statut = models.CharField(max_length=10, choices=STATUT_CHOICES, default='actif')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} — {self.poste}"


class Avance(models.Model):
    """Avance sur salaire accordée à un employé en cours de mois."""

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='avances')
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Avance {self.montant} — {self.employee} ({self.date})"


class Maladie(models.Model):
    """Épisode de maladie pris en charge par l'entreprise pour un employé."""

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='maladies')
    date_debut = models.DateField()
    nombre_jours = models.PositiveIntegerField()
    montant_depense = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_debut']

    def __str__(self):
        return f"Maladie {self.employee} — {self.nombre_jours} j ({self.date_debut})"


class Ration(models.Model):
    """
    Dépense de ration alimentaire pour le personnel : journal global indépendant
    du salaire et des avances, non rattaché à un employé en particulier.
    """

    date = models.DateField()
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Ration {self.montant} — {self.date}"