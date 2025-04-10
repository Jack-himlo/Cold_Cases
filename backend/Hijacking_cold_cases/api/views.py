from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, CaseSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly

class RegisterView(APIView):
    def post(self,request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status= 201)
        return Response(serializer.errors, status=400)
    
class ProfileView(APIView):
    def get(self,request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
        })
    
class CaseView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self,request):
        case = Case.objects.all().order_by('-created_at')
        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data)
    
    def post(self,request):
        serializer = CaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# Create your views here.
