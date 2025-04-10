from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, CaseSerializer, CaseInstanceSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Case, CaseInstance
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
        cases = Case.objects.all().order_by('-created_at')
        serializer = CaseSerializer(cases, many=True)
        return Response(serializer.data)
    
    def post(self,request):
        serializer = CaseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class StartCaseView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, pk):
        user = request.user
        try:
            case = Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            return Response({'error': 'Case not found.'}, status=404)
        
        instance, created = CaseInstance.objects.get_or_create(user=user, case=case)

        if not created:
            return Response({'message': 'Case already started.', 'status': instance.status})
        
        serializer= CaseInstanceSerializer(instance)
        return Response(serializer.data, status=201)

class CaseDetailView(APIView):
    def get(self,request, pk):
        case= Case.objects.get(pk-pk)
        return Response(CaseSerializer(case).data)
# Create your views here.
