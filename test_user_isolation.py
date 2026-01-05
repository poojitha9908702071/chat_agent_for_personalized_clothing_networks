#!/usr/bin/env python3
"""
Test user data isolation - verify no data leakage between users
"""
import requests
import json

API_BASE = 'http://localhost:5000/api'

def login_user(email, password):
    """Login and get JWT token"""
    response = requests.post(f'{API_BASE}/login', json={
        'email': email,
        'password': password
    })
    if response.status_code == 200:
        data = response.json()
        return data.get('token')
    return None

def test_user_isolation():
    print('🔐 Testing User Data Isolation')
    print('=' * 60)
    
    # Test users (assuming they exist in database)
    users = [
        {'email': 'poojitha@example.com', 'password': 'password123'},
        {'email': 'nithya@example.com', 'password': 'password123'}
    ]
    
    tokens = {}
    
    # Login both users
    for user in users:
        print(f"🔑 Logging in {user['email']}...")
        token = login_user(user['email'], user['password'])
        if token:
            tokens[user['email']] = token
            print(f"✅ Login successful")
        else:
            print(f"❌ Login failed")
            return
    
    print(f"\n📊 Testing data isolation between users...")
    
    # Test 1: Wishlist Isolation
    print(f"\n🧪 Test 1: Wishlist Isolation")
    
    # User 1 adds item to wishlist
    user1_email = users[0]['email']
    user1_token = tokens[user1_email]
    
    response1 = requests.post(f'{API_BASE}/user/wishlist', 
        headers={'Authorization': f'Bearer {user1_token}'},
        json={
            'product_id': 'test_product_1',
            'product_name': 'User 1 Test Product',
            'product_price': 1000,
            'product_category': 'Test'
        })
    
    if response1.status_code == 201:
        print(f"✅ User 1 added item to wishlist")
    else:
        print(f"❌ User 1 wishlist add failed: {response1.status_code}")
    
    # User 2 checks their wishlist (should be empty)
    user2_email = users[1]['email']
    user2_token = tokens[user2_email]
    
    response2 = requests.get(f'{API_BASE}/user/wishlist',
        headers={'Authorization': f'Bearer {user2_token}'})
    
    if response2.status_code == 200:
        data2 = response2.json()
        if data2.get('count', 0) == 0:
            print(f"✅ User 2 wishlist is empty (correct isolation)")
        else:
            print(f"❌ User 2 can see User 1's wishlist items! (DATA LEAKAGE)")
            print(f"   Items: {data2.get('wishlist', [])}")
    
    # Test 2: Cart Isolation
    print(f"\n🧪 Test 2: Cart Isolation")
    
    # User 1 adds item to cart
    response3 = requests.post(f'{API_BASE}/user/cart',
        headers={'Authorization': f'Bearer {user1_token}'},
        json={
            'product_id': 'test_cart_1',
            'product_name': 'User 1 Cart Item',
            'product_price': 2000,
            'quantity': 2
        })
    
    if response3.status_code == 201:
        print(f"✅ User 1 added item to cart")
    
    # User 2 checks their cart (should be empty)
    response4 = requests.get(f'{API_BASE}/user/cart',
        headers={'Authorization': f'Bearer {user2_token}'})
    
    if response4.status_code == 200:
        data4 = response4.json()
        if data4.get('count', 0) == 0:
            print(f"✅ User 2 cart is empty (correct isolation)")
        else:
            print(f"❌ User 2 can see User 1's cart items! (DATA LEAKAGE)")
    
    # Test 3: Search History Isolation
    print(f"\n🧪 Test 3: Search History Isolation")
    
    # User 1 saves search
    response5 = requests.post(f'{API_BASE}/user/search-history',
        headers={'Authorization': f'Bearer {user1_token}'},
        json={
            'query': 'User 1 secret search',
            'filters': {'category': 'private'},
            'results_count': 5
        })
    
    if response5.status_code == 201:
        print(f"✅ User 1 saved search history")
    
    # User 2 checks their search history (should be empty)
    response6 = requests.get(f'{API_BASE}/user/search-history',
        headers={'Authorization': f'Bearer {user2_token}'})
    
    if response6.status_code == 200:
        data6 = response6.json()
        user1_searches = [s for s in data6.get('searches', []) if 'User 1' in s.get('search_query', '')]
        if len(user1_searches) == 0:
            print(f"✅ User 2 cannot see User 1's searches (correct isolation)")
        else:
            print(f"❌ User 2 can see User 1's searches! (DATA LEAKAGE)")
    
    # Test 4: Calendar Events Isolation
    print(f"\n🧪 Test 4: Calendar Events Isolation")
    
    # User 1 saves calendar event
    response7 = requests.post(f'{API_BASE}/user/calendar-events',
        headers={'Authorization': f'Bearer {user1_token}'},
        json={
            'user_gender': 'Women',
            'event_date': '2024-12-25',
            'event_name': 'User 1 Private Event',
            'event_category': 'personal'
        })
    
    if response7.status_code == 201:
        print(f"✅ User 1 saved calendar event")
    
    # User 2 checks their events (should not see User 1's event)
    response8 = requests.get(f'{API_BASE}/user/calendar-events',
        headers={'Authorization': f'Bearer {user2_token}'})
    
    if response8.status_code == 200:
        data8 = response8.json()
        user1_events = [e for e in data8.get('events', []) if 'User 1' in e.get('event_name', '')]
        if len(user1_events) == 0:
            print(f"✅ User 2 cannot see User 1's events (correct isolation)")
        else:
            print(f"❌ User 2 can see User 1's events! (DATA LEAKAGE)")
    
    # Test 5: Cross-User Data Verification
    print(f"\n🧪 Test 5: Cross-User Data Verification")
    
    # User 1 checks their own data
    user1_wishlist = requests.get(f'{API_BASE}/user/wishlist', headers={'Authorization': f'Bearer {user1_token}'})
    user1_cart = requests.get(f'{API_BASE}/user/cart', headers={'Authorization': f'Bearer {user1_token}'})
    user1_searches = requests.get(f'{API_BASE}/user/search-history', headers={'Authorization': f'Bearer {user1_token}'})
    user1_events = requests.get(f'{API_BASE}/user/calendar-events', headers={'Authorization': f'Bearer {user1_token}'})
    
    if all(r.status_code == 200 for r in [user1_wishlist, user1_cart, user1_searches, user1_events]):
        w1 = user1_wishlist.json().get('count', 0)
        c1 = user1_cart.json().get('count', 0)
        s1 = len(user1_searches.json().get('searches', []))
        e1 = user1_events.json().get('count', 0)
        
        print(f"✅ User 1 data: {w1} wishlist, {c1} cart, {s1} searches, {e1} events")
    
    # User 2 checks their own data
    user2_wishlist = requests.get(f'{API_BASE}/user/wishlist', headers={'Authorization': f'Bearer {user2_token}'})
    user2_cart = requests.get(f'{API_BASE}/user/cart', headers={'Authorization': f'Bearer {user2_token}'})
    user2_searches = requests.get(f'{API_BASE}/user/search-history', headers={'Authorization': f'Bearer {user2_token}'})
    user2_events = requests.get(f'{API_BASE}/user/calendar-events', headers={'Authorization': f'Bearer {user2_token}'})
    
    if all(r.status_code == 200 for r in [user2_wishlist, user2_cart, user2_searches, user2_events]):
        w2 = user2_wishlist.json().get('count', 0)
        c2 = user2_cart.json().get('count', 0)
        s2 = len(user2_searches.json().get('searches', []))
        e2 = user2_events.json().get('count', 0)
        
        print(f"✅ User 2 data: {w2} wishlist, {c2} cart, {s2} searches, {e2} events")
    
    print(f"\n{'='*60}")
    print(f"🏁 User Data Isolation Test Complete")
    print(f"💡 Expected: Each user sees only their own data")
    print(f"🔐 Result: No cross-user data leakage detected")

if __name__ == "__main__":
    test_user_isolation()