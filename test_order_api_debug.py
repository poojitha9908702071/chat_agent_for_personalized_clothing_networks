#!/usr/bin/env python3

import requests
import json

def test_order_api():
    """Test the order API endpoint to see if it's working correctly"""
    
    print("🧪 TESTING ORDER API ENDPOINT")
    print("=" * 40)
    
    # Test without authentication (should fail)
    print("\n1️⃣ Testing without authentication...")
    try:
        response = requests.get('http://localhost:5000/api/user/orders')
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test with mock JWT token (for testing purposes)
    print("\n2️⃣ Testing with mock authentication...")
    
    # Create a simple JWT token for sunitha@gmail.com (for testing)
    import jwt
    from datetime import datetime, timedelta
    
    # Mock JWT secret (should match backend)
    JWT_SECRET = "your_jwt_secret_key_here"  # This should match backend config
    
    payload = {
        'user_id': 1,
        'email': 'sunitha@gmail.com',
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    
    try:
        token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
        print(f"Generated token: {token[:50]}...")
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get('http://localhost:5000/api/user/orders', headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
    except Exception as e:
        print(f"❌ JWT Error: {e}")
        
        # Try with a simple test - direct API call
        print("\n3️⃣ Testing direct API call...")
        try:
            response = requests.get('http://localhost:5000/api/user/orders')
            print(f"Status: {response.status_code}")
            if response.status_code == 401:
                print("✅ API correctly requires authentication")
            else:
                print(f"Response: {response.text}")
        except Exception as e:
            print(f"❌ API Error: {e}")

if __name__ == "__main__":
    test_order_api()