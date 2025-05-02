from rest_framework import serializers
from .models import User, Case, CaseInstance, Clue , Person, Evidence


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
class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ['first_name', 'last_name', 'picture', 'thumbnail_picture']
        

class CaseInstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseInstance
        fields = '__all__'
        read_only_fields = ['user', 'started_at', 'status']

class ClueSerializer(serializers.ModelSerializer):
   
   class Meta:
        model = Clue
        fields = ['id', 'text', 'order', 'character']

class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = "__all__"

class PublicCaseSerializer(serializers.ModelSerializer):
    clues = ClueSerializer(many=True, read_only=True)
    evidence = EvidenceSerializer(many=True, read_only=True)
    alibis = serializers.SerializerMethodField()
    victim = PersonSerializer(read_only=True)
    characters = serializers.SerializerMethodField() 

    class Meta:
        model = Case
        fields = [
            'id', 'title', 'summary', 'difficulty', 'status','victim',
            'victim_name', 'victim_occupation', 'cause_of_death',
            'last_known_location', 'background_story', 'crime_scene_description',
            'clues','alibis', 'evidence','characters'
        ]
    def get_alibis(self, obj):
        return obj.alibis if obj.alibis else {}
    def get_characters(self, obj):
        # Build suspect list from alibis
        if not obj.alibis:
            return []
        return [
            {
                "name": name,
                "alibi": alibi,
                "clueText": None,  # can hook this up later if needed
                "photoUrl": None   # can match to person photo later
            }
            for name, alibi in obj.alibis.items()
        ]

class SolvedCaseSerializer(PublicCaseSerializer):
    class Meta(PublicCaseSerializer.Meta):
        fields = PublicCaseSerializer.Meta.fields + ['killer', 'justification']
