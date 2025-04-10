from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model


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
    owner = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, null = True)


    def __str__(self):
        return self.title


# Create your models here.
