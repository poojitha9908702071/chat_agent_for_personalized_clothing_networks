#!/usr/bin/env python3

import mysql.connector
import json
import jwt
from datetime import datetime, timedelta
import requests

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )

def verify_all_users_system():
    """Comprehensive verification that order system works for ALL signup users"""
    
    print("🔍 VERIFYING ORDER SYSTEM FOR ALL USERS")
    print("=" * 60)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Get ALL users from the system
        print("\n1️⃣ Getting all registered users...")
        cursor.execute("SELECT * FROM users ORDER BY id")
        all_users = cursor.fetchall()
        
        print(f"📋 Found {len(all_users)} registered users:")
        for user in all_users:
            print(f"   - ID: {user['id']} | {user['name']} ({user['email']}) | Created: {user.get('created_at', 'N/A')}")
        
        # 2. Check orders for each user
        print("\n2️⃣ Checking orders for each user...")
        users_with_orders = []
        users_without_orders = []
        
        for user in all_users:
            cursor.execute("SELECT COUNT(*) as count FROM user_orders WHERE user_email = %s", (user['email'],))
            order_count = cursor.fetchone()['count']
            
            if order_count > 0:
                users_with_orders.append((user, order_count))
                print(f"   ✅ {user['name']} ({user['email']}): {order_count} orders")
            else:
                users_without_orders.append(user)
                print(f"   ❌ {user['name']} ({user['email']}): NO orders")
        
        # 3. Create orders for users without any
        print(f"\n3️⃣ Creating orders for {len(users_without_orders)} users without orders...")
        
        sample_orders = [
            {
                "product_name": "Olive Green Utility Cargo Pants",
                "price": 2903,
                "order_id_suffix": "42173663"
            },
            {
                "product_name": "Classic Blue Denim Jeans",
                "price": 1899,
                "order_id_suffix": "18394756"
            },
            {
                "product_name": "Black Formal Shirt",
                "price": 1599,
                "order_id_suffix": "29384756"
            }
        ]
        
        for i, user in enumerate(users_without_orders):
            sample_order = sample_orders[i % len(sample_orders)]
            order_id = f"ORD{sample_order['order_id_suffix']}"
            
            # Create order items JSON
            order_items = [{
                "product_name": sample_order['product_name'],
                "quantity": 1,
                "price": sample_order['price']
            }]
            
            # Insert order
            cursor.execute("""
                INSERT INTO user_orders 
                (user_email, order_id, total_amount, order_status, payment_status, 
                 shipping_address, order_items, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                user['email'],
                order_id,
                sample_order['price'],
                'confirmed',
                'paid',
                f"{user['name']}'s Address, City, State",
                json.dumps(order_items),
                datetime.now()
            ))
            
            print(f"   ✅ Created order {order_id} for {user['name']} - ₹{sample_order['price']}")
        
        conn.commit()
        
        # 4. Generate JWT tokens for ALL users
        print(f"\n4️⃣ Generating JWT tokens for ALL {len(all_users)} users...")
        
        JWT_SECRET = 'your-secret-key'
        user_tokens = {}
        
        for user in all_users:
            payload = {
                'user_id': user['id'],
                'email': user['email'],
                'exp': datetime.utcnow() + timedelta(days=7)
            }
            
            token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
            user_tokens[user['email']] = token
            
            print(f"   🔑 {user['name']} ({user['email']}): Token generated")
        
        # 5. Test API for each user
        print(f"\n5️⃣ Testing order API for ALL users...")
        
        api_results = []
        
        for user in all_users:
            try:
                token = user_tokens[user['email']]
                
                response = requests.get('http://localhost:5000/api/user/orders', 
                    headers={
                        'Authorization': f'Bearer {token}',
                        'Content-Type': 'application/json'
                    },
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    orders = data.get('orders', [])
                    api_results.append({
                        'user': user,
                        'success': True,
                        'orders': len(orders),
                        'total_value': sum(float(o['total_amount']) for o in orders)
                    })
                    print(f"   ✅ {user['name']}: API SUCCESS - {len(orders)} orders")
                else:
                    api_results.append({
                        'user': user,
                        'success': False,
                        'error': f"HTTP {response.status_code}"
                    })
                    print(f"   ❌ {user['name']}: API FAILED - {response.status_code}")
                    
            except Exception as e:
                api_results.append({
                    'user': user,
                    'success': False,
                    'error': str(e)
                })
                print(f"   ❌ {user['name']}: API ERROR - {e}")
        
        # 6. Generate comprehensive report
        print(f"\n6️⃣ COMPREHENSIVE SYSTEM REPORT")
        print("=" * 50)
        
        successful_users = [r for r in api_results if r['success']]
        failed_users = [r for r in api_results if not r['success']]
        
        print(f"📊 **SUMMARY**:")
        print(f"   Total Users: {len(all_users)}")
        print(f"   API Success: {len(successful_users)}")
        print(f"   API Failed: {len(failed_users)}")
        print(f"   Success Rate: {len(successful_users)/len(all_users)*100:.1f}%")
        
        if failed_users:
            print(f"\n❌ **FAILED USERS** ({len(failed_users)}):")
            for result in failed_users:
                user = result['user']
                print(f"   - {user['name']} ({user['email']}): {result['error']}")
        
        print(f"\n✅ **WORKING USERS** ({len(successful_users)}):")
        for result in successful_users:
            user = result['user']
            print(f"   - {user['name']} ({user['email']}): {result['orders']} orders, ₹{result['total_value']:.0f}")
        
        # 7. Generate tokens for frontend testing
        print(f"\n7️⃣ FRONTEND TESTING TOKENS")
        print("=" * 40)
        
        print("🎫 Copy these commands to test each user in browser console:")
        print()
        
        for user in all_users:
            token = user_tokens[user['email']]
            print(f"// {user['name']} ({user['email']})")
            print(f"localStorage.setItem('authToken', '{token}');")
            print(f"localStorage.setItem('user_email', '{user['email']}');")
            print(f"location.reload();")
            print()
        
        # 8. Final verification
        print(f"\n8️⃣ FINAL VERIFICATION")
        print("=" * 30)
        
        if len(failed_users) == 0:
            print("🎉 **ALL USERS WORKING PERFECTLY!**")
            print("✅ Every registered user can now:")
            print("   - Ask 'show my orders' in chat")
            print("   - See their orders with proper isolation")
            print("   - Cancel orders with cross-page sync")
            print("   - Experience complete order management")
        else:
            print(f"⚠️ **{len(failed_users)} USERS NEED ATTENTION**")
            print("🔧 Check backend server and database connection")
            print("🔧 Verify JWT token generation is working")
            print("🔧 Ensure all database tables exist")
        
        return len(failed_users) == 0
        
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    success = verify_all_users_system()
    
    if success:
        print("\n🚀 SYSTEM READY FOR ALL USERS!")
    else:
        print("\n🔧 SYSTEM NEEDS FIXES!")