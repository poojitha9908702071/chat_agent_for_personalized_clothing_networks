#!/usr/bin/env python3
"""
Comprehensive test for all category and keyword combinations
"""
import requests

API_BASE = 'http://localhost:5000/api'

def test_category_detection():
    print('🎯 Testing ALL Category Detection')
    print('=' * 60)
    
    test_cases = [
        # Men's categories
        {'query': 'show me shirts for men', 'expected_category': 'Shirts', 'expected_gender': 'Men'},
        {'query': 'men t-shirts', 'expected_category': 'T-shirts', 'expected_gender': 'Men'},
        {'query': 'bottom wear for men', 'expected_category': 'Bottom Wear', 'expected_gender': 'Men'},
        {'query': 'hoodies for men', 'expected_category': 'Hoodies', 'expected_gender': 'Men'},
        
        # Women's categories
        {'query': 'dresses for women', 'expected_category': 'Dresses', 'expected_gender': 'Women'},
        {'query': 'ethnic wear for women', 'expected_category': 'Ethnic Wear', 'expected_gender': 'Women'},
        {'query': 'western wear for women', 'expected_category': 'Western Wear', 'expected_gender': 'Women'},
        {'query': 'tops for women', 'expected_category': 'Tops and Co-ord Sets', 'expected_gender': 'Women'},
        
        # Color + Category combinations
        {'query': 'blue shirts for men', 'expected_category': 'Shirts', 'expected_gender': 'Men', 'expected_color': 'Blue'},
        {'query': 'red dresses for women', 'expected_category': 'Dresses', 'expected_gender': 'Women', 'expected_color': 'Red'},
        {'query': 'black bottom wear for men', 'expected_category': 'Bottom Wear', 'expected_gender': 'Men', 'expected_color': 'Black'},
    ]
    
    passed = 0
    total = len(test_cases)
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: '{test['query']}'")
        
        try:
            response = requests.post(f'{API_BASE}/products/search-natural', json={'query': test['query']})
            
            if response.status_code == 200:
                data = response.json()
                filters = data.get('filters_applied', {})
                count = data.get('count', 0)
                
                # Check results
                success = True
                issues = []
                
                if filters.get('product_category') != test['expected_category']:
                    success = False
                    issues.append(f"Category: expected '{test['expected_category']}', got '{filters.get('product_category')}'")
                
                if filters.get('gender') != test['expected_gender']:
                    success = False
                    issues.append(f"Gender: expected '{test['expected_gender']}', got '{filters.get('gender')}'")
                
                if 'expected_color' in test and filters.get('color') != test['expected_color']:
                    success = False
                    issues.append(f"Color: expected '{test['expected_color']}', got '{filters.get('color')}'")
                
                if success:
                    print(f"✅ PASS - {count} products found")
                    print(f"   Filters: {filters}")
                    passed += 1
                else:
                    print(f"❌ FAIL - Issues: {', '.join(issues)}")
                    print(f"   Expected: category={test['expected_category']}, gender={test['expected_gender']}")
                    print(f"   Got: {filters}")
            else:
                print(f"❌ FAIL - HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ ERROR - {e}")
    
    print(f"\n{'='*60}")
    print(f"🏁 Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Keyword matching is working perfectly!")
    else:
        print(f"⚠️  {total-passed} tests failed. Need to improve keyword detection.")

if __name__ == "__main__":
    test_category_detection()