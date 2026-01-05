import requests

print("🔍 Debugging 'bottom wear for men' query...")

r = requests.post('http://localhost:5000/api/products/search-natural', json={'query': 'show me bottom wear for men'})
if r.status_code == 200:
    d = r.json()
    print('Query: show me bottom wear for men')
    print(f'Filters: {d.get("filters_applied", {})}')
    print(f'Count: {d.get("count", 0)}')
    if d.get('products'):
        for i, p in enumerate(d['products'][:3], 1):
            print(f'{i}. {p.get("title", "N/A")} - {p.get("category", "N/A")} - {p.get("gender", "N/A")}')
else:
    print(f'Error: {r.status_code} - {r.text}')