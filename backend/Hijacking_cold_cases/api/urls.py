from django.urls import path
from .views import RegisterView, ProfileView, CaseView, StartCaseView, CaseDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name = 'register'),
    path('profile/', ProfileView.as_view(), name= 'profile'),
    path('cases/', CaseView.as_view(), name= 'cases' ),
    path('cases/<int:pk>', CaseDetailView.as_view(), name= 'case_detail'),
    path('cases/<int:pk>/start/', StartCaseView.as_view(), name='start_case'),
    ]