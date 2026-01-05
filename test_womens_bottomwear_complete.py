#!/usr/bin/env python3
"""
Complete Women's Bottomwear Test
Tests database connection, API endpoints, and product display
"""

import requests
import mysql.connector
import json

def test_database_connection():
    """Test direct database connection"""
    print("🔍 Testing Database Connection...")
    print("=" * 50)
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='fashiopulse'
        )
        cursor = conn.cursor()
        
        # Get women's bottomwear products
        query = """
        SELECT product_id, product_name, product_category, gender, price, color, size
        FROM clothing 
        WHERE gender = 'Women' AND product_category LIKE '%bottom%'
        LIMIT 10
        """
        
        cursor.execute(query)
        products = cursor.fetchall()
        
        print(f"✅ Database Connection: SUCCESS")
        print(f"✅ Women's Bottomwear Products Found: {len(products)}")
        
        if products:
            print("\n📦 Sample Products:")
            for i, product in enumerate(products, 1):
                print(f"{i}. ID: {product[0]} - {product[1]} (₹{product[4]})")
                print(f"   Category: {product[2]} | Gender: {product[3]} | Color: {product[5]} | Size: {product[6]}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Database Connection Failed: {e}")
        return False

def test_backend_api():
    """Test backend API endpoints"""
    print("\n🔗 Testing Backend API...")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    
    # Test 1: Category API
    try:
        url = f"{base_url}/api/products/category/bottomwear?gender=Women&limit=10"
        print(f"Testing: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Category API: SUCCESS")
            print(f"   Products Count: {data.get('count', 0)}")
            print(f"   Success Status: {data.get('success', False)}")
            
            if data.get('products'):
                print(f"   Sample Product: {data['products'][0]['title']}")
        else:
            print(f"❌ Category API Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Category API Error: {e}")
    
    # Test 2: Search API
    try:
        url = f"{base_url}/api/products/search?query=women%20pants&category=fashion"
        print(f"\nTesting: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Search API: SUCCESS")
            print(f"   Products Count: {data.get('count', 0)}")
            
            if data.get('products'):
                print(f"   Sample Product: {data['products'][0]['title']}")
        else:
            print(f"❌ Search API Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Search API Error: {e}")

def test_frontend_api_call():
    """Test the exact API call that frontend makes"""
    print("\n🌐 Testing Frontend API Call...")
    print("=" * 50)
    
    try:
        # This is the exact call the frontend should make
        url = "http://localhost:5000/api/products/category/Women's%20Bottomwear?gender=Women&limit=50"
        print(f"Frontend API Call: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Frontend API Call: SUCCESS")
            print(f"   Products Count: {data.get('count', 0)}")
            print(f"   Success Status: {data.get('success', False)}")
            
            if data.get('products') and len(data['products']) > 0:
                print(f"\n📦 First 3 Products:")
                for i, product in enumerate(data['products'][:3], 1):
                    print(f"{i}. {product['title']} - ₹{product['price']}")
                    print(f"   Category: {product['category']} | Gender: {product['gender']}")
                    print(f"   Image: {product.get('image_url', 'No image')[:50]}...")
                return True
            else:
                print("❌ No products in response")
                return False
        else:
            print(f"❌ Frontend API Call Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Frontend API Call Error: {e}")
        return False

def main():
    print("🧪 COMPLETE WOMEN'S BOTTOMWEAR TEST")
    print("=" * 60)
    
    # Test 1: Database
    db_success = test_database_connection()
    
    # Test 2: Backend API
    test_backend_api()
    
    # Test 3: Frontend API Call
    frontend_success = test_frontend_api_call()
    
    # Summary
    print("\n📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Database Connection: {'✅ PASS' if db_success else '❌ FAIL'}")
    print(f"Frontend API Call: {'✅ PASS' if frontend_success else '❌ FAIL'}")
    
    if db_success and frontend_success:
        print("\n🎉 ALL TESTS PASSED!")
        print("Women's bottomwear products should be visible in frontend")
    else:
        print("\n⚠️ SOME TESTS FAILED!")
        print("Check the errors above to fix the issues")

if __name__ == '__main__':
    main()