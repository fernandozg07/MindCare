from django.urls import path
from . import views

app_name = 'ia'

urlpatterns = [
    path('responder/', views.responder_api, name='responder'),
    path('historico/', views.historico_api, name='historico'),
    path('painel_paciente/', views.painel_paciente_api, name='painel_paciente'),
    path('painel_terapeuta/', views.painel_terapeuta_api, name='painel_terapeuta'),
]