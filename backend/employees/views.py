from rest_framework import viewsets
from accounts.permissions import IsResponsableOrChefDuPersonnel
from .models import Employee
from .serializers import EmployeeSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    """CRUD complet sur les employés, réservé au Responsable et au Chef du personnel."""
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsResponsableOrChefDuPersonnel]