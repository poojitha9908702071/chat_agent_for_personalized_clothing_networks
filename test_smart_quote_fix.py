#!/usr/bin/env python3
"""
Test the smart quote fix for Women's Bottomwear category
"""

import requests
import mysql.connector

def test_database_direct():
    """Test database query directly"""
    print("🔍 Testing database query directly...")
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='fashiopulse'
        )
        cursor = conn.cursor(dictionary=True)
        
        # Test the exact query the backend should now run
        query = """
        SELECT product_id, product_name, product_category, gender, price
        FROM clothing 
        WHERE (LOWER(product_category) = %s OR LOWER(product_category) = %s) AND LOWER(gender) = %s
        LIMIT 5
        """
        
        # Test with both smart quote and regular apostrophe
        smart_quote_category = f"women{chr(8217)}s bottomwear"  # women's bottomwear with smart quote
        regular_quote_category = "women's bottomwear"  # women's bottomwear with regular apostrophe
        params = (smart_quote_category, regular_quote_category, "women")
        
        print(f"Query: {query}")
        print(f"Params: {params}")
        
        cursor.execute(query, params)
        products = cursor.fetchall()
        
        print(f"✅ Found {len(products)} products")
        
        if products:
            print("\nSample products:")
            for product in products[:3]:
                print(f"  - {product['product_name']} | {product['product_category']} | {product['gender']}")
        
        cursor.close()
        conn.close()
        
        return len(products) > 0
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        return False

def test_api_endpoint():
    """Test the API endpoint"""
    print("\n🌐 Testing API endpoint...")
    
    try:
        # Test the exact URL the frontend uses
        url = "http://localhost:5000/api/products/category/Women's%20Bottomwear?gender=Women&limit=10"
        
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('products', [])
            
            print(f"✅ API Response: {response.status_code}")
            print(f"✅ Products found: {len(products)}")
            
            if products:
                print("\nSample API products:")
                for product in products[:3]:
                    print(f"  - {product['title']} | {product['category']} | {product['gender']}")
            
            return len(products) > 0
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False

def main():
    print("🧪 SMART QUOTE FIX VERIFICATION")
    print("=" * 50)
    
    db_success = test_database_direct()
    api_success = test_api_endpoint()
    
    print("\n" + "=" * 50)
    
    if db_success and api_success:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Smart quote issue is FIXED")
        print("✅ Women's Bottomwear products should now display correctly")
    else:
        print("❌ SOME TESTS FAILED!")
        if not db_success:
            print("  - Database query failed")
        if not api_success:
            print("  - API endpoint failed")

if __name__ == "__main__":
    main()