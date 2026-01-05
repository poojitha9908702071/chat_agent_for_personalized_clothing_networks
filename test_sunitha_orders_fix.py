#!/usr/bin/env python3

import requests
import jwt
import json
from datetime import datetime, timedelta

def test_sunitha_orders():
    """Test orders for sunitha@gmail.com with proper JWT token"""
    
    print("🔍 TESTING SUNITHA'S ORDERS")
    print("=" * 40)
    
    # Use the correct JWT secret from backend config
    JWT_SECRET = 'your-secret-key'
    
    # Create JWT token for sunitha@gmail.com
    payload = {
        'user_id': 1,
        'email': 'sunitha@gmail.com',
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    print(f"✅ Generated JWT token for sunitha@gmail.com")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Test the orders API
    print("\n📦 Testing GET /api/user/orders...")
    try:
        response = requests.get('http://localhost:5000/api/user/orders', headers=headers)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Found {data.get('count', 0)} orders")
            
            orders = data.get('orders', [])
            for order in orders:
                print(f"   📋 Order ID: {order['order_id']}")
                print(f"   💰 Amount: ₹{order['total_amount']}")
                print(f"   📅 Status: {order['order_status']}")
                print(f"   🗓️ Date: {order['created_at']}")
                print()
                
            if len(orders) == 0:
                print("❌ No orders found - this explains why chat shows 'no orders'")
            else:
                print("✅ Orders found - chat should work now!")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")
        print("🔧 Make sure backend server is running on port 5000")

def test_frontend_auth():
    """Test if frontend authentication is working"""
    
    print("\n🔐 TESTING FRONTEND AUTHENTICATION")
    print("=" * 40)
    
    # Check if localStorage has auth token (this would be done in browser)
    print("💡 To fix the chat issue, ensure:")
    print("1. User is properly logged in")
    print("2. JWT token is stored in localStorage as 'authToken'")
    print("3. Token contains correct email: sunitha@gmail.com")
    print("4. Backend server is running and accessible")
    
    # Create a sample token for testing
    JWT_SECRET = 'your-secret-key'
    payload = {
        'user_id': 1,
        'email': 'sunitha@gmail.com',
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    print(f"\n🔑 Sample JWT token for sunitha@gmail.com:")
    print(f"Token: {token}")
    print(f"\n💻 To test in browser console:")
    print(f"localStorage.setItem('authToken', '{token}');")
    print(f"location.reload(); // Refresh page")

if __name__ == "__main__":
    test_sunitha_orders()
    test_frontend_auth()

if __name__ == "__main__":
    test_sunitha_orders()
    test_frontend_auth()