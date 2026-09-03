from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, AvanceViewSet, MaladieViewSet, RationViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'avances', AvanceViewSet, basename='avance')
router.register(r'maladies', MaladieViewSet, basename='maladie')
router.register(r'rations', RationViewSet, basename='ration')

urlpatterns = router.urls