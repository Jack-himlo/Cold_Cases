import requests
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, CaseSerializer, CaseInstanceSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Case, CaseInstance, Person

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
    
class GeneratePersonView(APIView):
    def post(self, request): 
        count=3
        url = f"http://randomuser.me/api/?results={count}"
        response = requests.get(url)

        if response.status_code==200:
            data = response.json()
            for person_data in data['results']:
                gender=person_data['gender']
                name=f"{person_data['name']['first']} {person_data['name']['last']}"
                location=f"{person_data['location']['city']},{person_data['location']['state']},{person_data['location']['country']}"
                email=person_data['email']
                cell =person_data['cell']
                picture = person_data['picture']['medium']
                thumbnail_picture= person_data['picture']['thumbnail']
                nationality = person_data['nat']

                Person.objects.create(
                    gender=gender,
                    name=name,
                    location=location,
                    email=email,
                    cell=cell,
                    picture=picture,
                    thumbnail_picture=thumbnail_picture,
                    nationality=nationality
                )

            return Response({"message": f"{count} people generated and saved."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": "Failed to fetch data from RandomUser API"}, status=status.HTTP_502_BAD_GATEWAY)

# Create your views here.

