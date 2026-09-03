from rest_framework.routers import DefaultRouter
from .views import ProduitApprovisionnementViewSet, ApprovisionnementViewSet, ReventeViewSet

router = DefaultRouter()
router.register(r'produits-approvisionnement', ProduitApprovisionnementViewSet, basename='produit-approvisionnement')
router.register(r'approvisionnements', ApprovisionnementViewSet, basename='approvisionnement')
router.register(r'reventes', ReventeViewSet, basename='revente')

urlpatterns = router.urls
