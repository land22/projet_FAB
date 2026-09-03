from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsResponsableOrChefDuPersonnel
from .models import Employee, Avance, Maladie
from .serializers import EmployeeSerializer, AvanceSerializer, MaladieSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """CRUD complet sur les employés, réservé au Responsable et au Chef du personnel."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsResponsableOrChefDuPersonnel]

    @action(detail=True, methods=['get'])
    def solde(self, request, pk=None):
        """Solde du mois = salaire mensuel − somme des avances du mois."""
        employee = self.get_object()
        today = timezone.now().date()
        try:
            month = int(request.query_params.get('month', today.month))
            year = int(request.query_params.get('year', today.year))
        except ValueError:
            return Response({'detail': "month et year doivent être des entiers."}, status=400)

        total_avances = Avance.objects.filter(
            employee=employee, date__year=year, date__month=month
        ).aggregate(total=Sum('montant'))['total'] or 0

        return Response({
            'employee': employee.id,
            'mois': month,
            'annee': year,
            'salaire_mensuel': employee.salaire,
            'total_avances': total_avances,
            'solde': employee.salaire - total_avances,
        })


class AvanceViewSet(viewsets.ModelViewSet):
    """CRUD sur les avances sur salaire, réservé au Responsable et au Chef du personnel."""
    serializer_class = AvanceSerializer
    permission_classes = [IsResponsableOrChefDuPersonnel]

    def get_queryset(self):
        queryset = Avance.objects.all()
        employee_id = self.request.query_params.get('employee')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if month:
            queryset = queryset.filter(date__month=month)
        if year:
            queryset = queryset.filter(date__year=year)
        return queryset


class MaladieViewSet(viewsets.ModelViewSet):
    """CRUD sur les épisodes de maladie, réservé au Responsable et au Chef du personnel."""
    serializer_class = MaladieSerializer
    permission_classes = [IsResponsableOrChefDuPersonnel]

    def get_queryset(self):
        queryset = Maladie.objects.all()
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        return queryset
