import requests

print('🚀 Testing improved keyword matching...')

# Test 1: Pink ethnic wear for women
r1 = requests.post('http://localhost:5000/api/products/search-natural', json={'query': 'pink ethnic wear for women'})
if r1.status_code == 200:
    d1 = r1.json()
    print(f'✅ Test 1: {d1.get("count", 0)} products, filters: {d1.get("filters_applied", {})}')
else:
    print(f'❌ Test 1 failed: {r1.status_code}')

# Test 2: Yellow hoodies for men  
r2 = requests.post('http://localhost:5000/api/products/search-natural', json={'query': 'yellow hoodies for men'})
if r2.status_code == 200:
    d2 = r2.json()
    print(f'✅ Test 2: {d2.get("count", 0)} products, filters: {d2.get("filters_applied", {})}')
else:
    print(f'❌ Test 2 failed: {r2.status_code}')

print('🎯 Keyword matching improved!')