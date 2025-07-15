from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def csrf_token_view(request):
    """Endpoint para obter CSRF token"""
    return JsonResponse({'csrfToken': 'Token enviado via cookie'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/csrf/', csrf_token_view, name='csrf_token'),
    path('api/usuarios/', include('usuarios.urls')),
    path('api/ia/', include('ia.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)