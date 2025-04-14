from rest_framework import serializers
from .models import User, Case, CaseInstance, Clue  


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self,validated_data):
        user = User.objects.create_user(
            username= validated_data['username'],
            email= validated_data['email'],
            password= validated_data['password']
        )
        return user
        

class CaseInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseInstance
        fields = '__all__'
        read_only_fields = ['user', 'started_at', 'status']

class ClueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Clue
        fields = ['id', 'text', 'order']

class CaseSerializer(serializers.ModelSerializer):
    clues = ClueSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = '__all__'
