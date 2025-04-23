import requests, random
from openai import OpenAI
from django.conf import settings
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, CaseInstanceSerializer, PublicCaseSerializer, SolvedCaseSerializer
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from .models import Case, CaseInstance, Person, Clue
from dotenv import load_dotenv
import os, re, json



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
            for _ in range(5):#  range(x) = cases per difficulty
                num_needed = CHARACTERS_PER_VIEW[difficulty]

                if len(people_pool) < num_needed:
                    return Response({"error": "Not enough people to generate a{difficulty} case."}, status=400)
                
                selected_people = random.sample(people_pool, num_needed)

                prompt = self.build_prompt(selected_people)

                try:
                    res = client.chat.completions.create(
                        model="gpt-4",
                        messages=[{"role":"user", "content": prompt}]
                    )
                    content = res.choices[0].message.content
                    print("Raw GPT response :\n", content)
                    

                    parsed = json.loads(content)

                    case = Case.objects.create(
                        title=parsed["title"] or "Untitled Case",
                        summary=parsed["summary"],
                        difficulty = difficulty,
                        status = "unsolved",
                        owner=request.user,
                        killer=parsed["killer"],
                        alibis=parsed.get("alibis", {}),
                        justification = parsed.get("justification", ""),
                        crime_scene_description=parsed.get("crime_scene_description", ""),
                        victim_name=parsed["victim"]["name"],
                        victim_occupation=parsed["victim"]["occupation"],
                        cause_of_death=parsed["victim"]["cause_of_death"],
                        last_known_location=parsed["victim"]["last_known_location"],
                        background_story=parsed["victim"]["background_story"],

                    )
                    for idx, clue_data in enumerate(parsed["clues"], start=1):
                        Clue.objects.create(
                            case=case,
                            order=idx,
                            text=clue_data["text"],
                            character=clue_data["character"],
                            is_red_herring=clue_data.get("is_red_herring", False)
                        )


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

        Generate a detective-style murder mystery game where the user is the detective. 
        The goal is to provide an engaging story that all ties into one another with:
        - A compelling victim
        - A believable crime scene
        - Multiple suspects (with varied alibis)
        - Clues (some true, some misleading)
        - A designated killer
        
        
        Include:

        Title: [unique One-line case title]
        Summary: [1-paragraph story overview]
        Clues: assign each clue to a character
        Provide multiple clues. Each clue should be a piece of physical evidence, a witness statement, a video, or a suspicious object.

        Each clue must be assigned to a specific suspect listed below and marked as either a real lead or a red herring.
        Do NOT label clues in the text as “Red Herring” or “Real Lead.” Instead, use `is_red_herring` as a field.

        Format:
        - [Character Name]: [Clue description] - [Real Lead or Red Herring]

        Example:
         - Melvin Warren: A bloodied glove found behind the bakery - Real Lead
         - Caroline Long: A torn love letter in her handwriting - Red Herring

        Alibis:
        -Provide one alibi for each character listed below. Each alibi should include where the person claims to be at the time of the murder, what they were doing, and whether there were any witnesses.
        - [Person Name]: [Alibi description]
        - ...

        Motive:
        - [Person Name]: [Their potential motive]
        - ...

        Killer: [Name of the actual killer]
        Justification: [Brief explanation of why this person committed the crime]
        Characters:
        {body}

        Return the case as a JSON object with the following fields:

        {{
          "title": "...",
          "summary": "...",
         "victim": {{
           "name": "...",
           "occupation": "...",
            "cause_of_death": "...",
            "last_known_location": "...",
            "background_story": "..."
          }},
          "crime_scene_description": "...",
          "characters": [
            {{
              "name": "...",
             "occupation": "...",
             "alibi": "..."
           }}
          ],
          "clues": [
            {{
              "text": "...",
              "character": "...",
              "is_red_herring": false
            }}
         ],
          "killer": "...",
          "justification": "..."
        }}
        """
    # def parse_openai_response(self, text):
    #     lines = text.splitlines()
    #     result = {
    #         "title": "",
    #         "summary": "",
    #         "clues": {},
    #         "alibis": {},
    #         "motives": {},
    #         "killer": "",
    #         "justification": "",
    #         "characters": {}
    #     }

    #     section = None
    #     for line in lines:
    #         line = line.strip()

    #         if line.lower().startswith("title:"):
    #             result["title"] = line.split(":", 1)[1].strip()
    #             section = None
    #         elif line.lower().startswith("summary:"):
    #             result["summary"] = line.split(":", 1)[1].strip()
    #             section = None
    #         elif line.lower().startswith("clues:"):
    #             section = "clues"
    #         elif line.lower().startswith("alibis:"):
    #             section = "alibis"
    #         elif line.lower().startswith("motive:") or line.lower().startswith("motives:"):
    #             section = "motives"
    #         elif line.lower().startswith("killer:"):
    #             result["killer"] = line.split(":", 1)[1].strip()
    #             section = None
    #         elif line.lower().startswith("characters:"):
    #             section = "characters"


    #         elif section == "clues" and line.startswith("-") and ":" in line:
    #             try:
    #                 # Split on the first colon, and then dash
    #                 name, remainder = line.split(":", 1)
    #                 clue_text, clue_type = remainder.rsplit("-", 1) if "-" in remainder else (remainder, "Unknown")
    #                 result["clues"][name.strip()] = {
    #                 "text": clue_text.strip(),
    #                 "type": clue_type.strip()
    #                 }
    #             except:
    #                 pass
    #         elif section == "alibis" and ":" in line:
    #             name, alibi = line.split(":", 1)
    #             result["alibis"][name.strip().lstrip("- ").strip()] = alibi.strip()
    #         elif section == "motives" and ":" in line:
    #             name, motive = line.split(":", 1)
    #             result["motives"][name.strip()] = motive.strip()
    #         elif section == "characters" and line.startswith("-"):
    #             result["characters"].append(line[1:].strip())
    #         elif line.lower().startswith("justification:"):
    #             result["justification"] = line.split(":", 1)[1].strip()

    #     return result




class CaseView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

class CaseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        case = Case.objects.get(pk=pk)
        instance = CaseInstance.objects.filter(user=request.user, case=case).first()

        if instance and instance.status == "solved":
            serializer = SolvedCaseSerializer(case)
        else:
            serializer = PublicCaseSerializer(case)

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

