# command/seed_data.py
import os
import random
import shutil
from datetime import datetime, timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.core.files import File
from django.utils.text import slugify
from django.conf import settings
from pathlib import Path
import uuid

# Adjust this import based on your app structure
from core.models import (
    Category, Product, ProductImage, PickupStation, User
)


class Command(BaseCommand):
    help = 'Seed database with realistic products using images from specified directory'

    def add_arguments(self, parser):
        parser.add_argument(
            '--num-products',
            type=int,
            default=50,
            help='Number of products to create (default: 50)'
        )
        parser.add_argument(
            '--images-dir',
            type=str,
            default=r'D:\gadaf\Documents\images\jumia',
            help='Directory containing product images'
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing products and categories before seeding'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting data seeding...'))
        
        num_products = options['num_products']
        images_dir = options['images_dir']
        clear_existing = options['clear_existing']
        
        if clear_existing:
            self.clear_existing_data()
        
        if not os.path.exists(images_dir):
            self.stdout.write(self.style.ERROR(f'❌ Images directory not found: {images_dir}'))
            return
        
        image_files = self.get_image_files(images_dir)
        if not image_files:
            self.stdout.write(self.style.ERROR(f'❌ No image files found in {images_dir}'))
            return
        
        self.stdout.write(f'📸 Found {len(image_files)} images')
        
        # Create categories with realistic names
        categories = self.create_categories()
        
        # Create products with real product names
        products = self.create_products(num_products, categories, image_files, images_dir)
        
        # Create pickup stations in Kenya
        self.create_pickup_stations()
        
        self.stdout.write(self.style.SUCCESS(f'✅ Successfully seeded {len(products)} products'))
    
    def get_image_files(self, images_dir):
        """Get all image files from directory"""
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
        image_files = []
        
        for file in os.listdir(images_dir):
            if any(file.lower().endswith(ext) for ext in valid_extensions):
                image_files.append(os.path.join(images_dir, file))
        
        return image_files
    
    def create_categories(self):
        """Create realistic e-commerce categories"""
        categories_data = [
            {
                'name': 'Smartphones & Tablets',
                'description': 'Latest smartphones, tablets, and accessories from top brands',
                'meta_title': 'Buy Smartphones & Tablets Online in Kenya',
                'subcategories': ['iPhones', 'Samsung Galaxy', 'Xiaomi', 'Tecno', 'Infinix', 'Tablets']
            },
            {
                'name': 'Electronics',
                'description': 'TVs, laptops, audio equipment, and home electronics',
                'meta_title': 'Shop Electronics - TVs, Laptops, Audio & More',
                'subcategories': ['Televisions', 'Laptops', 'Audio', 'Cameras', 'Gaming']
            },
            {
                'name': 'Fashion - Men',
                'description': 'Men\'s clothing, shoes, and accessories',
                'meta_title': 'Men\'s Fashion - Clothing, Shoes & Accessories',
                'subcategories': ['Shirts', 'T-Shirts', 'Jeans', 'Suits', 'Shoes', 'Watches']
            },
            {
                'name': 'Fashion - Women',
                'description': 'Women\'s clothing, shoes, handbags, and accessories',
                'meta_title': 'Women\'s Fashion - Dresses, Shoes, Handbags',
                'subcategories': ['Dresses', 'Tops', 'Skirts', 'Shoes', 'Handbags', 'Jewelry']
            },
            {
                'name': 'Phones & Accessories',
                'description': 'Phone cases, chargers, screen protectors, and more',
                'meta_title': 'Phone Accessories - Cases, Chargers, Screen Protectors',
                'subcategories': ['Phone Cases', 'Chargers', 'Power Banks', 'Screen Protectors', 'Headphones']
            },
            {
                'name': 'Computing',
                'description': 'Laptops, desktops, computer accessories, and software',
                'meta_title': 'Computers & Accessories - Laptops, Desktops, Peripherals',
                'subcategories': ['Laptops', 'Desktops', 'Monitors', 'Keyboards', 'Mice', 'Storage']
            },
            {
                'name': 'Home & Living',
                'description': 'Furniture, home decor, kitchenware, and appliances',
                'meta_title': 'Home & Living - Furniture, Decor, Kitchen Appliances',
                'subcategories': ['Furniture', 'Kitchen Appliances', 'Home Decor', 'Bedding', 'Lighting']
            },
            {
                'name': 'Health & Beauty',
                'description': 'Personal care, cosmetics, skincare, and wellness products',
                'meta_title': 'Health & Beauty - Cosmetics, Skincare, Personal Care',
                'subcategories': ['Skincare', 'Makeup', 'Hair Care', 'Fragrances', 'Personal Care']
            },
            {
                'name': 'Baby Products',
                'description': 'Baby clothing, diapers, strollers, and nursery essentials',
                'meta_title': 'Baby Products - Clothing, Diapers, Strollers & More',
                'subcategories': ['Baby Clothing', 'Diapers', 'Strollers', 'Baby Gear', 'Nursery']
            },
            {
                'name': 'Sports & Fitness',
                'description': 'Sportswear, gym equipment, outdoor gear, and accessories',
                'meta_title': 'Sports & Fitness - Sportswear, Equipment, Outdoor Gear',
                'subcategories': ['Sportswear', 'Gym Equipment', 'Outdoor Gear', 'Fitness Trackers']
            },
            {
                'name': 'Automotive',
                'description': 'Car accessories, parts, and maintenance products',
                'meta_title': 'Automotive - Car Accessories, Parts & Maintenance',
                'subcategories': ['Car Accessories', 'Car Electronics', 'Maintenance', 'Tools']
            },
            {
                'name': 'Grocery',
                'description': 'Food items, beverages, and household essentials',
                'meta_title': 'Grocery - Food, Beverages, Household Essentials',
                'subcategories': ['Snacks', 'Beverages', 'Cooking Essentials', 'Household']
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'slug': slugify(cat_data['name']),
                    'description': cat_data['description'],
                    'is_active': True,
                    'meta_title': cat_data['meta_title'],
                    'meta_description': cat_data['description'][:200]
                }
            )
            categories.append(category)
            if created:
                self.stdout.write(f'  📁 Created category: {category.name}')
        
        return categories
    
    def create_products(self, num_products, categories, image_files, images_dir):
        """Create products with realistic names like on Jumia/Kilimall"""
        
        # Realistic product names by category
        products_data = {
            'Smartphones & Tablets': [
                "iPhone 13 Pro Max 256GB - Graphite (Grade A Refurbished)",
                "Samsung Galaxy S23 Ultra 5G 512GB - Phantom Black",
                "Xiaomi Redmi Note 13 Pro 5G 256GB - Midnight Black",
                "Tecno Spark 20 Pro 256GB + 8GB RAM - Magic Skin",
                "Infinix Note 30 VIP 5G 256GB - Racing Edition",
                "Oppo Reno 11 5G 256GB - Green",
                "Google Pixel 7 Pro 128GB - Snow",
                "Huawei Nova 11 Pro 256GB - Green",
                "Samsung Galaxy A54 5G 128GB - Awesome Violet",
                "iPhone 14 Pro 1TB - Deep Purple (Like New)",
                "Xiaomi Poco X6 Pro 5G 512GB - Yellow",
                "Tecno Phantom V Fold 5G 512GB - Black",
                "Infinix Zero 30 5G 256GB - Golden Hour",
                "Samsung Tab S9 Ultra 14.6\" 512GB - Graphite",
                "iPad Pro 12.9\" M2 Chip 256GB - Space Gray",
                "Huawei MatePad 11 2023 128GB - Gray"
            ],
            'Electronics': [
                "Samsung 55\" 4K UHD Smart TV - Crystal UHD",
                "LG 65\" OLED evo C3 Smart TV - 4K",
                "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
                "JBL Charge 5 Portable Bluetooth Speaker",
                "Apple MacBook Air M2 13\" 256GB - Silver",
                "Dell XPS 15 9520 Laptop - Intel i7, 16GB RAM, 512GB SSD",
                "Canon EOS R50 Mirrorless Camera Kit",
                "PlayStation 5 Console - Disc Edition",
                "Xbox Series X 1TB Console",
                "Nintendo Switch OLED Model - White",
                "Bose QuietComfort 45 Headphones",
                "Samsung Galaxy Watch 6 Classic 47mm",
                "Apple Watch Series 9 GPS 45mm",
                "DJI Mini 4 Pro Drone with RC Controller",
                "Epson EcoTank L3210 All-in-One Printer"
            ],
            'Fashion - Men': [
                "Levi's 501 Original Fit Jeans - Dark Blue (Size 32)",
                "Nike Air Force 1 '07 Men's Sneakers - White",
                "Tommy Hilfiger Classic Fit Polo Shirt - Black",
                "Adidas Ultraboost 22 Running Shoes - Core Black",
                "Hugo Boss Slim Fit Suit - Charcoal Gray",
                "Calvin Klein Cotton Stretch Boxer Briefs (3 Pack)",
                "Ray-Ban Aviator Classic Sunglasses - Gold/Green",
                "Casio G-Shock GA-2100-1A1 Watch",
                "The North Face 1996 Retro Nuptse Jacket - Black",
                "Timberland 6-Inch Premium Waterproof Boots - Wheat",
                "Polo Ralph Lauren Classic Oxford Shirt - Blue",
                "Under Armour Tech 2.0 Short Sleeve T-Shirt (3 Pack)"
            ],
            'Fashion - Women': [
                "Zara Satin Midi Dress - Emerald Green",
                "Nike Air Max 90 Women's Sneakers - White/Pink",
                "Michael Kors Jet Set Travel Tote Bag - Black",
                "Swarovski Infinity Crystal Necklace - White Gold",
                "H&M Ribbed Knit Midi Dress - Beige",
                "Adidas Women's Superstar Sneakers - White",
                "Coach Tabby Shoulder Bag 26 - Chalk",
                "Victoria's Secret Pink Seamless Sports Bra",
                "Forever 21 High Waisted Jeans - Light Blue",
                "Gucci GG Marmont Small Shoulder Bag - Black",
                "Daniel Wellington Classic Petite Watch - Rose Gold",
                "Lululemon Align High-Rise Leggings 25\" - Black"
            ],
            'Phones & Accessories': [
                "iPhone 15 Pro Max Leather Case - Black (Apple Original)",
                "Anker 20W USB-C Power Adapter - Fast Charger",
                "Samsung 25W Super Fast Charging Wall Charger",
                "Baseus 20000mAh Power Bank - 65W Fast Charging",
                "Spigen Tempered Glass Screen Protector for iPhone 14",
                "AirPods Pro (2nd Generation) with MagSafe Case",
                "Samsung Galaxy Buds2 Pro - Graphite",
                "Xiaomi 67W Turbo Charger Type-C Cable",
                "UAG Monarch Series Case for Samsung S23 Ultra",
                "PopSockets Phone Grip - Marble Design",
                "Anker 6ft USB-C to USB-C Cable (2 Pack)",
                "Wireless Car Charger Mount - 15W Fast Charging"
            ],
            'Computing': [
                "HP Victus 15 Gaming Laptop - Intel i5, RTX 3050, 16GB RAM",
                "Logitech MX Master 3S Wireless Mouse - Graphite",
                "Keychron K2 Pro Wireless Mechanical Keyboard - Brown Switch",
                "Samsung T7 Shield 1TB Portable SSD - Blue",
                "LG UltraFine 27\" 4K UHD Monitor - 27UP850N",
                "Razer DeathAdder V3 Pro Gaming Mouse - White",
                "ASUS ROG Strix G16 Gaming Laptop - i9, RTX 4060",
                "WD 2TB External Hard Drive - My Passport",
                "Microsoft Surface Laptop Studio 2 - 14.4\", i7, 16GB",
                "HyperX Cloud II Wireless Gaming Headset - Red",
                "Seagate 5TB External Hard Drive - Desktop",
                "Lenovo ThinkPad X1 Carbon Gen 11 - Intel i7, 16GB"
            ],
            'Home & Living': [
                "Instant Pot Duo 7-in-1 Pressure Cooker - 6 Quart",
                "Dyson V15 Detect Absolute Cordless Vacuum Cleaner",
                "Ninja Foodi 9-in-1 Air Fryer Oven - 8 Quart",
                "Nespresso Vertuo Plus Coffee Machine - Titanium",
                "Philips Air Fryer HD9200/91 - 4.1L Black",
                "Bissell CrossWave Pet Pro Wet Dry Vacuum",
                "Keurig K-Express Coffee Maker - Single Serve",
                "Shark Navigator Lift-Away Upright Vacuum",
                "Cuisinart 14-Cup Coffee Maker - Stainless Steel",
                "KitchenAid Artisan 5-Quart Stand Mixer - Empire Red"
            ],
            'Health & Beauty': [
                "L'Oréal Paris Revitalift Anti-Aging Cream Set",
                "Oral-B Pro 1000 Electric Toothbrush - Black",
                "Philips Norelco Shaver 9000 Prestige - Wet & Dry",
                "Braun Series 9 Pro Electric Shaver - Gold",
                "CeraVe Hydrating Facial Cleanser 16oz",
                "Neutrogena Hydro Boost Water Gel - 1.7oz",
                "The Ordinary Niacinamide 10% + Zinc 1% Serum",
                "Revlon One-Step Hair Dryer and Volumizer",
                "Gillette Fusion5 ProGlide Razor Blades (8 Pack)",
                "Dove Beauty Bar Soap - Sensitive Skin (16 Bars)"
            ],
            'Baby Products': [
                "Pampers Baby-Dry Diapers - Size 4 (72 Count)",
                "Graco Modes Nest Travel System Stroller - Glacier",
                "Philips Avent Anti-Colic Baby Bottles - 9oz (3 Pack)",
                "Fisher-Price Deluxe Kick & Play Piano Gym",
                "Baby Bjorn Baby Carrier Mini - Black",
                "Chicco KeyFit 30 Infant Car Seat - Graphite",
                "Baby Einstein Ocean Explorer Sensory Toy",
                "NUK Learner Sippy Cup with Handles - 5oz (2 Pack)",
                "Summer Infant Pop 'n Play Portable Playard",
                "Medela Breast Pump - Pump in Style with MaxFlow"
            ],
            'Sports & Fitness': [
                "Apple Watch Series 9 GPS + Cellular 45mm",
                "Fitbit Charge 6 Fitness Tracker - Obsidian",
                "Adidas Men's Alphaboost Running Shoes - Black",
                "Under Armour Women's HOVR Sonic 6 Running Shoes",
                "Bowflex SelectTech 552 Adjustable Dumbbells",
                "Yoga Mat 1/2 Inch Extra Thick - Purple",
                "Nike Dri-FIT Training T-Shirt (2 Pack)",
                "Garmin Forerunner 255 GPS Running Watch",
                "Rogue Echo Bumper Plates - 45lb (2 Pack)",
                "Peloton Bike+ Indoor Exercise Bike"
            ],
            'Automotive': [
                "Michelin Defender T+H All-Season Tire - 225/65R17",
                "Bosch ICON Wiper Blades - 26A (Pack of 2)",
                "Meguiar's Gold Class Car Wash Kit",
                "Anker Roav SmartDash Cam S1",
                "NOCO Genius 1 Battery Charger and Maintainer",
                "Armor All Car Cleaning Wipes (100 Count)",
                "Garmin DriveSmart 65 GPS Navigator",
                "Black+Decker Portable Car Vacuum Cleaner",
                "WeatherTech FloorLiner - Custom Fit",
                "Chemical Guys Car Detailing Kit"
            ],
            'Grocery': [
                "Nescafé Gold Blend Instant Coffee - 200g",
                "Kellogg's Corn Flakes Cereal - 500g (2 Pack)",
                "Coca-Cola Zero Sugar - 24 Cans",
                "Indomie Instant Noodles - Chicken Flavor (40 Pack)",
                "Blue Band Margarine - 500g",
                "Kimbo Kenyan Coffee Beans - 250g",
                "Cadbury Dairy Milk Chocolate - 180g",
                "Uncle Bens Basmati Rice - 2kg",
                "Kibao Pure Honey - 500g",
                "Azam Sugar - 2kg"
            ]
        }
        
        products = []
        product_counter = 0
        
        # Distribute products across categories
        for category in categories:
            if category.name not in products_data:
                continue
                
            category_products = products_data[category.name]
            # Calculate how many products to create for this category
            category_product_count = max(1, num_products // len(categories))
            
            for i in range(min(category_product_count, len(category_products))):
                if product_counter >= num_products:
                    break
                    
                product_name = category_products[i % len(category_products)]
                
                # Add variation if needed
                if random.choice([True, False]) and len(category_products) > 1:
                    variations = [" (New)", " (Limited Edition)", " (Best Seller)", " (Hot Deal)"]
                    product_name += random.choice(variations)
                
                # Generate realistic prices (KES)
                base_price = Decimal(random.randint(500, 150000)) / 100
                
                # Add price variations based on product type
                if any(term in product_name.lower() for term in ['iphone', 'samsung', 'macbook', 'playstation']):
                    base_price *= Decimal(random.uniform(1.5, 3.0))
                elif any(term in product_name.lower() for term in ['t-shirt', 'socks', 'soap']):
                    base_price = Decimal(random.randint(500, 5000)) / 100
                
                price = base_price
                
                # Compare price (original price with discount)
                compare_price = None
                discount = random.choice([0, 10, 15, 20, 25, 30, 40, 50])
                if discount > 0:
                    compare_price = price * Decimal(100 / (100 - discount))
                
                # Stock levels
                if "limited" in product_name.lower() or "edition" in product_name.lower():
                    stock = random.randint(1, 10)
                elif "best seller" in product_name.lower() or "hot" in product_name.lower():
                    stock = random.randint(20, 100)
                else:
                    stock = random.randint(10, 500)
                
                # Create product
                product = Product.objects.create(
                    category=category,
                    name=product_name,
                    slug=slugify(product_name)[:300],
                    description=self.generate_product_description(product_name, category.name),
                    short_description=f"Buy {product_name} at the best price in Kenya. {self.get_short_description(product_name)}",
                    price=price.quantize(Decimal('0.01')),
                    compare_price=compare_price.quantize(Decimal('0.01')) if compare_price else None,
                    stock=stock,
                    is_active=True,
                    is_featured=random.choice([True, False]) if price > Decimal('5000') else False,
                    meta_title=f"Buy {product_name} Online - Best Prices in Kenya",
                    meta_description=f"Shop for {product_name} in Kenya. {self.get_short_description(product_name)} Fast delivery to Nairobi, Mombasa, Kisumu.",
                    weight=Decimal(random.randint(100, 5000)) / 100 if random.choice([True, False]) else None
                )
                
                # Add main product image
                if image_files:
                    self.add_image_to_model(product, image_files, 'products')
                
                # Add additional images for premium products
                if price > Decimal('20000') and random.choice([True, False]):
                    num_extra = random.randint(1, 2)
                    for j in range(num_extra):
                        self.add_product_image(product, image_files, j == 0)
                
                products.append(product)
                product_counter += 1
                
                if product_counter % 10 == 0:
                    self.stdout.write(f'  📦 Created {product_counter} products...')
        
        return products
    
    def get_short_description(self, product_name):
        """Generate short description for products"""
        short_descriptions = [
            f"Genuine product with warranty",
            f"Free delivery within Nairobi",
            f"Official Kenya warranty included",
            f"Best price guaranteed",
            f"Limited stock available",
            f"Includes free accessories",
            f"Latest model - 2024 version",
            f"Customer favorite - highly rated"
        ]
        return random.choice(short_descriptions)
    
    def generate_product_description(self, product_name, category):
        """Generate realistic product description"""
        descriptions = [
            f"Experience the best with the {product_name}. This premium {category.lower()} product offers exceptional quality and performance. Perfect for everyday use, it combines style with functionality. Get yours today at the best price in Kenya!",
            
            f"Discover the amazing {product_name} - a top-rated {category.lower()} item that delivers outstanding results. Whether for personal or professional use, this product exceeds expectations. Features include durable construction, user-friendly design, and excellent value for money.",
            
            f"The {product_name} is here to revolutionize your {category.lower()} experience. Built with premium materials and cutting-edge technology, this product ensures reliability and superior performance. Order now for fast delivery across Kenya!",
            
            f"Looking for the perfect {category.lower()} item? Look no further than the {product_name}. This product combines quality, affordability, and style in one package. Join thousands of satisfied customers who have made this their top choice."
        ]
        
        return random.choice(descriptions)
    
    def add_image_to_model(self, model_instance, image_files, upload_to):
        """Add image to model instance"""
        try:
            if not image_files:
                return
            
            image_path = random.choice(image_files)
            if not os.path.exists(image_path):
                return
            
            with open(image_path, 'rb') as f:
                image_file = File(f)
                extension = os.path.splitext(image_path)[1]
                filename = f"{slugify(model_instance.name)}_{uuid.uuid4().hex[:8]}{extension}"
                model_instance.image.save(filename, image_file, save=True)
                
        except Exception as e:
            self.stdout.write(f'  ⚠️ Error adding image: {str(e)}')
    
    def add_product_image(self, product, image_files, is_primary=False):
        """Add additional product image"""
        try:
            if not image_files:
                return
            
            image_path = random.choice(image_files)
            if not os.path.exists(image_path):
                return
            
            with open(image_path, 'rb') as f:
                image_file = File(f)
                extension = os.path.splitext(image_path)[1]
                filename = f"{slugify(product.name)}_{uuid.uuid4().hex[:8]}{extension}"
                
                product_image = ProductImage.objects.create(
                    product=product,
                    is_primary=is_primary,
                    alt_text=product.name
                )
                product_image.image.save(filename, image_file, save=True)
                
        except Exception as e:
            pass
    
    def create_pickup_stations(self):
        """Create pickup stations in major Kenyan cities"""
        stations = [
            {"name": "Junction Mall", "county": "Nairobi", "town": "Nairobi", 
             "address": "Junction Mall, Ngong Road, Nairobi", "delivery_fee": "0", "phone": "0700000001"},
            {"name": "Two Rivers Mall", "county": "Nairobi", "town": "Nairobi", 
             "address": "Two Rivers Mall, Limuru Road, Nairobi", "delivery_fee": "0", "phone": "0700000002"},
            {"name": "Garden City Mall", "county": "Nairobi", "town": "Nairobi", 
             "address": "Garden City Mall, Thika Road, Nairobi", "delivery_fee": "0", "phone": "0700000003"},
            {"name": "The Hub Karen", "county": "Nairobi", "town": "Karen", 
             "address": "The Hub, Karen Road, Nairobi", "delivery_fee": "0", "phone": "0700000004"},
            {"name": "Mombasa CBD", "county": "Mombasa", "town": "Mombasa", 
             "address": "Moi Avenue, Mombasa CBD", "delivery_fee": "150", "phone": "0700000005"},
            {"name": "Nyali Centre", "county": "Mombasa", "town": "Nyali", 
             "address": "Nyali Centre, Links Road, Mombasa", "delivery_fee": "150", "phone": "0700000006"},
            {"name": "Kisumu CBD", "county": "Kisumu", "town": "Kisumu", 
             "address": "Oginga Odinga Street, Kisumu CBD", "delivery_fee": "200", "phone": "0700000007"},
            {"name": "West End Mall", "county": "Kisumu", "town": "Kisumu", 
             "address": "West End Mall, Kisumu", "delivery_fee": "200", "phone": "0700000008"},
            {"name": "Nakuru CBD", "county": "Nakuru", "town": "Nakuru", 
             "address": "Kenyatta Avenue, Nakuru CBD", "delivery_fee": "180", "phone": "0700000009"},
            {"name": "Eldoret CBD", "county": "Uasin Gishu", "town": "Eldoret", 
             "address": "Uganda Road, Eldoret CBD", "delivery_fee": "180", "phone": "0700000010"},
            {"name": "Thika CBD", "county": "Kiambu", "town": "Thika", 
             "address": "Thika CBD, Thika", "delivery_fee": "100", "phone": "0700000011"},
            {"name": "Machakos CBD", "county": "Machakos", "town": "Machakos", 
             "address": "Machakos CBD", "delivery_fee": "120", "phone": "0700000012"},
        ]
        
        for station in stations:
            PickupStation.objects.get_or_create(
                name=station["name"],
                defaults={
                    "slug": slugify(f"{station['county']}-{station['name']}"),
                    "county": station["county"],
                    "town": station["town"],
                    "address": station["address"],
                    "delivery_fee": Decimal(station["delivery_fee"]),
                    "is_active": True,
                    "phone": station["phone"],
                    "operating_hours": "Mon-Sat 8am-7pm, Sun 10am-5pm"
                }
            )
        
        self.stdout.write(f'  📍 Created/updated {len(stations)} pickup stations')
    
    def clear_existing_data(self):
        """Clear existing products and categories"""
        self.stdout.write('🧹 Clearing existing data...')
        ProductImage.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write('✅ Existing data cleared')