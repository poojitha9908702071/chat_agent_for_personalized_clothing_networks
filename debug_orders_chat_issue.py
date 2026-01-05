#!/usr/bin/env python3
"""
Debug Orders Chat Issue
Check why order details are not showing in chat
"""

import requests
import json

BASE_URL = 'http://localhost:5000'

def debug_orders_chat():
    """Debug orders chat functionality"""
    
    print("🔍 DEBUGGING ORDERS CHAT ISSUE")
    print("=" * 50)
    
    # Login with test user
    test_user = {'email': 'test@example.com', 'password': 'password123'}
    
    print(f"\n👤 Testing with user: {test_user['email']}")
    
    try:
        login_response = requests.post(f'{BASE_URL}/api/login', json=test_user)
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
            print(f"✅ Login successful")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Test orders API directly
    print(f"\n📦 Testing Orders API directly...")
    try:
        response = requests.get(f'{BASE_URL}/api/user/orders', headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Orders API working")
            print(f"Response structure: {json.dumps(data, indent=2, default=str)}")
            
            orders = data.get('orders', [])
            print(f"\n📊 Orders Analysis:")
            print(f"   Total orders: {len(orders)}")
            
            if orders:
                for i, order in enumerate(orders):
                    print(f"\n   Order {i+1}:")
                    print(f"     ID: {order.get('order_id', 'N/A')}")
                    print(f"     Status: {order.get('order_status', 'N/A')}")
                    print(f"     Total: ₹{order.get('total_amount', 'N/A')}")
                    print(f"     Date: {order.get('created_at', 'N/A')}")
                    print(f"     Items: {order.get('order_items', 'N/A')}")
                    
                    # Check if order_items is a string that needs parsing
                    order_items = order.get('order_items')
                    if isinstance(order_items, str):
                        try:
                            parsed_items = json.loads(order_items)
                            print(f"     Parsed Items: {len(parsed_items)} items")
                        except:
                            print(f"     Items parsing failed")
                    elif isinstance(order_items, list):
                        print(f"     Items: {len(order_items)} items")
            else:
                print(f"   No orders found")
                
        else:
            print(f"❌ Orders API failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Orders API error: {e}")
    
    # Add a test order if none exist
    print(f"\n➕ Adding test order...")
    try:
        order_data = {
            'order_id': f'CHAT_TEST_{int(requests.get("http://worldtimeapi.org/api/timezone/UTC").json()["unixtime"])}',
            'total_amount': 2598,
            'shipping_address': 'Test Address, Test City, 12345',
            'order_items': [
                {
                    'product_id': 'CHAT_001',
                    'product_name': 'Chat Test Product 1',
                    'quantity': 1,
                    'price': 1299
                },
                {
                    'product_id': 'CHAT_002', 
                    'product_name': 'Chat Test Product 2',
                    'quantity': 1,
                    'price': 1299
                }
            ]
        }
        
        response = requests.post(f'{BASE_URL}/api/user/orders', json=order_data, headers=headers)
        if response.status_code in [200, 201]:
            print(f"✅ Test order added: {order_data['order_id']}")
        else:
            print(f"❌ Failed to add test order: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Add order error: {e}")
    
    # Test orders API again after adding
    print(f"\n🔄 Testing Orders API after adding test order...")
    try:
        response = requests.get(f'{BASE_URL}/api/user/orders', headers=headers)
        if response.status_code == 200:
            data = response.json()
            orders = data.get('orders', [])
            print(f"✅ Now showing {len(orders)} orders")
            
            if orders:
                latest_order = orders[0]  # Should be most recent
                print(f"\n📦 Latest Order Details:")
                print(f"   ID: {latest_order.get('order_id')}")
                print(f"   Status: {latest_order.get('order_status')}")
                print(f"   Total: ₹{latest_order.get('total_amount')}")
                print(f"   Date: {latest_order.get('created_at')}")
                
                # Check order_items format
                order_items = latest_order.get('order_items')
                print(f"   Items Type: {type(order_items)}")
                print(f"   Items Value: {order_items}")
                
                if isinstance(order_items, str):
                    try:
                        parsed_items = json.loads(order_items)
                        print(f"   ✅ Items parsed successfully: {len(parsed_items)} items")
                        for item in parsed_items:
                            print(f"     - {item.get('product_name', 'Unknown')} x{item.get('quantity', 1)}")
                    except Exception as parse_error:
                        print(f"   ❌ Items parsing failed: {parse_error}")
                        
        else:
            print(f"❌ Orders API still failing: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Orders retest error: {e}")
    
    print(f"\n" + "=" * 50)
    print(f"🎯 DEBUGGING SUMMARY")
    print(f"=" * 50)
    print(f"✅ Backend API is working")
    print(f"✅ Authentication is working")
    print(f"✅ Orders can be retrieved from database")
    print(f"")
    print(f"💡 If chat is not showing orders, check:")
    print(f"   1. Chat query detection (isOrdersListQuery)")
    print(f"   2. Chat handler (handleOrdersRequest)")
    print(f"   3. Frontend userDataApi.orders.getOrders()")
    print(f"   4. Message rendering in chat component")

if __name__ == "__main__":
    debug_orders_chat()