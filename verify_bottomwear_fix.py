#!/usr/bin/env python3
"""
Final verification that women's bottomwear is working
"""

import requests
import json

def main():
    print("🔍 FINAL WOMEN'S BOTTOMWEAR VERIFICATION")
    print("=" * 60)
    
    # Test the exact API calls the frontend makes
    endpoints_to_test = [
        {
            'name': 'Women\'s Bottomwear (Full)',
            'url': 'http://localhost:5000/api/products/category/Women\'s%20Bottomwear?gender=Women&limit=50'
        },
        {
            'name': 'Bottomwear (Short)',
            'url': 'http://localhost:5000/api/products/category/bottomwear?gender=Women&limit=20'
        },
        {
            'name': 'Search Women Pants',
            'url': 'http://localhost:5000/api/products/search?query=women%20pants&category=fashion'
        }
    ]
    
    all_passed = True
    
    for endpoint in endpoints_to_test:
        print(f"\n🧪 Testing: {endpoint['name']}")
        print("-" * 40)
        
        try:
            response = requests.get(endpoint['url'], timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                count = data.get('count', 0)
                success = data.get('success', False)
                
                if success and count > 0:
                    print(f"✅ SUCCESS: {count} products found")
                    
                    # Show sample products
                    products = data.get('products', [])
                    if products:
                        print(f"📦 Sample products:")
                        for i, product in enumerate(products[:3], 1):
                            print(f"  {i}. {product['title']} - ₹{product['price']}")
                else:
                    print(f"❌ FAILED: No products found (count: {count}, success: {success})")
                    all_passed = False
            else:
                print(f"❌ FAILED: HTTP {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print(f"❌ ERROR: {e}")
            all_passed = False
    
    # Final summary
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Women's bottomwear products are working correctly")
        print("✅ Frontend should now display products properly")
        print("\n📋 Next Steps:")
        print("1. Refresh the frontend page (Ctrl+F5 to clear cache)")
        print("2. Navigate to Women's section")
        print("3. Click on 'Bottomwear' category")
        print("4. You should see 47+ women's bottomwear products")
    else:
        print("❌ SOME TESTS FAILED!")
        print("Check the errors above and fix any issues")

if __name__ == '__main__':
    main()