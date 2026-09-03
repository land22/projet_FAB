from rest_framework import serializers
from .models import Employee, Avance, Maladie, Ration


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = '__all__'


class AvanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.__str__', read_only=True)

    class Meta:
        model = Avance
        fields = ['id', 'employee', 'employee_name', 'montant', 'date', 'created_at']


class MaladieSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.__str__', read_only=True)

    class Meta:
        model = Maladie
        fields = [
            'id', 'employee', 'employee_name',
            'date_debut', 'nombre_jours', 'montant_depense', 'created_at',
        ]


class RationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ration
        fields = ['id', 'date', 'montant', 'description', 'created_at']