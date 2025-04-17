import requests, random
from openai import OpenAI
from django.conf import settings
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, CaseSerializer, CaseInstanceSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from .models import Case, CaseInstance, Person, Clue
from dotenv import load_dotenv
import os, re 



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
                    print("Raw GPT response :\n", content)
                    

                    parsed = self.parse_openai_response(content)

                    case = Case.objects.create(
                        title=parsed["title"] or "Untitled Case",
                        summary=parsed["summary"],
                        difficulty = difficulty,
                        status = "unsolved",
                        owner=request.user,
                        killer=parsed["killer"],
                        justification = parsed.get("justification", "")
                    )
                    for idx, clue_text in enumerate(parsed["clues"], start=1):
                        Clue.objects.create(case=case, order=idx, text=clue_text)

                    created_cases.append({
                        "title": case.title, 
                        "killer": case.killer,
                        "clues": parsed["clues"],
                        "summary": parsed["summary"],
                        "justification": parsed["justification"]
                        })
                
                
                
                except Exception as e:
                    import traceback
                    print(traceback.format_exc())
                    return Response({"error": str(e)}, status= 500)
        return Response({
                "message": f"{len(created_cases)} cases created.",
                "cases": created_cases
            }, status=201)
    
    def build_prompt(self,people):
        body = "\n".join([
            f"- {p.first_name} {p.last_name}, {p.gender}, from {p.location}, nationality {p.nationality}."
            for p in people
        ])
        return f"""

        Generate a detective-style murder mystery game where the user is the detective who snuck away from a mandatory training and found a cold case closet. 
        
        Include:

        Title: [unique One-line case title]
        Summary: [1-paragraph story overview]
        Clues:
        1. [First clue: describe if it's a real lead or red herring]
        2. [Second clue...]
        3. [Third clue...]

        Alibis:
        - [Person Name]: [Alibi description]
        - ...

        Motive:
        - [Person Name]: [Their potential motive]
        - ...

        Killer: [Name of the actual killer]
        Justification: [Brief explanation of why this person committed the crime]
        Characters:
        {body}
        """
    def parse_openai_response(self, text):
        lines = text.splitlines()
        result = {
            "title": "",
            "summary": "",
            "clues": [],
            "alibis": {},
            "motives": {},
            "killer": "",
            "justification": "",
            "characters": []
        }

        section = None
        for line in lines:
            line = line.strip()

            if line.lower().startswith("title:"):
                result["title"] = line.split(":", 1)[1].strip()
                section = None
            elif line.lower().startswith("summary:"):
                result["summary"] = line.split(":", 1)[1].strip()
                section = None
            elif line.lower().startswith("clues:"):
                section = "clues"
            elif line.lower().startswith("alibis:"):
                section = "alibis"
            elif line.lower().startswith("motive:") or line.lower().startswith("motives:"):
                section = "motives"
            elif line.lower().startswith("killer:"):
                result["killer"] = line.split(":", 1)[1].strip()
                section = None
            elif line.lower().startswith("characters:"):
                section = "characters"
            elif section == "clues" and line and line[0].isdigit():
                result["clues"].append(line.split(".", 1)[1].strip())
            elif section == "alibis" and ":" in line:
                name, alibi = line.split(":", 1)
                result["alibis"][name.strip()] = alibi.strip()
            elif section == "motives" and ":" in line:
                name, motive = line.split(":", 1)
                result["motives"][name.strip()] = motive.strip()
            elif section == "characters" and line.startswith("-"):
                result["characters"].append(line[1:].strip())
            elif line.lower().startswith("justification:"):
                result["justification"] = line.split(":", 1)[1].strip()

        return result




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

