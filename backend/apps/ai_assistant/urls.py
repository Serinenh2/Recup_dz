from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIConversationViewSet, AIMessageViewSet,
    AIAlertViewSet, KnowledgeBaseViewSet,
    AIRecommendationViewSet, AIDashboardViewSet
)

router = DefaultRouter()
router.register(r'conversations', AIConversationViewSet, basename='ai-conversation')
router.register(r'messages', AIMessageViewSet, basename='ai-message')
router.register(r'alertes', AIAlertViewSet, basename='ai-alert')
router.register(r'connaissances', KnowledgeBaseViewSet, basename='ai-knowledge')
router.register(r'recommandations', AIRecommendationViewSet, basename='ai-recommendation')
router.register(r'dashboard', AIDashboardViewSet, basename='ai-dashboard')

urlpatterns = router.urls
