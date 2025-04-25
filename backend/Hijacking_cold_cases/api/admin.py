from django.contrib import admin

# Register your models here.
from .models import Case, CaseInstance, Person, Clue,Evidence
from django.contrib.auth import get_user_model

User= get_user_model()

admin.site.register(Case)
admin.site.register(CaseInstance)
admin.site.register(User)
admin.site.register(Person)
admin.site.register(Clue)
admin.site.register(Evidence)