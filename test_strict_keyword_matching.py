#!/usr/bin/env python3
"""
Test script to verify strict keyword matching in natural language search
"""
import requests
import json

API_BASE = 'http://localhost:5000/api'

def test_keyword_matching():
    print('🎯 Testing STRICT Keyword Matching')
    print('=' * 60)
    
    # Test cases with expected behavior
    test_cases = [
        {
            'query': 'pink ethnic wear for women',
            'expected_filters': {
                'gender': 'Women',
                'product_category': 'Ethnic Wear',
                'color': 'Pink'
            },
            'description': 'Should find ONLY pink ethnic wear for women'
        },
        {
            'query': 'yellow hoodies for men',
            'expected_filters': {
                'gender': 'Men',
                'product_category': 'Hoodies',
                'color': 'Yellow'
            },
            'description': 'Should find ONLY yellow hoodies for men'
        },
        {
            'query': 'blue shirts for men',
            'expected_filters': {
                'gender': 'Men',
                'product_category': 'Shirts',
                'color': 'Blue'
            },
            'description': 'Should find ONLY blue shirts for men'
        },
        {
            'query': 'red dresses for women',
            'expected_filters': {
                'gender': 'Women',
                'product_category': 'Dresses',
                'color': 'Red'
            },
            'description': 'Should find ONLY red dresses for women'
        },
        {
            'query': 'black t-shirts for men',
            'expected_filters': {
                'gender': 'Men',
                'product_category': 'T-shirts',
                'color': 'Black'
            },
            'description': 'Should find ONLY black t-shirts for men'
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['description']}")
        print(f"Query: '{test_case['query']}'")
        
        try:
            response = requests.post(f'{API_BASE}/products/search-natural', 
                                   json={'query': test_case['query']})
            
            if response.status_code == 200:
                data = response.json()
                filters_applied = data.get('filters_applied', {})
                products = data.get('products', [])
                
                print(f"✅ Status: SUCCESS")
                print(f"📊 Results: {data.get('count', 0)} products found")
                print(f"🔍 Filters Applied: {json.dumps(filters_applied, indent=2)}")
                
                # Verify filters match expectations
                filters_match = True
                for key, expected_value in test_case['expected_filters'].items():
                    if filters_applied.get(key) != expected_value:
                        print(f"❌ Filter Mismatch: Expected {key}='{expected_value}', Got '{filters_applied.get(key)}'")
                        filters_match = False
                
                if filters_match:
                    print(f"✅ Filter Extraction: CORRECT")
                else:
                    print(f"❌ Filter Extraction: INCORRECT")
                
                # Verify products match all criteria
                if products:
                    print(f"\n📦 Sample Products:")
                    for j, product in enumerate(products[:3], 1):
                        print(f"  {j}. {product.get('title', 'N/A')}")
                        print(f"     Gender: {product.get('gender', 'N/A')}")
                        print(f"     Category: {product.get('category', 'N/A')}")
                        print(f"     Color: {product.get('color', 'N/A')}")
                        print(f"     Price: ₹{product.get('price', 'N/A')}")
                        
                        # Verify this product matches ALL criteria
                        matches_all = True
                        if 'gender' in test_case['expected_filters']:
                            if product.get('gender', '').lower() != test_case['expected_filters']['gender'].lower():
                                matches_all = False
                                print(f"     ❌ Gender mismatch!")
                        
                        if 'product_category' in test_case['expected_filters']:
                            expected_cat = test_case['expected_filters']['product_category'].lower()
                            actual_cat = product.get('category', '').lower()
                            if expected_cat not in actual_cat and actual_cat not in expected_cat:
                                matches_all = False
                                print(f"     ❌ Category mismatch!")
                        
                        if 'color' in test_case['expected_filters']:
                            expected_color = test_case['expected_filters']['color'].lower()
                            actual_color = product.get('color', '').lower()
                            if expected_color not in actual_color:
                                matches_all = False
                                print(f"     ❌ Color mismatch!")
                        
                        if matches_all:
                            print(f"     ✅ Perfect match!")
                        print()
                else:
                    print(f"📦 No products found")
                
            else:
                print(f"❌ Status: FAILED ({response.status_code})")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Status: ERROR - {e}")
        
        print("-" * 60)
    
    print(f"\n🏁 Keyword matching test complete!")
    print(f"💡 Expected behavior:")
    print(f"   • Each query should extract the correct filters")
    print(f"   • Products should match ALL specified criteria")
    print(f"   • No irrelevant products should be returned")

if __name__ == "__main__":
    test_keyword_matching()