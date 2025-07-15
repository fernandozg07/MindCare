from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'usuarios'

# Router para ViewSets
router = DefaultRouter()
router.register(r'pacientes', views.PacienteViewSet, basename='pacientes')
router.register(r'sessoes', views.SessaoViewSet, basename='sessoes')
router.register(r'mensagens', views.MensagemViewSet, basename='mensagens')

urlpatterns = [
    # Autenticação
    path('login/', views.login_api, name='login_api'),
    path('logout/', views.logout_api, name='logout_api'),
    path('cadastro/paciente/', views.cadastro_paciente_api, name='cadastro_paciente'),
    path('cadastro/terapeuta/', views.cadastro_terapeuta_api, name='cadastro_terapeuta'),
    
    # Perfil
    path('perfil/', views.PerfilAPIView.as_view(), name='perfil'),
    path('perfil/senha/', views.alterar_senha_api, name='alterar_senha'),
    
    # Busca
    path('buscar-pacientes/', views.buscar_pacientes_api, name='buscar_pacientes'),
    
    # ViewSets via router
    path('', include(router.urls)),
]