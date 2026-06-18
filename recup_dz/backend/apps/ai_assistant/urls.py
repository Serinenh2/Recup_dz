from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIAlertViewSet,
    AIConversationViewSet,
    AIDashboardViewSet,
    AIMessageViewSet,
    AIRecommendationViewSet,
    KnowledgeBaseViewSet,
)

router = DefaultRouter()
router.register('conversations', AIConversationViewSet, basename='ai-conversation')
router.register('messages', AIMessageViewSet, basename='ai-message')
router.register('alerts', AIAlertViewSet, basename='ai-alert')
router.register('knowledge', KnowledgeBaseViewSet, basename='ai-knowledge')
router.register('recommendations', AIRecommendationViewSet, basename='ai-recommendation')
router.register('dashboard', AIDashboardViewSet, basename='ai-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
