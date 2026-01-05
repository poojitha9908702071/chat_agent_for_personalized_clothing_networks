#!/usr/bin/env python3
"""
Test AIChatBox API endpoints to ensure all functionality is working
"""
import requests
import json

API_BASE = 'http://localhost:5000/api'

def test_aichatbox_endpoints():
    print('🤖 Testing AIChatBox API Endpoints')
    print('=' * 50)
    
    # Test 1: Basic product search (was causing 404)
    try:
        response = requests.get(f'{API_BASE}/products/search?query=clothing&category=fashion')
        if response.status_code == 200:
            data = response.json()
            print(f'✅ Basic Search: {data.get("count", 0)} products')
        else:
            print(f'❌ Basic Search: {response.status_code}')
    except Exception as e:
        print(f'❌ Basic Search: {e}')
    
    # Test 2: Natural language search
    try:
        response = requests.post(f'{API_BASE}/products/search-natural', 
                               json={'query': 'blue shirts for men under 2000'})
        if response.status_code == 200:
            data = response.json()
            print(f'✅ Natural Language: {data.get("count", 0)} products')
            print(f'   Filters: {data.get("filters_applied", {})}')
        else:
            print(f'❌ Natural Language: {response.status_code}')
    except Exception as e:
        print(f'❌ Natural Language: {e}')
    
    # Test 3: Follow-up query
    try:
        response = requests.post(f'{API_BASE}/products/search-natural', 
                               json={
                                   'query': 'show under 1500',
                                   'override_filters': {
                                       'gender': 'Men',
                                       'product_category': 'shirts',
                                       'price_max': 1500
                                   }
                               })
        if response.status_code == 200:
            data = response.json()
            print(f'✅ Follow-up Query: {data.get("count", 0)} products')
        else:
            print(f'❌ Follow-up Query: {response.status_code}')
    except Exception as e:
        print(f'❌ Follow-up Query: {e}')
    
    # Test 4: Product details
    try:
        # Get a product ID first
        search_response = requests.get(f'{API_BASE}/products/search?query=clothing&category=fashion')
        if search_response.status_code == 200:
            search_data = search_response.json()
            if search_data.get('products'):
                product_id = search_data['products'][0]['product_id']
                detail_response = requests.get(f'{API_BASE}/products/{product_id}')
                if detail_response.status_code == 200:
                    detail_data = detail_response.json()
                    product_name = detail_data['product']['title']
                    print(f'✅ Product Details: {product_name} (ID: {product_id})')
                else:
                    print(f'❌ Product Details: {detail_response.status_code}')
            else:
                print('❌ Product Details: No products to test')
        else:
            print('❌ Product Details: Search failed')
    except Exception as e:
        print(f'❌ Product Details: {e}')
    
    # Test 5: Category search
    try:
        response = requests.get(f'{API_BASE}/products/category/fashion?limit=5')
        if response.status_code == 200:
            data = response.json()
            print(f'✅ Category Search: {data.get("count", 0)} products')
        else:
            print(f'❌ Category Search: {response.status_code}')
    except Exception as e:
        print(f'❌ Category Search: {e}')
    
    print('=' * 50)
    print('🎉 AIChatBox endpoint testing complete!')
    print()
    print('📋 Summary:')
    print('   All these endpoints are used by the AIChatBox component:')
    print('   • Basic Search - General product queries')
    print('   • Natural Language - Smart product search with filters')
    print('   • Follow-up Query - Context-aware price/filter updates')
    print('   • Product Details - Cart/wishlist item details')
    print('   • Category Search - Face Tone/Body Fit flows')

if __name__ == "__main__":
    test_aichatbox_endpoints()