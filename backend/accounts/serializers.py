from rest_framework import serializers
from .models import User, Role


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password'],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_responsable', 'is_superuser', 'roles')


class ChangeRoleSerializer(serializers.Serializer):
    is_responsable = serializers.BooleanField(required=False)
    roles = serializers.ListField(
        child=serializers.ChoiceField(choices=Role.ROLE_CHOICES),
        required=False,
    )

    def update(self, instance, validated_data):
        if 'is_responsable' in validated_data:
            instance.is_responsable = validated_data['is_responsable']
            instance.save()

        if 'roles' in validated_data:
            role_names = validated_data['roles']
            role_objs = [Role.objects.get_or_create(name=name)[0] for name in role_names]
            instance.roles.set(role_objs)

        return instance