from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import json
from datetime import datetime, timedelta
from config import Config
from db import execute_query
from api_cache_service import api_cache_service
from clothing_api_service import clothing_api_service
from ebay_api_service import ebay_api_service
from ai_tryon_api import ai_tryon_bp

app = Flask(__name__)
CORS(app)

# Register AI Try-On Blueprint
app.register_blueprint(ai_tryon_bp, url_prefix='/ai-tryon')

# Helper function to generate JWT token
def generate_token(user_id, email):
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

# Helper function to verify JWT token
def verify_token(token):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Helper function to get user email from request
def get_user_email_from_token(request):
    """Extract user email from JWT token in request headers"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return None
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = verify_token(token)
        if payload and 'email' in payload:
            return payload['email']
        return None
    except Exception as e:
        print(f"Token extraction error: {e}")
        return None

@app.route('/api/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        # Validation
        if not name or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Check if user already exists
        existing_user = execute_query(
            "SELECT id FROM users WHERE email = %s",
            (email,),
            fetch=True
        )
        
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash password
        import hashlib
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        # Insert user with hashed password
        user_id = execute_query(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed_password)
        )
        
        if user_id:
            token = generate_token(user_id, email)
            return jsonify({
                'message': 'User created successfully',
                'token': token,
                'user': {
                    'id': user_id,
                    'name': name,
                    'email': email
                }
            }), 201
        else:
            return jsonify({'error': 'Failed to create user'}), 500
            
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        # Validation
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Get user from database
        users = execute_query(
            "SELECT id, name, email, password FROM users WHERE email = %s",
            (email,),
            fetch=True
        )
        
        if not users:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        user = users[0]
        
        # Check password - try both plain text and hashed
        import hashlib
        hashed_password = hashlib.sha256(password.encode()).hexdigest()
        
        if user['password'] == password or user['password'] == hashed_password:
            token = generate_token(user['id'], user['email'])
            return jsonify({
                'message': 'Login successful',
                'token': token,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
            
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/verify', methods=['GET'])
def verify():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = verify_token(token)
        if payload:
            return jsonify({'valid': True, 'user_id': payload['user_id']}), 200
        else:
            return jsonify({'valid': False}), 401
            
    except Exception as e:
        print(f"Verify error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        token = data.get('token')
        new_password = data.get('password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Extract email from token (simple token format: RESET_timestamp_randomstring)
        if not token.startswith('RESET_'):
            return jsonify({'error': 'Invalid reset token'}), 400
        
        # For demo purposes, we'll allow any valid token format
        # In production, you'd validate the token properly and check expiration
        
        # For now, let's assume the user provides their email separately
        # or we implement a proper token system
        return jsonify({
            'success': True,
            'message': 'Password reset functionality is available. Please contact support for assistance.'
        }), 200
        
    except Exception as e:
        print(f"Reset password error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/update-password', methods=['POST'])
def update_password():
    try:
        data = request.json
        email = data.get('email')
        new_password = data.get('password')
        
        if not email or not new_password:
            return jsonify({'error': 'Email and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        # Hash the new password
        import hashlib
        hashed_password = hashlib.sha256(new_password.encode()).hexdigest()
        
        # Update password in database
        result = execute_query(
            "UPDATE users SET password = %s WHERE email = %s",
            (hashed_password, email)
        )
        
        if result is not None:
            return jsonify({
                'success': True,
                'message': 'Password updated successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to update password'}), 500
            
    except Exception as e:
        print(f"Update password error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
def get_user(user_id):
    try:
        users = execute_query(
            "SELECT id, name, email, created_at FROM users WHERE id = %s",
            (user_id,),
            fetch=True
        )
        
        if users:
            return jsonify(users[0]), 200
        else:
            return jsonify({'error': 'User not found'}), 404
            
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ============= PRODUCT API ENDPOINTS =============

@app.route('/api/products/search-natural', methods=['POST'])
def search_products_natural():
    """Enhanced natural language product search with STRICT keyword matching"""
    try:
        data = request.json
        query = data.get('query', '').lower()
        override_filters = data.get('override_filters', {})
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        print(f"Natural language query: {query}")
        print(f"Override filters: {override_filters}")
        
        # Initialize filters
        filters = {}
        
        # Use override filters if provided (for follow-up queries)
        if override_filters:
            filters = override_filters.copy()
        else:
            # 1️⃣ GENDER DETECTION - WORD BOUNDARY MATCHING
            if 'women' in query or 'woman' in query or 'female' in query or 'girls' in query or 'ladies' in query:
                filters['gender'] = 'Women'
            elif 'men' in query or 'man' in query or 'male' in query or 'boys' in query or 'guys' in query:
                filters['gender'] = 'Men'
            
            # 2️⃣ CATEGORY DETECTION - EXACT MATCHING (Order matters - most specific first)
            category_mapping = {
                'T-shirts': ['t-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee', 'tees'],
                'Bottom Wear': ['bottom wear', 'bottomwear', 'pants', 'jeans', 'trousers'],
                f"Women{chr(8217)}s Bottomwear": ['women bottomwear', 'womens bottomwear', 'women\'s bottomwear'],  # Handle smart quote
                'Shirts': ['shirt', 'shirts'],
                'Dresses': ['dress', 'dresses', 'gown', 'gowns'],
                'Ethnic Wear': ['ethnic', 'traditional', 'ethnic wear', 'kurta', 'saree', 'kurti'],
                'Western Wear': ['western', 'casual', 'western wear'],
                'Hoodies': ['hoodie', 'hoodies', 'sweatshirt', 'sweatshirts'],
                'Tops and Co-ord Sets': ['tops', 'coord', 'co-ord', 'sets', 'top']
            }
            
            # Find the most specific category match
            detected_category = None
            for db_category, keywords in category_mapping.items():
                if any(keyword in query for keyword in keywords):
                    detected_category = db_category
                    break
            
            if detected_category:
                filters['product_category'] = detected_category
            
            # Special category mappings (override individual detection)
            if any(word in query for word in ['party', 'party wear', 'evening', 'night out']):
                if filters.get('gender') == 'Women':
                    filters['category_group'] = ['Western Wear', 'Dresses']
                else:
                    filters['category_group'] = ['Shirts', 'T-shirts']
                # Remove individual category if special mapping applies
                if 'product_category' in filters:
                    del filters['product_category']
            elif any(word in query for word in ['formal', 'office', 'work', 'business']):
                if filters.get('gender') == 'Women':
                    filters['category_group'] = ['Western Wear', 'Dresses']
                else:
                    filters['category_group'] = ['Shirts']
                # Remove individual category if special mapping applies
                if 'product_category' in filters:
                    del filters['product_category']
            
            # 3️⃣ COLOR DETECTION - EXACT MATCHING
            color_mapping = {
                'Black': ['black', 'dark'],
                'White': ['white', 'cream', 'off-white'],
                'Blue': ['blue', 'navy', 'sky blue', 'light blue'],
                'Red': ['red', 'maroon', 'crimson'],
                'Green': ['green', 'olive', 'mint'],
                'Pink': ['pink', 'rose', 'baby pink'],
                'Grey': ['grey', 'gray', 'charcoal'],
                'Brown': ['brown', 'tan', 'beige'],
                'Yellow': ['yellow', 'golden', 'mustard'],
                'Purple': ['purple', 'violet', 'lavender'],
                'Orange': ['orange', 'peach']
            }
            
            detected_color = None
            for db_color, keywords in color_mapping.items():
                if any(keyword in query for keyword in keywords):
                    detected_color = db_color
                    break
            
            if detected_color:
                filters['color'] = detected_color
            
            # 4️⃣ PRICE DETECTION
            import re
            
            # Under/below price patterns
            under_match = re.search(r'(?:under|below|less than|<)\s*(?:rs\.?|₹)?\s*(\d+)', query)
            if under_match:
                filters['price_max'] = int(under_match.group(1))
            
            # Above/over price patterns  
            above_match = re.search(r'(?:above|over|more than|>)\s*(?:rs\.?|₹)?\s*(\d+)', query)
            if above_match:
                filters['price_min'] = int(above_match.group(1))
            
            # Between price patterns
            between_match = re.search(r'between\s*(?:rs\.?|₹)?\s*(\d+)\s*(?:and|to|-)\s*(?:rs\.?|₹)?\s*(\d+)', query)
            if between_match:
                filters['price_min'] = int(between_match.group(1))
                filters['price_max'] = int(between_match.group(2))
            
            # 5️⃣ SIZE DETECTION
            size_match = re.search(r'\b(xs|s|m|l|xl|xxl|xxxl)\b', query, re.IGNORECASE)
            if size_match:
                filters['size'] = size_match.group(1).upper()
        
        print(f"Extracted filters: {filters}")
        
        # 6️⃣ BUILD SQL QUERY
        base_query = """
            SELECT 
                product_id,
                product_name as title,
                price,
                product_image as image_url,
                product_category as category,
                gender,
                product_description as description,
                color,
                size,
                stock,
                created_at
            FROM clothing 
            WHERE 1=1
        """
        
        params = []
        
        # Apply filters with STRICT EXACT MATCHING
        if 'gender' in filters:
            base_query += " AND LOWER(gender) = LOWER(%s)"
            params.append(filters['gender'])
        
        if 'product_category' in filters:
            base_query += " AND LOWER(product_category) = LOWER(%s)"
            params.append(filters['product_category'])
        elif 'category_group' in filters:
            # Handle multiple categories (for party wear, etc.)
            category_conditions = []
            for cat in filters['category_group']:
                category_conditions.append("LOWER(product_category) = LOWER(%s)")
                params.append(cat)
            base_query += f" AND ({' OR '.join(category_conditions)})"
        
        if 'color' in filters:
            # STRICT COLOR MATCHING - must contain the exact color word
            base_query += " AND (LOWER(color) = LOWER(%s) OR LOWER(color) LIKE LOWER(%s) OR LOWER(color) LIKE LOWER(%s) OR LOWER(color) LIKE LOWER(%s))"
            color_exact = filters['color']
            color_start = f"{filters['color']} %"  # "Pink Something"
            color_end = f"% {filters['color']}"    # "Something Pink"
            color_middle = f"% {filters['color']} %" # "Something Pink Something"
            params.extend([color_exact, color_start, color_end, color_middle])
        
        if 'price_min' in filters:
            base_query += " AND price >= %s"
            params.append(filters['price_min'])
        
        if 'price_max' in filters:
            base_query += " AND price <= %s"
            params.append(filters['price_max'])
        
        if 'size' in filters:
            base_query += " AND UPPER(size) = UPPER(%s)"
            params.append(filters['size'])
        
        # Add ordering and limit
        base_query += " ORDER BY price ASC LIMIT 20"
        
        print(f"SQL Query: {base_query}")
        print(f"Parameters: {params}")
        
        # Execute query with fallback mechanism
        products = execute_query(base_query, params, fetch=True)
        original_filters = filters.copy()
        fallback_attempted = False
        
        # 🔁 PARTIAL MATCH FALLBACK (VERY IMPORTANT)
        if not products and filters:
            print("No products found with all filters. Attempting fallback...")
            fallback_attempted = True
            
            # Priority order for filter removal: price → color → category → gender
            fallback_order = ['price_max', 'price_min', 'color', 'product_category', 'category_group', 'gender']
            
            for filter_to_remove in fallback_order:
                if filter_to_remove in filters:
                    print(f"Removing filter: {filter_to_remove}")
                    
                    # Create new filters without the least important one
                    fallback_filters = {k: v for k, v in filters.items() if k != filter_to_remove}
                    
                    # Rebuild query with fallback filters
                    fallback_query = """
                        SELECT 
                            product_id,
                            product_name as title,
                            price,
                            product_image as image_url,
                            product_category as category,
                            gender,
                            product_description as description,
                            color,
                            size,
                            stock,
                            created_at
                        FROM clothing 
                        WHERE 1=1
                    """
                    
                    fallback_params = []
                    
                    # Apply fallback filters
                    if 'gender' in fallback_filters:
                        fallback_query += " AND LOWER(gender) = LOWER(%s)"
                        fallback_params.append(fallback_filters['gender'])
                    
                    if 'product_category' in fallback_filters:
                        fallback_query += " AND LOWER(product_category) = LOWER(%s)"
                        fallback_params.append(fallback_filters['product_category'])
                    elif 'category_group' in fallback_filters:
                        category_conditions = []
                        for cat in fallback_filters['category_group']:
                            category_conditions.append("LOWER(product_category) = LOWER(%s)")
                            fallback_params.append(cat)
                        fallback_query += f" AND ({' OR '.join(category_conditions)})"
                    
                    if 'color' in fallback_filters:
                        fallback_query += " AND LOWER(color) LIKE LOWER(%s)"
                        fallback_params.append(f"%{fallback_filters['color']}%")
                    
                    if 'price_min' in fallback_filters:
                        fallback_query += " AND price >= %s"
                        fallback_params.append(fallback_filters['price_min'])
                    
                    if 'price_max' in fallback_filters:
                        fallback_query += " AND price <= %s"
                        fallback_params.append(fallback_filters['price_max'])
                    
                    if 'size' in fallback_filters:
                        fallback_query += " AND UPPER(size) = UPPER(%s)"
                        fallback_params.append(fallback_filters['size'])
                    
                    fallback_query += " ORDER BY price ASC LIMIT 20"
                    
                    print(f"Fallback SQL Query: {fallback_query}")
                    print(f"Fallback Parameters: {fallback_params}")
                    
                    # Try fallback query
                    products = execute_query(fallback_query, fallback_params, fetch=True)
                    
                    if products:
                        print(f"Fallback successful! Found {len(products)} products")
                        filters = fallback_filters  # Update filters to reflect what was actually used
                        break
        
        # ❌ WHEN TO SAY "NO PRODUCTS FOUND" - Only after all fallback attempts fail
        if not products:
            return jsonify({
                'success': True,
                'count': 0,
                'products': [],
                'filters_applied': original_filters,
                'message': 'No products found matching your request. Please try a different color, price, or category.',
                'fallback_attempted': fallback_attempted
            }), 200
        
        # Transform products to expected format
        transformed_products = []
        for p in products:
            transformed_product = {
                'product_id': str(p['product_id']),
                'id': p['product_id'],
                'title': p['title'],
                'price': float(p['price']),
                'image_url': p['image_url'],
                'category': p['category'],
                'gender': p['gender'].lower() if p['gender'] else 'unisex',
                'description': p['description'] or '',
                'color': p['color'] or '',
                'size': p['size'] or '',
                'stock': p['stock'] or 0,
                'rating': 4.5,
                'source': 'clothing_table',
                'cached_at': p['created_at'].isoformat() if p['created_at'] else ''
            }
            transformed_products.append(transformed_product)
        
        # Generate response message
        response_message = ""
        if fallback_attempted and products:
            response_message = "Showing closest matching results based on your request."
        
        return jsonify({
            'success': True,
            'count': len(transformed_products),
            'products': transformed_products,
            'filters_applied': filters,
            'original_filters': original_filters,
            'query': query,
            'fallback_used': fallback_attempted,
            'message': response_message
        }), 200
        
    except Exception as e:
        print(f"Natural language search error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
@app.route('/api/products/search', methods=['GET'])
def search_products():
    """Search products from clothing table"""
    try:
        query = request.args.get('query', 'clothing')
        category = request.args.get('category', 'fashion')
        
        # Use clothing table instead of cache
        products = clothing_api_service.get_products(query, category)
        
        return jsonify({
            'success': True,
            'count': len(products),
            'products': products
        }), 200
        
    except Exception as e:
        print(f"Search products error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/products/category/<category>', methods=['GET'])
def get_products_by_category(category):
    """Get products by category from clothing table"""
    try:
        from urllib.parse import unquote
        
        # URL decode the category to handle special characters like apostrophes
        decoded_category = unquote(category)
        
        gender = request.args.get('gender')
        limit = int(request.args.get('limit', 100))
        
        print(f"DEBUG: Category endpoint called - original={category}, decoded={decoded_category}, gender={gender}")
        print(f"DEBUG: Decoded category lowercase: '{decoded_category.lower()}'")
        print(f"DEBUG: Character codes: {[ord(c) for c in decoded_category.lower()]}")
        
        # Handle different category types
        if decoded_category.lower() == 'fashion':
            # Get all products without any filter
            products = clothing_api_service.get_clothing_products(gender=gender, limit=limit)
        elif decoded_category.lower() in ['women', 'men']:
            # Gender-based filtering
            products = clothing_api_service.get_clothing_products(gender=decoded_category.lower(), limit=limit)
        else:
            # Specific category filtering (Western Wear, Dresses, etc.)
            products = clothing_api_service.get_clothing_products(category=decoded_category, gender=gender, limit=limit)
        
        return jsonify({
            'success': True,
            'count': len(products),
            'products': products
        }), 200
        
    except Exception as e:
        print(f"Get products by category error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/products/fetch-fresh', methods=['POST'])
def fetch_fresh_products():
    """Force fetch fresh products from Amazon API"""
    try:
        data = request.json
        query = data.get('query', 'clothing')
        category = data.get('category', 'fashion')
        
        # Check if we can make API call
        if not api_cache_service.can_make_api_call():
            return jsonify({
                'success': False,
                'error': 'API limit reached',
                'usage': api_cache_service.get_usage_stats()
            }), 429
        
        products = api_cache_service.fetch_from_amazon_api(query, category)
        
        return jsonify({
            'success': True,
            'count': len(products),
            'products': products,
            'source': 'amazon',
            'usage': api_cache_service.get_usage_stats()
        }), 200
        
    except Exception as e:
        print(f"Fetch fresh products error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/products/fetch-ebay', methods=['POST'])
def fetch_ebay_products():
    """Fetch products from eBay API (India)"""
    try:
        data = request.json
        query = data.get('query', 'clothing')
        limit = int(data.get('limit', 50))
        
        # Fetch from eBay
        products = ebay_api_service.search_products(query, limit)
        
        # Store in cache
        if products:
            ebay_api_service.store_products_in_cache(products)
        
        return jsonify({
            'success': True,
            'count': len(products),
            'products': products,
            'source': 'ebay'
        }), 200
        
    except Exception as e:
        print(f"Fetch eBay products error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/products/fetch-all', methods=['POST'])
def fetch_all_products():
    """Fetch products from both Amazon and eBay APIs"""
    try:
        data = request.json
        query = data.get('query', 'clothing')
        
        all_products = []
        sources_used = []
        
        # Try Amazon first (if under limit)
        if api_cache_service.can_make_api_call():
            amazon_products = api_cache_service.fetch_from_amazon_api(query, 'fashion')
            if amazon_products:
                all_products.extend(amazon_products)
                sources_used.append('amazon')
        
        # Fetch from eBay
        ebay_products = ebay_api_service.search_products(query, 50)
        if ebay_products:
            ebay_api_service.store_products_in_cache(ebay_products)
            all_products.extend(ebay_products)
            sources_used.append('ebay')
        
        return jsonify({
            'success': True,
            'count': len(all_products),
            'products': all_products,
            'sources': sources_used,
            'usage': api_cache_service.get_usage_stats()
        }), 200
        
    except Exception as e:
        print(f"Fetch all products error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/usage/stats', methods=['GET'])
def get_usage_stats():
    """Get API usage statistics"""
    try:
        stats = api_cache_service.get_usage_stats()
        return jsonify(stats), 200
    except Exception as e:
        print(f"Get usage stats error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/cache/count', methods=['GET'])
def get_cache_count():
    """Get total number of clothing products"""
    try:
        result = execute_query(
            "SELECT COUNT(*) as count FROM clothing",
            fetch=True
        )
        count = result[0]['count'] if result else 0
        
        return jsonify({
            'success': True,
            'cached_products': count
        }), 200
    except Exception as e:
        print(f"Get cache count error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ============= PRODUCT DETAIL & REVIEWS =============

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product_detail(product_id):
    """Get single product details from clothing table"""
    try:
        products = execute_query(
            """SELECT 
                product_id,
                product_name as title,
                price,
                product_image as image_url,
                product_category as category,
                gender,
                product_description as description,
                color,
                size,
                stock,
                created_at
            FROM clothing WHERE product_id = %s""",
            (product_id,),
            fetch=True
        )
        
        if not products:
            return jsonify({'error': 'Product not found'}), 404
        
        product = products[0]
        # Transform to expected format
        transformed_product = {
            'product_id': str(product['product_id']),
            'id': product['product_id'],
            'title': product['title'],
            'price': float(product['price']),
            'image_url': product['image_url'],
            'category': product['category'],
            'gender': product['gender'].lower() if product['gender'] else 'unisex',
            'description': product['description'] or '',
            'color': product['color'] or '',
            'size': product['size'] or '',
            'stock': product['stock'] or 0,
            'rating': 4.5,  # Default rating
            'source': 'clothing_table',
            'cached_at': product['created_at'].isoformat() if product['created_at'] else ''
        }
        
        return jsonify({
            'success': True,
            'product': transformed_product
        }), 200
        
    except Exception as e:
        print(f"Get product detail error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/products/<product_id>/similar', methods=['GET'])
def get_similar_products(product_id):
    """Get similar products based on category and gender from clothing table"""
    try:
        # Get the original product
        products = execute_query(
            "SELECT product_category as category, gender FROM clothing WHERE product_id = %s",
            (product_id,),
            fetch=True
        )
        
        if not products:
            return jsonify({'error': 'Product not found'}), 404
        
        product = products[0]
        limit = int(request.args.get('limit', 8))
        
        # Get similar products (same category/gender, exclude current)
        similar = execute_query(
            """SELECT 
                product_id,
                product_name as title,
                price,
                product_image as image_url,
                product_category as category,
                gender,
                product_description as description,
                color,
                size,
                stock,
                created_at
            FROM clothing 
            WHERE product_category = %s 
            AND gender = %s 
            AND product_id != %s 
            ORDER BY RAND() 
            LIMIT %s""",
            (product.get('category', 'fashion'), product.get('gender', 'women'), product_id, limit),
            fetch=True
        )
        
        # Transform products to expected format
        transformed_products = []
        for p in similar:
            transformed_product = {
                'product_id': str(p['product_id']),
                'id': p['product_id'],
                'title': p['title'],
                'price': float(p['price']),
                'image_url': p['image_url'],
                'category': p['category'],
                'gender': p['gender'].lower() if p['gender'] else 'unisex',
                'description': p['description'] or '',
                'color': p['color'] or '',
                'size': p['size'] or '',
                'stock': p['stock'] or 0,
                'rating': 4.5,
                'source': 'clothing_table',
                'cached_at': p['created_at'].isoformat() if p['created_at'] else ''
            }
            transformed_products.append(transformed_product)
        
        return jsonify({
            'success': True,
            'count': len(transformed_products),
            'products': transformed_products
        }), 200
        
    except Exception as e:
        print(f"Get similar products error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/reviews/<product_id>', methods=['GET'])
def get_reviews(product_id):
    """Get reviews for a product"""
    try:
        reviews = execute_query(
            """SELECT r.*, u.name as user_name 
               FROM reviews r 
               JOIN users u ON r.user_id = u.id 
               WHERE r.product_id = %s 
               ORDER BY r.created_at DESC""",
            (product_id,),
            fetch=True
        )
        
        return jsonify({
            'success': True,
            'count': len(reviews),
            'reviews': reviews
        }), 200
        
    except Exception as e:
        print(f"Get reviews error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/reviews', methods=['POST'])
def add_review():
    """Add a review for a product"""
    try:
        data = request.json
        product_id = data.get('product_id')
        user_id = data.get('user_id')
        rating = data.get('rating')
        comment = data.get('comment', '')
        
        if not product_id or not user_id or not rating:
            return jsonify({'error': 'Product ID, User ID, and Rating are required'}), 400
        
        if not (1 <= rating <= 5):
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
        
        review_id = execute_query(
            """INSERT INTO reviews (product_id, user_id, rating, comment) 
               VALUES (%s, %s, %s, %s)""",
            (product_id, user_id, rating, comment)
        )
        
        if review_id:
            return jsonify({
                'success': True,
                'message': 'Review added successfully',
                'review_id': review_id
            }), 201
        else:
            return jsonify({'error': 'Failed to add review'}), 500
            
    except Exception as e:
        print(f"Add review error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

# ============= VIRTUAL TRY-ON =============

@app.route('/api/virtual-tryon', methods=['POST'])
def virtual_tryon():
    """
    Virtual Try-On endpoint - Proxy to Hugging Face IDM-VTON API
    This avoids CORS issues and keeps API key secure
    """
    try:
        data = request.json
        person_image = data.get('person_image')
        garment_image = data.get('garment_image')
        category = data.get('category', 'upper_body')
        
        if not person_image or not garment_image:
            return jsonify({'error': 'Both person_image and garment_image are required'}), 400
        
        # Get Hugging Face API key from environment
        hf_api_key = Config.HUGGINGFACE_API_KEY if hasattr(Config, 'HUGGINGFACE_API_KEY') else None
        
        print(f"Virtual Try-On request - Category: {category}")
        
        # Check if API key is configured
        if not hf_api_key or hf_api_key == 'your_huggingface_api_key_here':
            # Demo mode - return person image
            print("Running in demo mode (no API key configured)")
            return jsonify({
                'success': True,
                'result_image': person_image,  # For demo, return person image
                'message': 'Virtual try-on feature is in demo mode. Configure Hugging Face API for full functionality.'
            }), 200
        
        # Full mode - call Hugging Face API
        try:
            import requests
            
            # Hugging Face API endpoint
            api_url = "https://api-inference.huggingface.co/models/yisol/IDM-VTON"
            
            headers = {
                "Authorization": f"Bearer {hf_api_key}"
            }
            
            # Prepare the request
            # Note: This is a simplified version. The actual API may require different format
            payload = {
                "inputs": {
                    "person_image": person_image,
                    "garment_image": garment_image,
                    "category": category
                }
            }
            
            print("Calling Hugging Face API...")
            response = requests.post(api_url, headers=headers, json=payload, timeout=60)
            
            if response.status_code == 200:
                # Success - return the result
                result_image = response.content
                import base64
                result_base64 = base64.b64encode(result_image).decode('utf-8')
                return jsonify({
                    'success': True,
                    'result_image': f'data:image/png;base64,{result_base64}'
                }), 200
            else:
                print(f"Hugging Face API error: {response.status_code} - {response.text}")
                # Fallback to demo mode on API error
                return jsonify({
                    'success': True,
                    'result_image': person_image,
                    'message': f'API error (falling back to demo mode): {response.text}'
                }), 200
                
        except Exception as api_error:
            print(f"Hugging Face API call error: {api_error}")
            # Fallback to demo mode on error
            return jsonify({
                'success': True,
                'result_image': person_image,
                'message': f'API call failed (demo mode): {str(api_error)}'
            }), 200
        
    except Exception as e:
        print(f"Virtual try-on error: {e}")
        return jsonify({'error': str(e)}), 500

# ============= USER DATA ISOLATION ENDPOINTS =============

@app.route('/api/user/search-history', methods=['GET', 'POST'])
def user_search_history():
    """Get or save user's search history - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            # Get user's search history ONLY
            searches = execute_query(
                """SELECT search_query, search_filters, results_count, created_at 
                   FROM user_search_history 
                   WHERE user_email = %s 
                   ORDER BY created_at DESC 
                   LIMIT 50""",
                (user_email,),
                fetch=True
            )
            
            return jsonify({
                'success': True,
                'searches': searches or [],
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            query = data.get('query')
            filters = data.get('filters', {})
            results_count = data.get('results_count', 0)
            
            # Save search for THIS USER ONLY
            execute_query(
                """INSERT INTO user_search_history (user_email, search_query, search_filters, results_count) 
                   VALUES (%s, %s, %s, %s)""",
                (user_email, query, json.dumps(filters), results_count)
            )
            
            return jsonify({'success': True, 'message': 'Search saved'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/user/wishlist', methods=['GET', 'POST', 'DELETE'])
def user_wishlist():
    """Manage user's wishlist - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            # Get THIS USER's wishlist ONLY
            items = execute_query(
                """SELECT product_id, product_name, product_image, product_price, 
                          product_category, added_at 
                   FROM user_wishlist 
                   WHERE user_email = %s 
                   ORDER BY added_at DESC""",
                (user_email,),
                fetch=True
            )
            
            return jsonify({
                'success': True,
                'wishlist': items or [],
                'count': len(items) if items else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            product_id = data.get('product_id')
            product_name = data.get('product_name')
            product_image = data.get('product_image')
            product_price = data.get('product_price')
            product_category = data.get('product_category')
            
            # Add to THIS USER's wishlist ONLY
            execute_query(
                """INSERT INTO user_wishlist 
                   (user_email, product_id, product_name, product_image, product_price, product_category) 
                   VALUES (%s, %s, %s, %s, %s, %s)
                   ON DUPLICATE KEY UPDATE added_at = CURRENT_TIMESTAMP""",
                (user_email, product_id, product_name, product_image, product_price, product_category)
            )
            
            return jsonify({'success': True, 'message': 'Added to wishlist'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            product_id = request.args.get('product_id')
            
            # Remove from THIS USER's wishlist ONLY
            execute_query(
                "DELETE FROM user_wishlist WHERE user_email = %s AND product_id = %s",
                (user_email, product_id)
            )
            
            return jsonify({'success': True, 'message': 'Removed from wishlist'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/user/cart', methods=['GET', 'POST', 'PUT', 'DELETE'])
def user_cart():
    """Manage user's cart - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            # Get THIS USER's cart ONLY
            items = execute_query(
                """SELECT product_id, product_name, product_image, product_price, 
                          product_category, quantity, added_at 
                   FROM user_cart 
                   WHERE user_email = %s 
                   ORDER BY added_at DESC""",
                (user_email,),
                fetch=True
            )
            
            total = sum(float(item['product_price']) * item['quantity'] for item in items) if items else 0
            
            return jsonify({
                'success': True,
                'cart': items or [],
                'count': len(items) if items else 0,
                'total': total,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            product_id = data.get('product_id')
            product_name = data.get('product_name')
            product_image = data.get('product_image')
            product_price = data.get('product_price')
            product_category = data.get('product_category')
            quantity = data.get('quantity', 1)
            
            # Add to THIS USER's cart ONLY
            execute_query(
                """INSERT INTO user_cart 
                   (user_email, product_id, product_name, product_image, product_price, product_category, quantity) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)
                   ON DUPLICATE KEY UPDATE 
                   quantity = quantity + VALUES(quantity),
                   updated_at = CURRENT_TIMESTAMP""",
                (user_email, product_id, product_name, product_image, product_price, product_category, quantity)
            )
            
            return jsonify({'success': True, 'message': 'Added to cart'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'PUT':
        try:
            data = request.json
            product_id = data.get('product_id')
            quantity = data.get('quantity', 1)
            
            # Update THIS USER's cart item ONLY
            execute_query(
                """UPDATE user_cart 
                   SET quantity = %s, updated_at = CURRENT_TIMESTAMP 
                   WHERE user_email = %s AND product_id = %s""",
                (quantity, user_email, product_id)
            )
            
            return jsonify({'success': True, 'message': 'Cart updated'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            product_id = request.args.get('product_id')
            
            if product_id:
                # Remove specific item from THIS USER's cart ONLY
                execute_query(
                    "DELETE FROM user_cart WHERE user_email = %s AND product_id = %s",
                    (user_email, product_id)
                )
                message = 'Item removed from cart'
            else:
                # Clear entire cart for THIS USER ONLY
                execute_query(
                    "DELETE FROM user_cart WHERE user_email = %s",
                    (user_email,)
                )
                message = 'Cart cleared'
            
            return jsonify({'success': True, 'message': message}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/user/orders', methods=['GET', 'POST'])
def user_orders():
    """Manage user's orders - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            # Get THIS USER's orders ONLY
            orders = execute_query(
                """SELECT order_id, total_amount, order_status, payment_status, 
                          shipping_address, order_items, created_at, updated_at 
                   FROM user_orders 
                   WHERE user_email = %s 
                   ORDER BY created_at DESC""",
                (user_email,),
                fetch=True
            )
            
            return jsonify({
                'success': True,
                'orders': orders or [],
                'count': len(orders) if orders else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            order_id = data.get('order_id')
            total_amount = data.get('total_amount')
            shipping_address = data.get('shipping_address')
            order_items = data.get('order_items', [])
            
            # Create order for THIS USER ONLY
            execute_query(
                """INSERT INTO user_orders 
                   (user_email, order_id, total_amount, shipping_address, order_items) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (user_email, order_id, total_amount, shipping_address, json.dumps(order_items))
            )
            
            # Clear THIS USER's cart after order
            execute_query("DELETE FROM user_cart WHERE user_email = %s", (user_email,))
            
            return jsonify({'success': True, 'message': 'Order placed', 'order_id': order_id}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/user/orders/cancel', methods=['POST'])
def cancel_user_order():
    """Cancel user's order - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        data = request.json
        order_id = data.get('order_id')
        reason = data.get('reason', 'User requested cancellation')
        
        if not order_id:
            return jsonify({'error': 'Order ID is required'}), 400
        
        # Check if order exists and belongs to this user
        existing_order = execute_query(
            """SELECT order_id, order_status FROM user_orders 
               WHERE user_email = %s AND order_id = %s""",
            (user_email, order_id),
            fetch=True
        )
        
        if not existing_order:
            return jsonify({'error': 'Order not found or access denied'}), 404
        
        # Check if order can be cancelled (not already delivered/cancelled)
        current_status = existing_order[0]['order_status'] if existing_order else ''
        if current_status.lower() in ['delivered', 'cancelled']:
            return jsonify({'error': f'Cannot cancel order with status: {current_status}'}), 400
        
        # Update order status to cancelled
        execute_query(
            """UPDATE user_orders 
               SET order_status = 'cancelled', 
                   order_notes = %s, 
                   updated_at = CURRENT_TIMESTAMP 
               WHERE user_email = %s AND order_id = %s""",
            (f"Cancelled: {reason}", user_email, order_id)
        )
        
        return jsonify({
            'success': True, 
            'message': 'Order cancelled successfully',
            'order_id': order_id,
            'reason': reason
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/chat-history', methods=['GET', 'POST'])
def user_chat_history():
    """Manage user's chat history - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            session_id = request.args.get('session_id')
            
            if session_id:
                # Get specific session for THIS USER ONLY
                messages = execute_query(
                    """SELECT message_text, is_user_message, message_type, message_data, created_at 
                       FROM user_chat_history 
                       WHERE user_email = %s AND session_id = %s 
                       ORDER BY created_at ASC""",
                    (user_email, session_id),
                    fetch=True
                )
            else:
                # Get recent messages for THIS USER ONLY
                messages = execute_query(
                    """SELECT message_text, is_user_message, message_type, message_data, created_at 
                       FROM user_chat_history 
                       WHERE user_email = %s 
                       ORDER BY created_at DESC 
                       LIMIT 100""",
                    (user_email,),
                    fetch=True
                )
            
            return jsonify({
                'success': True,
                'messages': messages or [],
                'count': len(messages) if messages else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            session_id = data.get('session_id')
            message_text = data.get('message_text')
            is_user_message = data.get('is_user_message', True)
            message_type = data.get('message_type', 'text')
            message_data = data.get('message_data', {})
            
            # Save message for THIS USER ONLY
            execute_query(
                """INSERT INTO user_chat_history 
                   (user_email, session_id, message_text, is_user_message, message_type, message_data) 
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (user_email, session_id, message_text, is_user_message, message_type, json.dumps(message_data))
            )
            
            return jsonify({'success': True, 'message': 'Chat message saved'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/user/chat-sessions', methods=['GET', 'POST'])
def user_chat_sessions():
    """Manage complete chat sessions - Save on logout, view in history"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            # Get all chat sessions for THIS USER ONLY (grouped by session_id)
            sessions = execute_query(
                """SELECT session_id, 
                          MIN(created_at) as session_start,
                          MAX(created_at) as session_end,
                          COUNT(*) as message_count
                   FROM user_chat_history 
                   WHERE user_email = %s 
                   GROUP BY session_id 
                   ORDER BY session_start DESC 
                   LIMIT 20""",
                (user_email,),
                fetch=True
            )
            
            # Get messages for each session
            session_list = []
            for session in sessions or []:
                messages = execute_query(
                    """SELECT message_text, is_user_message, message_type, message_data, created_at 
                       FROM user_chat_history 
                       WHERE user_email = %s AND session_id = %s 
                       ORDER BY created_at ASC""",
                    (user_email, session['session_id']),
                    fetch=True
                )
                
                session_list.append({
                    'id': session['session_id'],
                    'messages': messages or [],
                    'timestamp': session['session_start'],
                    'title': f"Chat {session['session_start'][:10]}",
                    'message_count': session['message_count']
                })
            
            return jsonify({
                'success': True,
                'sessions': session_list,
                'count': len(session_list),
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            session_id = data.get('session_id')
            messages = data.get('messages', [])
            
            if not session_id or not messages:
                return jsonify({'error': 'session_id and messages are required'}), 400
            
            # Clear existing messages for this session (if any)
            execute_query(
                """DELETE FROM user_chat_history 
                   WHERE user_email = %s AND session_id = %s""",
                (user_email, session_id)
            )
            
            # Save all messages for THIS USER ONLY
            for message in messages:
                execute_query(
                    """INSERT INTO user_chat_history 
                       (user_email, session_id, message_text, is_user_message, message_type, message_data) 
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (
                        user_email, 
                        session_id, 
                        message.get('text', ''),
                        message.get('isUser', False),
                        message.get('type', 'text'),
                        json.dumps({
                            'products': message.get('products', []),
                            'options': message.get('options', []),
                            'flowState': message.get('flowState', {}),
                            'orders': message.get('orders', [])
                        })
                    )
                )
            
            return jsonify({
                'success': True, 
                'message': f'Chat session saved with {len(messages)} messages',
                'session_id': session_id
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/user/calendar-events', methods=['GET', 'POST', 'DELETE'])
def user_calendar_events():
    """Manage user's calendar events - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            # Get THIS USER's events ONLY
            events = execute_query(
                """SELECT user_gender, event_date, event_name, event_category, 
                          outfit_suggestions, notes, reminder_sent, created_at 
                   FROM user_calendar_events 
                   WHERE user_email = %s 
                   ORDER BY event_date ASC""",
                (user_email,),
                fetch=True
            )
            
            return jsonify({
                'success': True,
                'events': events or [],
                'count': len(events) if events else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            user_gender = data.get('user_gender')
            event_date = data.get('event_date')
            event_name = data.get('event_name')
            event_category = data.get('event_category', 'personal')
            outfit_suggestions = data.get('outfit_suggestions', [])
            notes = data.get('notes', '')
            
            # Save event for THIS USER ONLY
            execute_query(
                """INSERT INTO user_calendar_events 
                   (user_email, user_gender, event_date, event_name, event_category, outfit_suggestions, notes) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (user_email, user_gender, event_date, event_name, event_category, json.dumps(outfit_suggestions), notes)
            )
            
            return jsonify({'success': True, 'message': 'Event saved'}), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'DELETE':
        try:
            event_date = request.args.get('event_date')
            event_name = request.args.get('event_name')
            
            # Delete event for THIS USER ONLY
            execute_query(
                """DELETE FROM user_calendar_events 
                   WHERE user_email = %s AND event_date = %s AND event_name = %s""",
                (user_email, event_date, event_name)
            )
            
            return jsonify({'success': True, 'message': 'Event deleted'}), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

# ============= RETURNS & REFUNDS =============
@app.route('/api/user/returns', methods=['GET', 'POST'])
def user_returns():
    """Manage user's return/refund requests - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    if request.method == 'GET':
        try:
            returns = execute_query(
                """SELECT return_id, original_order_id, return_type, return_reason,
                          return_description, returned_items, return_amount, return_status,
                          refund_status, refund_amount, created_at, updated_at 
                   FROM user_returns 
                   WHERE user_email = %s 
                   ORDER BY created_at DESC""",
                (user_email,),
                fetch=True
            )
            
            return jsonify({
                'success': True,
                'returns': returns or [],
                'count': len(returns) if returns else 0,
                'user_email': user_email
            }), 200
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    elif request.method == 'POST':
        try:
            data = request.json
            return_id = f"RET_{int(datetime.now().timestamp())}_{user_email.split('@')[0]}"
            
            returned_items = data.get('returned_items', [])
            return_amount = sum(item.get('price', 0) * item.get('quantity', 1) for item in returned_items)
            
            execute_query(
                """INSERT INTO user_returns 
                   (user_email, return_id, original_order_id, return_type, return_reason,
                    return_description, returned_items, return_amount) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (user_email, return_id, data.get('order_id'), data.get('return_type'),
                 data.get('return_reason'), data.get('return_description'),
                 json.dumps(returned_items), return_amount)
            )
            
            return jsonify({
                'success': True, 
                'message': 'Return request created successfully',
                'return_id': return_id
            }), 201
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/user/notifications', methods=['GET'])
def user_notifications():
    """Get user's notifications - ISOLATED PER USER"""
    user_email = get_user_email_from_token(request)
    if not user_email:
        return jsonify({'error': 'Authentication required'}), 401
    
    try:
        notifications = execute_query(
            """SELECT id, notification_type, title, message, notification_data,
                      is_read, is_important, created_at 
               FROM user_notifications 
               WHERE user_email = %s 
               ORDER BY is_important DESC, created_at DESC""",
            (user_email,),
            fetch=True
        )
        
        return jsonify({
            'success': True,
            'notifications': notifications or [],
            'count': len(notifications) if notifications else 0,
            'user_email': user_email
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=Config.PORT, debug=True)
