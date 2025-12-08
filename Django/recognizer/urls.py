from django.urls import path
from . import views

urlpatterns = [
    path('analyze/', views.analyze_audio, name='analyze-audio'),
    path('answers/', views.receive_answer, name='receive-answer'),  # 👈 nouveau endpoint
    path('check-answer/', views.check_user_answer, name='check-user-answer'),  # 👈 nouveau

]
