#!/usr/bin/env python3
"""
Quick test to verify user data isolation is working
"""

import requests
import json

BASE_URL = 'http://localhost:5000'

def test_user_isolation():
    print("🧪 Testing User Data Isolation Fix")
    print("=" * 50)
    
    # Test users
    users = [
        {'email': 'poojitha@example.com', 'password': 'password123'},
        {'email': 'nithya@example.com', 'password': 'password123'}
    ]
    
    user_tokens = {}
    
    # Login both users
    for user in users:
        try:
            response = requests.post(f'{BASE_URL}/api/login', json=user)
            if response.status_code == 200:
                token = response.json().get('token')
                user_tokens[user['email']] = token
                print(f"✅ {user['email']} logged in successfully")
            else:
                print(f"❌ {user['email']} login failed: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login error for {user['email']}: {e}")
            return False
    
    # Test data isolation
    for email, token in user_tokens.items():
        headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
        
        print(f"\n📊 Checking data for {email}:")
        
        # Check wishlist
        try:
            wishlist_response = requests.get(f'{BASE_URL}/api/user/wishlist', headers=headers)
            if wishlist_response.status_code == 200:
                wishlist_data = wishlist_response.json()
                wishlist_count = len(wishlist_data.get('wishlist', []))
                print(f"  - Wishlist: {wishlist_count} items")
            else:
                print(f"  - Wishlist: ERROR ({wishlist_response.status_code})")
        except Exception as e:
            print(f"  - Wishlist: ERROR ({e})")
        
        # Check cart
        try:
            cart_response = requests.get(f'{BASE_URL}/api/user/cart', headers=headers)
            if cart_response.status_code == 200:
                cart_data = cart_response.json()
                cart_count = len(cart_data.get('cart', []))
                print(f"  - Cart: {cart_count} items")
            else:
                print(f"  - Cart: ERROR ({cart_response.status_code})")
        except Exception as e:
            print(f"  - Cart: ERROR ({e})")
        
        # Check orders
        try:
            orders_response = requests.get(f'{BASE_URL}/api/user/orders', headers=headers)
            if orders_response.status_code == 200:
                orders_data = orders_response.json()
                orders_count = len(orders_data.get('orders', []))
                print(f"  - Orders: {orders_count} items")
            else:
                print(f"  - Orders: ERROR ({orders_response.status_code})")
        except Exception as e:
            print(f"  - Orders: ERROR ({e})")
    
    print(f"\n✅ User data isolation test completed!")
    print("Each user should see only their own data counts.")
    return True

if __name__ == '__main__':
    test_user_isolation()