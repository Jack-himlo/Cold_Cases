import requests, random
from openai import OpenAI
from django.conf import settings
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, CaseSerializer, CaseInstanceSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from .models import Case, CaseInstance, Person
from dotenv import load_dotenv
import os



load_dotenv()
RANDOM_USER_API_KEY= os.getenv("RANDOM_USER_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)
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

CHARACTERS_PER_VIEW = {
    "easy": 3,
    "medium" : 4,
    "hard" : 5
}

class GenerateCaseBatchView(APIView):
    permission_classes = [IsAdminUser]

    def post(self,request):
        people_pool = list(Person.objects.all())

        if len(people_pool) < max(CHARACTERS_PER_VIEW.values()) * 3:
            return Response ({"error": "not enough people in the database to generate all cases."}, status =400)
        
        created_cases = []

        for difficulty in ["easy","medium","hard"]:
            for _ in range(1):# 3 cases per difficulty
                num_needed = CHARACTERS_PER_VIEW[difficulty]

                if len(people_pool) < num_needed:
                    return Response({"error": "Not enough people to generate a{difficulty} case."}, status=400)
                
                selected_people = random.sample(people_pool, num_needed)

                prompt = self.build_prompt(selected_people)

                try:
                    res = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[{"role":"user", "content": prompt}]
                    )
                    content = res.choices[0].message.content
                    title, summary = self.parse_openai_response(content)

                    case = Case.objects.create(
                        title=title,
                        summary=summary,
                        difficulty = difficulty,
                        status = "unsolved",
                        owner=request.user
                    )

                    created_cases.append(case.title)
                except Exception as e:
                    return Response({"error": str(e)}, status= 500)
        return Response({
                "message": f"{len(created_cases)} cases created.",
                "title": created_cases
            }, status=201)
    
    def build_prompt(self,people):
        body = "\n".join([
            f"- {p.first_name} {p.last_name}, {p.gender}, from {p.location}, nationality {p.nationality}."
            for p in people
        ])
        return f""" Generate a detective style murder mystery involving the poeple below.
        Respond with:
        Title: [Case Title]
        summary: [1 paragraph pf what happened]
        People:
        {body}
        """
    def parse_openai_response(self, text):
        lines = text.splitlines()
        title = next(line for line in lines if line.lower().startswith("title:")).split(":",1)[1].strip()
        summary= next(line for line in lines if line.lower().startswith("summary")).split(":", 1)[1].strip()
        return title,summary




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
        case= Case.objects.get(pk=pk)
        return Response(CaseSerializer(case).data)
    
class GeneratePersonView(APIView):
    def post(self, request): 
        count=60
        url = f"http://randomuser.me/api/?results={count}"
        response = requests.get(url)

        if response.status_code==200:
            data = response.json()
            for person_data in data['results']:
                gender=person_data['gender']
                first_name= person_data['name']['first']
                last_name= person_data['name']['last']
                location=f"{person_data['location']['city']},{person_data['location']['state']},{person_data['location']['country']}"
                email=person_data['email']
                cell =person_data['cell']
                picture = person_data['picture']['medium']
                thumbnail_picture= person_data['picture']['thumbnail']
                nationality = person_data['nat']

                Person.objects.create(
                    gender=gender,
                    first_name=first_name,
                    last_name=last_name,
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

