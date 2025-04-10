from rest_framework import serializers
from .models import User, Case  



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

        def create(self,validated_data):
            user = User.objects.create.user(
                username= validated_data['username'],
                email= validated_data['email'],
                password= validated_data['password']
            )
            return user
        
class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = '__all__'