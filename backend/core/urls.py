from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuthViewSet, CategoryViewSet, ProductViewSet,
    PickupStationViewSet, CartViewSet, OrderViewSet
)

router = DefaultRouter()
router.register('auth', AuthViewSet, basename='auth')
router.register('categories', CategoryViewSet, basename='category')
router.register('products', ProductViewSet, basename='product')
router.register('pickup-stations', PickupStationViewSet, basename='pickup-station')
router.register('cart', CartViewSet, basename='cart')
router.register('orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]