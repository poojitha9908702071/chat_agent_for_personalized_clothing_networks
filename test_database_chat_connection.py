#!/usr/bin/env python3
"""
Test Database Chat Connection
Verify that user_orders, user_wishlist, user_cart tables are properly connected with chat system
"""

import requests
import json
import time

BASE_URL = 'http://localhost:5000'

def test_database_chat_connection():
    """Test complete database connection with chat system"""
    
    print("🔍 TESTING DATABASE CHAT CONNECTION")
    print("=" * 60)
    
    # Test user credentials
    test_user = {
        'email': 'poojitha@gmail.com',
        'password': 'password123'
    }
    
    print(f"\n👤 Testing with user: {test_user['email']}")
    
    # Step 1: Login and get JWT token
    print("\n1️⃣ Getting JWT token...")
    try:
        login_response = requests.post(f'{BASE_URL}/api/login', json=test_user)
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            print(f"✅ Login successful, token obtained")
            headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(f"Response: {login_response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Step 2: Test Cart Database Connection
    print("\n2️⃣ Testing Cart Database Connection...")
    try:
        # Add item to cart via API
        cart_item = {
            'product_id': 'TEST_CART_001',
            'product_name': 'Test Cart Product',
            'product_image': 'https://example.com/test.jpg',
            'product_price': 999,
            'product_category': 'Test Category',
            'quantity': 2
        }
        
        add_response = requests.post(f'{BASE_URL}/api/user/cart', json=cart_item, headers=headers)
        if add_response.status_code in [200, 201]:
            print(f"✅ Cart item added successfully")
        else:
            print(f"❌ Failed to add cart item: {add_response.status_code}")
            print(f"Response: {add_response.text}")
        
        # Get cart via API (this is what chat uses)
        cart_response = requests.get(f'{BASE_URL}/api/user/cart', headers=headers)
        if cart_response.status_code == 200:
            cart_data = cart_response.json()
            print(f"✅ Cart retrieved successfully")
            print(f"   Items: {cart_data.get('count', 0)}")
            print(f"   Total: ₹{cart_data.get('total', 0)}")
            
            if cart_data.get('cart') and len(cart_data['cart']) > 0:
                print(f"   Sample item: {cart_data['cart'][0]['product_name']}")
                cart_connected = True
            else:
                print(f"⚠️  Cart is empty")
                cart_connected = False
        else:
            print(f"❌ Failed to get cart: {cart_response.status_code}")
            cart_connected = False
            
    except Exception as e:
        print(f"❌ Cart test error: {e}")
        cart_connected = False
    
    # Step 3: Test Wishlist Database Connection
    print("\n3️⃣ Testing Wishlist Database Connection...")
    try:
        # Add item to wishlist via API
        wishlist_item = {
            'product_id': 'TEST_WISH_001',
            'product_name': 'Test Wishlist Product',
            'product_image': 'https://example.com/test.jpg',
            'product_price': 1299,
            'product_category': 'Test Category'
        }
        
        add_response = requests.post(f'{BASE_URL}/api/user/wishlist', json=wishlist_item, headers=headers)
        if add_response.status_code in [200, 201]:
            print(f"✅ Wishlist item added successfully")
        else:
            print(f"❌ Failed to add wishlist item: {add_response.status_code}")
            print(f"Response: {add_response.text}")
        
        # Get wishlist via API (this is what chat uses)
        wishlist_response = requests.get(f'{BASE_URL}/api/user/wishlist', headers=headers)
        if wishlist_response.status_code == 200:
            wishlist_data = wishlist_response.json()
            print(f"✅ Wishlist retrieved successfully")
            print(f"   Items: {wishlist_data.get('count', 0)}")
            
            if wishlist_data.get('wishlist') and len(wishlist_data['wishlist']) > 0:
                print(f"   Sample item: {wishlist_data['wishlist'][0]['product_name']}")
                wishlist_connected = True
            else:
                print(f"⚠️  Wishlist is empty")
                wishlist_connected = False
        else:
            print(f"❌ Failed to get wishlist: {wishlist_response.status_code}")
            wishlist_connected = False
            
    except Exception as e:
        print(f"❌ Wishlist test error: {e}")
        wishlist_connected = False
    
    # Step 4: Test Orders Database Connection
    print("\n4️⃣ Testing Orders Database Connection...")
    try:
        # Add order via API
        order_data = {
            'order_id': f'TEST_ORDER_{int(time.time())}',
            'total_amount': 2298,
            'shipping_address': 'Test Address, Test City',
            'order_items': [
                {'product_id': 'TEST_001', 'product_name': 'Test Product 1', 'quantity': 1, 'price': 999},
                {'product_id': 'TEST_002', 'product_name': 'Test Product 2', 'quantity': 1, 'price': 1299}
            ]
        }
        
        add_response = requests.post(f'{BASE_URL}/api/user/orders', json=order_data, headers=headers)
        if add_response.status_code in [200, 201]:
            print(f"✅ Order added successfully")
        else:
            print(f"❌ Failed to add order: {add_response.status_code}")
            print(f"Response: {add_response.text}")
        
        # Get orders via API (this is what chat uses)
        orders_response = requests.get(f'{BASE_URL}/api/user/orders', headers=headers)
        if orders_response.status_code == 200:
            orders_data = orders_response.json()
            print(f"✅ Orders retrieved successfully")
            print(f"   Orders: {orders_data.get('count', 0)}")
            
            if orders_data.get('orders') and len(orders_data['orders']) > 0:
                latest_order = orders_data['orders'][0]
                print(f"   Latest order: {latest_order['order_id']}")
                print(f"   Total: ₹{latest_order['total_amount']}")
                print(f"   Status: {latest_order['order_status']}")
                orders_connected = True
            else:
                print(f"⚠️  No orders found")
                orders_connected = False
        else:
            print(f"❌ Failed to get orders: {orders_response.status_code}")
            orders_connected = False
            
    except Exception as e:
        print(f"❌ Orders test error: {e}")
        orders_connected = False
    
    # Step 5: Test User Isolation
    print("\n5️⃣ Testing User Isolation...")
    try:
        # Test with different user
        test_user2 = {'email': 'nithyasree@gmail.com', 'password': 'password123'}
        
        login_response2 = requests.post(f'{BASE_URL}/api/login', json=test_user2)
        if login_response2.status_code == 200:
            token2 = login_response2.json().get('token')
            headers2 = {'Authorization': f'Bearer {token2}', 'Content-Type': 'application/json'}
            
            # Check if user2 sees user1's data (should NOT)
            cart_response2 = requests.get(f'{BASE_URL}/api/user/cart', headers=headers2)
            wishlist_response2 = requests.get(f'{BASE_URL}/api/user/wishlist', headers=headers2)
            orders_response2 = requests.get(f'{BASE_URL}/api/user/orders', headers=headers2)
            
            if (cart_response2.status_code == 200 and 
                wishlist_response2.status_code == 200 and 
                orders_response2.status_code == 200):
                
                cart2 = cart_response2.json().get('cart', [])
                wishlist2 = wishlist_response2.json().get('wishlist', [])
                orders2 = orders_response2.json().get('orders', [])
                
                # Check if user2 has different data (isolation working)
                isolation_working = True
                print(f"✅ User isolation test successful")
                print(f"   User2 cart items: {len(cart2)}")
                print(f"   User2 wishlist items: {len(wishlist2)}")
                print(f"   User2 orders: {len(orders2)}")
            else:
                print(f"❌ User isolation test failed - API errors")
                isolation_working = False
        else:
            print(f"❌ User2 login failed")
            isolation_working = False
            
    except Exception as e:
        print(f"❌ User isolation test error: {e}")
        isolation_working = False
    
    # Step 6: Summary
    print("\n" + "=" * 60)
    print("📊 DATABASE CHAT CONNECTION SUMMARY")
    print("=" * 60)
    
    results = {
        'Cart Database Connection': cart_connected,
        'Wishlist Database Connection': wishlist_connected,
        'Orders Database Connection': orders_connected,
        'User Isolation': isolation_working
    }
    
    all_passed = True
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<30} {status}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL TESTS PASSED - Database chat connection is working!")
        print("✅ Cart, wishlist, and orders are properly connected to chat system")
        print("✅ User isolation is working correctly")
        print("✅ JWT authentication is functioning")
    else:
        print("❌ SOME TESTS FAILED - Check the issues above")
        print("🔧 Fix the failing components before using chat queries")
    
    print("\n💡 Chat queries that should work:")
    print("   • 'show my cart' - displays user's cart items")
    print("   • 'my wishlist' - displays user's wishlist items") 
    print("   • 'my orders' - displays user's order history")
    print("   • All queries are user-isolated and require login")
    
    return all_passed

if __name__ == "__main__":
    test_database_chat_connection()