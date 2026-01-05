#!/usr/bin/env python3
"""
Debug Real Order Issue
Check why placed orders are not showing in chat
"""

import requests
import json

BASE_URL = 'http://localhost:5000'

def debug_real_order_issue():
    """Debug why real placed orders are not showing in chat"""
    
    print("🔍 DEBUGGING REAL ORDER ISSUE")
    print("=" * 60)
    
    # Test with multiple users to see who has orders
    test_users = [
        {'email': 'test@example.com', 'password': 'password123'},
        {'email': 'poojitha@gmail.com', 'password': 'password123'},
        {'email': 'nithyasree@gmail.com', 'password': 'password123'},
        {'email': 'sunitha@gmail.com', 'password': 'password123'}
    ]
    
    for user in test_users:
        print(f"\n👤 Testing user: {user['email']}")
        
        # Try to login
        try:
            login_response = requests.post(f'{BASE_URL}/api/login', json=user)
            if login_response.status_code == 200:
                token = login_response.json().get('token')
                headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
                print(f"✅ Login successful")
                
                # Check orders via API
                orders_response = requests.get(f'{BASE_URL}/api/user/orders', headers=headers)
                if orders_response.status_code == 200:
                    orders_data = orders_response.json()
                    orders = orders_data.get('orders', [])
                    print(f"📦 Orders found: {len(orders)}")
                    
                    if orders:
                        for i, order in enumerate(orders[:3]):  # Show first 3
                            print(f"   Order {i+1}: {order.get('order_id')} - ₹{order.get('total_amount')} - {order.get('order_status', 'N/A')}")
                    else:
                        print(f"   No orders in user_orders table")
                        
                        # Check if orders might be in localStorage format
                        print(f"   💡 This user might have orders in localStorage only")
                        
                else:
                    print(f"❌ Orders API failed: {orders_response.status_code}")
                    
            else:
                print(f"❌ Login failed: {login_response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing {user['email']}: {e}")
    
    print(f"\n" + "=" * 60)
    print(f"🔍 CHECKING ORDER PLACEMENT PROCESS")
    print(f"=" * 60)
    
    # Check if there's a disconnect between frontend order placement and backend storage
    print(f"\n💡 Possible Issues:")
    print(f"1. Orders placed via frontend might be stored in localStorage only")
    print(f"2. Order placement might not be calling the backend API")
    print(f"3. User might be logged in with different email than expected")
    print(f"4. JWT token might be invalid during order placement")
    
    print(f"\n🔧 Solutions to try:")
    print(f"1. Check browser localStorage for 'orders' key")
    print(f"2. Verify which user email is currently logged in")
    print(f"3. Check if order placement calls /api/user/orders POST")
    print(f"4. Ensure JWT token is valid during checkout")
    
    # Test with the most likely user (test@example.com)
    print(f"\n🎯 DETAILED CHECK FOR test@example.com")
    try:
        login_response = requests.post(f'{BASE_URL}/api/login', json={'email': 'test@example.com', 'password': 'password123'})
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
            
            # Get detailed order info
            orders_response = requests.get(f'{BASE_URL}/api/user/orders', headers=headers)
            if orders_response.status_code == 200:
                data = orders_response.json()
                print(f"✅ API Response: {json.dumps(data, indent=2, default=str)}")
            else:
                print(f"❌ API Error: {orders_response.status_code} - {orders_response.text}")
                
    except Exception as e:
        print(f"❌ Detailed check error: {e}")

if __name__ == "__main__":
    debug_real_order_issue()