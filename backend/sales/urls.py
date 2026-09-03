from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, SpeculationViewSet, LivraisonViewSet, VersementViewSet

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'speculations', SpeculationViewSet, basename='speculation')
router.register(r'livraisons', LivraisonViewSet, basename='livraison')
router.register(r'versements', VersementViewSet, basename='versement')

urlpatterns = router.urls
