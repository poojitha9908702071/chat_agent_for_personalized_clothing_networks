#!/usr/bin/env python3
"""
Test script to verify backend endpoints are working
"""
import requests
import json

API_BASE = 'http://localhost:5000/api'

def test_endpoint(method, endpoint, data=None):
    """Test a single endpoint"""
    url = f"{API_BASE}{endpoint}"
    print(f"\n🔄 Testing {method} {url}")
    
    try:
        if method == 'GET':
            response = requests.get(url, timeout=5)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=5)
        
        print(f"📡 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success: {result.get('success', 'N/A')}")
            if 'count' in result:
                print(f"📦 Count: {result['count']}")
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Backend server not running on port 5000")
    except requests.exceptions.Timeout:
        print("❌ Timeout: Request took too long")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("🚀 Testing Backend API Endpoints")
    print("=" * 50)
    
    # Test basic product search (the one that was missing route)
    test_endpoint('GET', '/products/search?query=shirts&category=fashion')
    
    # Test natural language search
    test_endpoint('POST', '/products/search-natural', {
        'query': 'blue shirts for men under 2000'
    })
    
    # Test category endpoint
    test_endpoint('GET', '/products/category/fashion?limit=5')
    
    # Test cache count
    test_endpoint('GET', '/cache/count')
    
    print("\n" + "=" * 50)
    print("🏁 Backend endpoint testing complete")

if __name__ == "__main__":
    main()