from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, ProfileView, CaseView, StartCaseView, CaseDetailView,
    GenerateCaseBatchView, GeneratePersonView, ActiveCaseView, PersonListView, GuessKillerView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('cases/', CaseView.as_view(), name='cases'),
    path('cases/<int:pk>/', CaseDetailView.as_view(), name='case_detail'),
    path('cases/<int:pk>/start/', StartCaseView.as_view(), name='start_case'),
    path('cases/<int:pk>/guess/', GuessKillerView.as_view(), name='guess_killer'),

    path('generate-case-batch/', GenerateCaseBatchView.as_view(), name='generate_case_batch'),
    path('generate-people/', GeneratePersonView.as_view(), name='generate_people'),
    path("people/", PersonListView.as_view()), 
    path('active-case/', ActiveCaseView.as_view(), name='active_case'),

    # JWT Token auth endpoints
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
