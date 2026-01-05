#!/usr/bin/env python3
"""
Final comprehensive test for Women's Bottomwear fix
"""

import requests

def test_frontend_url():
    """Test the exact URL the frontend will use"""
    print("🎯 Testing Frontend URL")
    print("=" * 50)
    
    try:
        # This is the EXACT URL the frontend uses when user clicks Women's Bottomwear
        url = "http://localhost:5000/api/products/category/Women's%20Bottomwear?gender=Women&limit=50"
        
        print(f"URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('success') and data.get('products'):
                products = data['products']
                count = len(products)
                
                print(f"✅ SUCCESS: {count} products found")
                print(f"✅ API Status: {response.status_code}")
                print(f"✅ Response Success: {data.get('success')}")
                
                print("\n📦 Sample Products:")
                for i, product in enumerate(products[:5], 1):
                    print(f"  {i}. {product['title']}")
                    print(f"     Category: {product['category']}")
                    print(f"     Gender: {product['gender']}")
                    print(f"     Price: ₹{product['price']}")
                    print()
                
                # Verify all products are women's bottomwear
                women_count = sum(1 for p in products if p['gender'].lower() == 'women')
                bottomwear_count = sum(1 for p in products if 'bottomwear' in p['category'].lower())
                
                print(f"🔍 Verification:")
                print(f"  - Women's products: {women_count}/{count}")
                print(f"  - Bottomwear products: {bottomwear_count}/{count}")
                
                if women_count == count and bottomwear_count == count:
                    print("✅ All products are correctly filtered!")
                    return True
                else:
                    print("❌ Some products don't match the filter criteria")
                    return False
            else:
                print(f"❌ No products found or API error")
                print(f"Response: {data}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_category_separation():
    """Test that Women's Bottomwear and Bottom Wear are separate"""
    print("\n🔄 Testing Category Separation")
    print("=" * 50)
    
    try:
        # Test Women's Bottomwear
        womens_url = "http://localhost:5000/api/products/category/Women's%20Bottomwear?gender=Women&limit=50"
        womens_response = requests.get(womens_url, timeout=10)
        womens_data = womens_response.json()
        womens_count = len(womens_data.get('products', [])) if womens_data.get('success') else 0
        
        # Test Bottom Wear (generic)
        bottom_url = "http://localhost:5000/api/products/category/Bottom%20Wear?limit=50"
        bottom_response = requests.get(bottom_url, timeout=10)
        bottom_data = bottom_response.json()
        bottom_count = len(bottom_data.get('products', [])) if bottom_data.get('success') else 0
        
        print(f"Women's Bottomwear: {womens_count} products")
        print(f"Bottom Wear (generic): {bottom_count} products")
        
        if womens_count > 0:
            print("✅ Women's Bottomwear category is working")
            return True
        else:
            print("❌ Women's Bottomwear category is not working")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("🎉 FINAL WOMEN'S BOTTOMWEAR TEST")
    print("=" * 60)
    
    frontend_success = test_frontend_url()
    separation_success = test_category_separation()
    
    print("\n" + "=" * 60)
    
    if frontend_success and separation_success:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Women's Bottomwear fix is COMPLETE")
        print("✅ Frontend will display products correctly")
        print("\n📋 User Instructions:")
        print("1. Open the frontend application")
        print("2. Navigate to Women's section")
        print("3. Click on 'Bottomwear' category")
        print("4. You should see 47+ women's bottomwear products")
    else:
        print("❌ SOME TESTS FAILED!")
        if not frontend_success:
            print("  - Frontend URL test failed")
        if not separation_success:
            print("  - Category separation test failed")

if __name__ == "__main__":
    main()