#!/usr/bin/env python3
"""
Check Database Users
Verify what users exist and their password format
"""

from db import execute_query
import hashlib

def check_users():
    """Check existing users in database"""
    
    print("🔍 CHECKING DATABASE USERS")
    print("=" * 50)
    
    try:
        # Get all users
        users = execute_query(
            "SELECT id, name, email, password FROM users ORDER BY id",
            fetch=True
        )
        
        if users:
            print(f"\n👥 Found {len(users)} users:")
            for user in users:
                print(f"\n📧 Email: {user['email']}")
                print(f"👤 Name: {user['name']}")
                print(f"🆔 ID: {user['id']}")
                print(f"🔐 Password Hash: {user['password'][:20]}...")
                
                # Test if password is SHA-256 hashed
                test_password = 'password123'
                sha256_hash = hashlib.sha256(test_password.encode()).hexdigest()
                
                if user['password'] == sha256_hash:
                    print(f"✅ Password matches SHA-256 hash of 'password123'")
                else:
                    print(f"❌ Password does not match SHA-256 hash of 'password123'")
                    # Try other common passwords
                    for pwd in ['123456', 'admin', 'test', user['name'].lower()]:
                        test_hash = hashlib.sha256(pwd.encode()).hexdigest()
                        if user['password'] == test_hash:
                            print(f"✅ Password matches SHA-256 hash of '{pwd}'")
                            break
        else:
            print("❌ No users found in database")
            
    except Exception as e:
        print(f"❌ Database error: {e}")

if __name__ == "__main__":
    check_users()