#!/usr/bin/env python3
"""
Test script to verify login connection with FashioPulse database
"""

import requests
import json
import hashlib

# Backend URL
BASE_URL = "http://localhost:5000"

def test_login_with_existing_user():
    """Test login with existing user from database"""
    print("🔐 Testing Login Connection with FashioPulse Database")
    print("=" * 60)
    
    # Test with existing user from database
    test_users = [
        {
            "email": "aggarapupoojitha@gmail.com",
            "password": "test123",  # We'll try this plain text password
            "name": "Poojitha Aggarapu"
        },
        {
            "email": "nithyasree@gmail.com", 
            "password": "test123",
            "name": "nithya sree"
        },
        {
            "email": "sunitha@gmail.com",
            "password": "test123", 
            "name": "sunitha"
        }
    ]
    
    for user in test_users:
        print(f"\n📧 Testing login for: {user['email']}")
        
        # Test login
        login_data = {
            "email": user["email"],
            "password": user["password"]
        }
        
        try:
            response = requests.post(f"{BASE_URL}/api/login", json=login_data)
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Login Successful!")
                print(f"User: {result['user']['name']}")
                print(f"Email: {result['user']['email']}")
                print(f"Token: {result['token'][:50]}...")
                return True
            else:
                result = response.json()
                print(f"❌ Login Failed: {result.get('error', 'Unknown error')}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Backend server not running on port 5000")
            return False
        except Exception as e:
            print(f"❌ Error: {e}")
    
    return False

def test_signup_new_user():
    """Test signup with new user"""
    print(f"\n👤 Testing Signup with New User")
    print("-" * 40)
    
    signup_data = {
        "name": "Test User",
        "email": "testuser@example.com",
        "password": "test123456"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/signup", json=signup_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Signup Successful!")
            print(f"User ID: {result['user']['id']}")
            print(f"Name: {result['user']['name']}")
            print(f"Email: {result['user']['email']}")
            print(f"Token: {result['token'][:50]}...")
            
            # Now test login with new user
            print(f"\n🔄 Testing login with new user...")
            login_data = {
                "email": signup_data["email"],
                "password": signup_data["password"]
            }
            
            login_response = requests.post(f"{BASE_URL}/api/login", json=login_data)
            if login_response.status_code == 200:
                print("✅ Login with new user successful!")
                return True
            else:
                print("❌ Login with new user failed")
                
        else:
            result = response.json()
            print(f"❌ Signup Failed: {result.get('error', 'Unknown error')}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Backend server not running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return False

def test_password_hashing():
    """Test password hashing to understand database format"""
    print(f"\n🔐 Testing Password Hashing")
    print("-" * 40)
    
    test_password = "test123"
    hashed = hashlib.sha256(test_password.encode()).hexdigest()
    
    print(f"Plain text: {test_password}")
    print(f"SHA-256 hash: {hashed}")
    
    # Check if this matches any hash in database
    known_hashes = [
        "047dd0995531994f199d9d60a5808c27d135e1b205919f2564414462f11f51be",  # Poojitha
        "5d4075ac9b6ff3c51a9d7fad9cf848db3418053ee97cd7a810678b171d432904",  # nithya sree  
        "b8340386c7762f8c41ee28172e38e50ce30fe8f70f4a2681754aa1d04c9bd0cb"   # sunitha
    ]
    
    if hashed in known_hashes:
        print(f"✅ Hash matches a user in database!")
    else:
        print(f"❌ Hash doesn't match any user in database")
        print("Trying common passwords...")
        
        common_passwords = ["password", "123456", "admin", "user", "test", "poojitha", "nithya", "sunitha"]
        for pwd in common_passwords:
            test_hash = hashlib.sha256(pwd.encode()).hexdigest()
            if test_hash in known_hashes:
                print(f"✅ Found match! Password '{pwd}' matches hash in database")
                return pwd
    
    return None

def main():
    print("🚀 FashioPulse Login System Test")
    print("=" * 60)
    
    # First, test password hashing to find correct passwords
    correct_password = test_password_hashing()
    
    # Test login with existing users
    login_success = test_login_with_existing_user()
    
    # Test signup with new user
    signup_success = test_signup_new_user()
    
    print(f"\n📊 Test Results Summary")
    print("=" * 60)
    print(f"Login Test: {'✅ PASSED' if login_success else '❌ FAILED'}")
    print(f"Signup Test: {'✅ PASSED' if signup_success else '❌ FAILED'}")
    
    if login_success or signup_success:
        print(f"\n🎉 SUCCESS: Login system is working!")
        print(f"Frontend can now connect to backend on port 5000")
        print(f"Users table is properly connected")
    else:
        print(f"\n⚠️  ISSUES FOUND:")
        print(f"1. Make sure backend server is running: python backend/app.py")
        print(f"2. Check database connection in backend/config.py")
        print(f"3. Verify users table exists in fashiopulse database")
        
        if correct_password:
            print(f"4. Try logging in with password: '{correct_password}'")

if __name__ == "__main__":
    main()