"""
URL configuration for docrag project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from api.api import router as api_router # Import your API router

api = NinjaAPI(
    title="DocRAG API",
    description="API for Document Retrieval-Augmented Generation system",
    version="1.0.0"
)

# Add your API router to the NinjaAPI instance
api.add_router("/api", api_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', api.urls), # Mount the Ninja API
]