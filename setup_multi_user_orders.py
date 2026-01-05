#!/usr/bin/env python3

import mysql.connector
import json
from datetime import datetime, timedelta
import random

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )

def setup_multi_user_orders():
    """Setup orders for all users to test the system comprehensively"""
    
    print("🔧 SETTING UP MULTI-USER ORDER SYSTEM")
    print("=" * 50)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Get all users
        print("\n1️⃣ Getting all users...")
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        
        print(f"📋 Found {len(users)} users:")
        for user in users:
            print(f"   - {user['name']} ({user['email']})")
        
        # 2. Create sample orders for each user
        print("\n2️⃣ Creating sample orders for each user...")
        
        sample_products = [
            {"name": "Classic White Slim-Fit Shirt (M, White)", "price": 2541},
            {"name": "Blue Denim Jeans (L, Blue)", "price": 1899},
            {"name": "Red Cotton T-Shirt (S, Red)", "price": 799},
            {"name": "Black Formal Pants (M, Black)", "price": 1299},
            {"name": "Pink Floral Dress (L, Pink)", "price": 2199},
            {"name": "Green Hoodie (XL, Green)", "price": 1599},
            {"name": "Grey Casual Shirt (M, Grey)", "price": 1099},
            {"name": "Navy Blue Blazer (L, Navy)", "price": 3499}
        ]
        
        order_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
        
        for user in users:
            user_email = user['email']
            
            # Create 2-4 orders per user
            num_orders = random.randint(2, 4)
            
            for i in range(num_orders):
                # Generate order ID
                order_id = f"ORD{random.randint(10000000, 99999999)}"
                
                # Select random products (1-3 items per order)
                num_items = random.randint(1, 3)
                selected_products = random.sample(sample_products, num_items)
                
                # Calculate total
                total_amount = sum(product['price'] for product in selected_products)
                
                # Random status
                status = random.choice(order_statuses)
                
                # Create order items JSON
                order_items = []
                for product in selected_products:
                    order_items.append({
                        "product_name": product['name'],
                        "quantity": 1,
                        "price": product['price']
                    })
                
                # Random date (last 30 days)
                days_ago = random.randint(1, 30)
                order_date = datetime.now() - timedelta(days=days_ago)
                
                # Check if order already exists
                cursor.execute("SELECT * FROM user_orders WHERE order_id = %s", (order_id,))
                existing = cursor.fetchone()
                
                if not existing:
                    # Insert order
                    cursor.execute("""
                        INSERT INTO user_orders 
                        (user_email, order_id, total_amount, order_status, payment_status, 
                         shipping_address, order_items, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        user_email,
                        order_id,
                        total_amount,
                        status,
                        'paid' if status != 'pending' else 'pending',
                        f"{user['name']}'s Address, City, State",
                        json.dumps(order_items),
                        order_date
                    ))
                    
                    print(f"   ✅ Created order {order_id} for {user['name']} - ₹{total_amount} ({status})")
        
        conn.commit()
        
        # 3. Verify orders for each user
        print("\n3️⃣ Verifying orders for each user...")
        
        for user in users:
            cursor.execute("""
                SELECT COUNT(*) as count, 
                       SUM(total_amount) as total_value,
                       GROUP_CONCAT(DISTINCT order_status) as statuses
                FROM user_orders 
                WHERE user_email = %s
            """, (user['email'],))
            
            stats = cursor.fetchone()
            
            print(f"   📊 {user['name']} ({user['email']}):")
            print(f"      Orders: {stats['count']}")
            print(f"      Total Value: ₹{stats['total_value'] or 0}")
            print(f"      Statuses: {stats['statuses'] or 'None'}")
            print()
        
        # 4. Test cancellation scenarios
        print("\n4️⃣ Setting up cancellation test scenarios...")
        
        # Find some orders that can be cancelled (not delivered/cancelled)
        cursor.execute("""
            SELECT order_id, user_email, order_status 
            FROM user_orders 
            WHERE order_status IN ('pending', 'confirmed', 'processing')
            LIMIT 3
        """)
        
        cancellable_orders = cursor.fetchall()
        
        print("📋 Orders available for cancellation testing:")
        for order in cancellable_orders:
            print(f"   - {order['order_id']} ({order['user_email']}) - Status: {order['order_status']}")
        
        print("\n✅ Multi-user order system setup complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def create_jwt_tokens_for_all_users():
    """Create JWT tokens for all users for testing"""
    
    print("\n🔑 CREATING JWT TOKENS FOR ALL USERS")
    print("=" * 40)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        
        import jwt
        from datetime import datetime, timedelta
        
        JWT_SECRET = 'your-secret-key'
        
        print("🎫 JWT Tokens for testing:")
        print()
        
        for user in users:
            payload = {
                'user_id': user['id'],
                'email': user['email'],
                'exp': datetime.utcnow() + timedelta(days=7)
            }
            
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            
            print(f"👤 {user['name']} ({user['email']}):")
            print(f"   Token: {token}")
            print(f"   Console Command:")
            print(f"   localStorage.setItem('authToken', '{token}');")
            print(f"   localStorage.setItem('user_email', '{user['email']}');")
            print(f"   location.reload();")
            print()
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    setup_multi_user_orders()
    create_jwt_tokens_for_all_users()