from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import JSONField

class User(AbstractUser):
    pass 

class Case(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy','Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    STATUS_CHOICES =[
        ('open', 'Open'),
        ('solved', 'Solved'),
        ('cold', 'Cold'),

    ]
    title= models.CharField(max_length=255)
    summary=models.TextField()
    status= models.CharField(max_length=20, choices= STATUS_CHOICES, default='cold')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='easy')
    created_at= models.DateTimeField(auto_now_add=True)
    killer = models.CharField(max_length=255, blank=True)
    justification= models.TextField(blank=True)
    alibis = models.JSONField(default= dict, blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    crime_scene_description = models.TextField(blank=True, null=True)
    
    victim = models.ForeignKey(
    'Person',
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name='victim_cases'
    )

    victim_name = models.CharField(max_length=255, blank=True, null=True)
    victim_occupation = models.CharField(max_length=255, blank=True, null=True)
    cause_of_death = models.CharField(max_length=255, blank=True, null=True)
    last_known_location = models.CharField(max_length=255, blank=True, null=True)
    background_story = models.TextField(blank=True, null=True)   
    

    def __str__(self):
        return self.title
    
class CaseInstance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    case = models.ForeignKey('Case', on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    lives_remaining = models.IntegerField(default=3)
    status = models.CharField(max_length=20, default='active')  # active, failed, solved
    guesses_made = models.IntegerField(default=0) 

    class Meta:
        unique_together = ('user', 'case')
    def __str__(self):
        return f"{self.user.username} - {self.case.title} ({self.status})"
    
class Clue(models.Model):
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='clues')
    text = models.TextField()
    order = models.PositiveIntegerField(default=0)
    character = models.CharField(max_length=255, blank = True, null=True)
    is_red_herring = models.BooleanField(default=False) 

    def __str__(self):
        return f"Clue {self.order} for {self.case.title}"

# models.py

class Evidence(models.Model):
    case = models.ForeignKey(
        Case,
        related_name='evidence',
        on_delete=models.CASCADE
    )
    title = models.CharField(max_length=255)  # e.g. "Bloody Knife"
    description = models.TextField()  # detailed explanation of the evidence
    image_url = models.URLField(blank=True, null=True)  # optional photo
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Person(models.Model):
    gender =models.CharField(max_length=15)
    first_name = models.CharField(max_length=255 )
    last_name = models.CharField(max_length=255)
    # full_name= first_name +  ' ' + last_name // make into property later
    location = models.CharField(max_length=255)
    email = models.EmailField()
    cell = models.CharField(max_length=30)
    picture = models.URLField()
    thumbnail_picture = models.URLField()
    nationality = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.location}"

# Create your models here.
