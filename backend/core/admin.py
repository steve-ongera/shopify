from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Category, Product, ProductImage, ProductReview,
    PickupStation, Order, OrderItem, Cart, CartItem
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'is_staff', 'date_joined']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {'fields': ('email', 'first_name', 'last_name', 'password1', 'password2')}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['is_active', 'parent']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active', 'is_featured']
    list_filter = ['is_active', 'is_featured', 'category']
    search_fields = ['name', 'sku']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]


@admin.register(PickupStation)
class PickupStationAdmin(admin.ModelAdmin):
    list_display = ['name', 'county', 'town', 'delivery_fee', 'is_active']
    list_filter = ['county', 'is_active']
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ['product_name', 'quantity', 'unit_price', 'total_price']
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'status', 'payment_status', 'total', 'created_at']
    list_filter = ['status', 'payment_status', 'payment_method']
    search_fields = ['order_number', 'user__email']
    inlines = [OrderItemInline]
    readonly_fields = ['order_number', 'subtotal', 'delivery_fee', 'total']