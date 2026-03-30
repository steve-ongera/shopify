from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from django.conf import settings
import requests
import base64
from datetime import datetime

from .models import (
    User, Category, Product, ProductReview,
    PickupStation, Order, OrderItem, Cart, CartItem
)
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    CategorySerializer, ProductListSerializer, ProductDetailSerializer,
    ProductReviewSerializer, PickupStationSerializer,
    OrderSerializer, CartSerializer, CartItemSerializer
)


class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Account created successfully.',
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': f'Welcome back, {user.first_name}!',
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'})
        except Exception:
            return Response({'message': 'Logged out.'})

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)

    @action(detail=False, methods=['put', 'patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated.', 'user': serializer.data})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        parent = self.request.query_params.get('parent')
        if parent == 'null':
            qs = qs.filter(parent__isnull=True)
        return qs


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'reviews')
    lookup_field = 'slug'
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name', 'sku']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category_slug = self.request.query_params.get('category')
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        product = self.get_object()
        related = Product.objects.filter(
            category=product.category, is_active=True
        ).exclude(id=product.id)[:8]
        serializer = ProductListSerializer(related, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def review(self, request, slug=None):
        product = self.get_object()
        if ProductReview.objects.filter(product=product, user=request.user).exists():
            return Response({'error': 'You have already reviewed this product.'}, status=400)
        serializer = ProductReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(product=product, user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        qs = self.get_queryset().filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(category__name__icontains=query)
        )[:20]
        serializer = ProductListSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)


class PickupStationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PickupStation.objects.filter(is_active=True)
    serializer_class = PickupStationSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        county = self.request.query_params.get('county')
        if county:
            qs = qs.filter(county__icontains=county)
        return qs


class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def list(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add(self, request):
        cart = self.get_cart(request.user)
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            quantity = serializer.validated_data.get('quantity', 1)
            product = Product.objects.get(id=product_id)
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart, product=product,
                defaults={'quantity': quantity}
            )
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            cart_serializer = CartSerializer(cart, context={'request': request})
            return Response({
                'message': f'{product.name} added to cart.',
                'cart': cart_serializer.data
            }, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['put'])
    def update_item(self, request):
        cart = self.get_cart(request.user)
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity', 1)
        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            if int(quantity) <= 0:
                item.delete()
                return Response({'message': 'Item removed from cart.'})
            item.quantity = int(quantity)
            item.save()
            return Response({'message': 'Cart updated.'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=404)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        cart = self.get_cart(request.user)
        item_id = request.query_params.get('item_id')
        try:
            CartItem.objects.get(id=item_id, cart=cart).delete()
            return Response({'message': 'Item removed from cart.'})
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=404)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        cart = self.get_cart(request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items').select_related('pickup_station')

    def create(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response({'error': 'Your cart is empty.'}, status=400)

        pickup_station_id = request.data.get('pickup_station_id')
        payment_method = request.data.get('payment_method', 'mpesa')
        mpesa_phone = request.data.get('mpesa_phone', '')
        notes = request.data.get('notes', '')

        try:
            pickup_station = PickupStation.objects.get(id=pickup_station_id, is_active=True)
        except PickupStation.DoesNotExist:
            return Response({'error': 'Invalid pickup station.'}, status=400)

        subtotal = sum(item.total_price for item in cart.items.all())
        delivery_fee = pickup_station.delivery_fee
        total = subtotal + delivery_fee

        order = Order.objects.create(
            user=request.user,
            pickup_station=pickup_station,
            payment_method=payment_method,
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            total=total,
            mpesa_phone=mpesa_phone,
            notes=notes,
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                product_name=item.product.name,
                product_slug=item.product.slug,
                quantity=item.quantity,
                unit_price=item.product.price,
                product_image=str(item.product.image) if item.product.image else '',
            )
            # Reduce stock
            item.product.stock -= item.quantity
            item.product.save()

        # Handle payment
        if settings.MPESA_BYPASS or payment_method != 'mpesa':
            order.payment_status = 'paid'
            order.status = 'confirmed'
            order.save()
            cart.items.all().delete()
            return Response({
                'message': f'Order {order.order_number} placed successfully!',
                'order': OrderSerializer(order, context={'request': request}).data
            }, status=201)
        else:
            # Initiate M-Pesa STK Push
            mpesa_result = self.initiate_mpesa_stk(order, mpesa_phone)
            cart.items.all().delete()
            return Response({
                'message': 'Order placed. Complete M-Pesa payment.',
                'order': OrderSerializer(order, context={'request': request}).data,
                'mpesa': mpesa_result
            }, status=201)

    def initiate_mpesa_stk(self, order, phone):
        try:
            consumer_key = settings.MPESA_CONSUMER_KEY
            consumer_secret = settings.MPESA_CONSUMER_SECRET
            auth_string = base64.b64encode(f"{consumer_key}:{consumer_secret}".encode()).decode()

            token_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
            if settings.MPESA_ENVIRONMENT == 'production':
                token_url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

            token_response = requests.get(token_url, headers={"Authorization": f"Basic {auth_string}"})
            access_token = token_response.json().get('access_token')

            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = base64.b64encode(
                f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}".encode()
            ).decode()

            stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            if settings.MPESA_ENVIRONMENT == 'production':
                stk_url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

            payload = {
                "BusinessShortCode": settings.MPESA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(order.total),
                "PartyA": phone,
                "PartyB": settings.MPESA_SHORTCODE,
                "PhoneNumber": phone,
                "CallBackURL": settings.MPESA_CALLBACK_URL,
                "AccountReference": order.order_number,
                "TransactionDesc": f"Payment for order {order.order_number}"
            }

            response = requests.post(
                stk_url, json=payload,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in ['pending', 'confirmed']:
            return Response({'error': 'Order cannot be cancelled at this stage.'}, status=400)
        order.status = 'cancelled'
        order.save()
        return Response({'message': f'Order {order.order_number} cancelled.'})

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def mpesa_callback(self, request):
        data = request.data
        try:
            result_code = data['Body']['stkCallback']['ResultCode']
            checkout_request_id = data['Body']['stkCallback']['CheckoutRequestID']
            if result_code == 0:
                metadata = data['Body']['stkCallback']['CallbackMetadata']['Item']
                mpesa_code = next((i['Value'] for i in metadata if i['Name'] == 'MpesaReceiptNumber'), '')
                # Update order
                Order.objects.filter(order_number__icontains=checkout_request_id).update(
                    payment_status='paid', status='confirmed', mpesa_transaction_id=mpesa_code
                )
            return Response({'ResultCode': 0, 'ResultDesc': 'Success'})
        except Exception as e:
            return Response({'ResultCode': 1, 'ResultDesc': str(e)})