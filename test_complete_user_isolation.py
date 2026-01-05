#!/usr/bin/env python3
"""
Complete User Data Isolation Test Suite
Tests all user-specific features for complete data separation
"""

import requests
import json
from datetime import datetime, timedelta

# Test configuration
BASE_URL = 'http://localhost:5000'
TEST_USERS = [
    {'email': 'poojitha@example.com', 'password': 'password123'},
    {'email': 'nithya@example.com', 'password': 'password123'},
    {'email': 'sunitha@example.com', 'password': 'password123'}
]

class UserIsolationTester:
    def __init__(self):
        self.user_tokens = {}
        self.test_results = {}
    
    def login_user(self, user_email, password):
        """Login user and get JWT token"""
        try:
            response = requests.post(f'{BASE_URL}/api/login', json={
                'email': user_email,
                'password': password
            })
            
            if response.status_code == 200:
                token = response.json().get('token')
                self.user_tokens[user_email] = token
                print(f"✅ {user_email} logged in successfully")
                return True
            else:
                print(f"❌ {user_email} login failed: {response.text}")
                return False
        except Exception as e:
            print(f"❌ Login error for {user_email}: {e}")
            return False
    
    def get_headers(self, user_email):
        """Get authentication headers for user"""
        token = self.user_tokens.get(user_email)
        return {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        } if token else {'Content-Type': 'application/json'}
    
    def test_wishlist_isolation(self):
        """Test wishlist data isolation"""
        print("\n🧪 Testing Wishlist Isolation")
        print("=" * 50)
        
        user1 = TEST_USERS[0]['email']
        user2 = TEST_USERS[1]['email']
        
        # User 1 adds items to wishlist
        wishlist_item = {
            'product_id': 'WISH_TEST_001',
            'product_name': 'User 1 Wishlist Item',
            'product_image': 'test_image.jpg',
            'product_price': 1500,
            'product_category': 'clothing',
            'priority': 'high',
            'notes': 'User 1 private wishlist item'
        }
        
        response1 = requests.post(
            f'{BASE_URL}/api/user/wishlist',
            json=wishlist_item,
            headers=self.get_headers(user1)
        )
        
        if response1.status_code == 201:
            print(f"✅ {user1} added item to wishlist")
        else:
            print(f"❌ {user1} failed to add wishlist item: {response1.text}")
            return False
        
        # User 2 checks their wishlist (should be empty)
        response2 = requests.get(
            f'{BASE_URL}/api/user/wishlist',
            headers=self.get_headers(user2)
        )
        
        if response2.status_code == 200:
            user2_wishlist = response2.json().get('wishlist', [])
            if len(user2_wishlist) == 0:
                print(f"✅ {user2} wishlist is empty (correct isolation)")
            else:
                print(f"❌ {user2} can see {len(user2_wishlist)} items (ISOLATION BREACH!)")
                return False
        else:
            print(f"❌ {user2} failed to get wishlist: {response2.text}")
            return False
        
        # User 1 checks their wishlist (should have 1 item)
        response3 = requests.get(
            f'{BASE_URL}/api/user/wishlist',
            headers=self.get_headers(user1)
        )
        
        if response3.status_code == 200:
            user1_wishlist = response3.json().get('wishlist', [])
            if len(user1_wishlist) == 1:
                print(f"✅ {user1} can see their 1 wishlist item")
                return True
            else:
                print(f"❌ {user1} has {len(user1_wishlist)} items, expected 1")
                return False
        else:
            print(f"❌ {user1} failed to get wishlist: {response3.text}")
            return False
    
    def test_cart_isolation(self):
        """Test cart data isolation"""
        print("\n🧪 Testing Cart Isolation")
        print("=" * 50)
        
        user1 = TEST_USERS[0]['email']
        user2 = TEST_USERS[1]['email']
        
        # User 1 adds items to cart
        cart_item = {
            'product_id': 'CART_TEST_001',
            'product_name': 'User 1 Cart Item',
            'product_image': 'test_cart_image.jpg',
            'product_price': 2500,
            'product_category': 'accessories',
            'quantity': 2
        }
        
        response1 = requests.post(
            f'{BASE_URL}/api/user/cart',
            json=cart_item,
            headers=self.get_headers(user1)
        )
        
        if response1.status_code == 201:
            print(f"✅ {user1} added item to cart")
        else:
            print(f"❌ {user1} failed to add cart item: {response1.text}")
            return False
        
        # User 2 checks their cart (should be empty)
        response2 = requests.get(
            f'{BASE_URL}/api/user/cart',
            headers=self.get_headers(user2)
        )
        
        if response2.status_code == 200:
            user2_cart = response2.json().get('cart', [])
            if len(user2_cart) == 0:
                print(f"✅ {user2} cart is empty (correct isolation)")
            else:
                print(f"❌ {user2} can see {len(user2_cart)} cart items (ISOLATION BREACH!)")
                return False
        else:
            print(f"❌ {user2} failed to get cart: {response2.text}")
            return False
        
        # User 1 checks their cart (should have 1 item)
        response3 = requests.get(
            f'{BASE_URL}/api/user/cart',
            headers=self.get_headers(user1)
        )
        
        if response3.status_code == 200:
            user1_cart = response3.json().get('cart', [])
            if len(user1_cart) == 1:
                print(f"✅ {user1} can see their 1 cart item")
                return True
            else:
                print(f"❌ {user1} has {len(user1_cart)} cart items, expected 1")
                return False
        else:
            print(f"❌ {user1} failed to get cart: {response3.text}")
            return False
    
    def test_search_history_isolation(self):
        """Test search history isolation"""
        print("\n🧪 Testing Search History Isolation")
        print("=" * 50)
        
        user1 = TEST_USERS[0]['email']
        user2 = TEST_USERS[1]['email']
        
        # User 1 saves search history
        search_data = {
            'query': 'User 1 private search',
            'filters': {'category': 'sarees', 'color': 'red'},
            'results_count': 25,
            'search_type': 'text'
        }
        
        response1 = requests.post(
            f'{BASE_URL}/api/user/search-history',
            json=search_data,
            headers=self.get_headers(user1)
        )
        
        if response1.status_code == 201:
            print(f"✅ {user1} saved search history")
        else:
            print(f"❌ {user1} failed to save search: {response1.text}")
            return False
        
        # User 2 checks their search history (should be empty)
        response2 = requests.get(
            f'{BASE_URL}/api/user/search-history',
            headers=self.get_headers(user2)
        )
        
        if response2.status_code == 200:
            user2_searches = response2.json().get('searches', [])
            if len(user2_searches) == 0:
                print(f"✅ {user2} search history is empty (correct isolation)")
            else:
                print(f"❌ {user2} can see {len(user2_searches)} searches (ISOLATION BREACH!)")
                return False
        else:
            print(f"❌ {user2} failed to get search history: {response2.text}")
            return False
        
        return True
    
    def test_order_isolation(self):
        """Test order history isolation"""
        print("\n🧪 Testing Order History Isolation")
        print("=" * 50)
        
        user1 = TEST_USERS[0]['email']
        user2 = TEST_USERS[1]['email']
        
        # User 1 places an order
        order_data = {
            'total_amount': 5000,
            'discount_amount': 500,
            'tax_amount': 450,
            'shipping_cost': 100,
            'payment_method': 'credit_card',
            'shipping_address': 'User 1 Address, City, State',
            'order_items': [
                {
                    'product_id': 'ORDER_TEST_001',
                    'product_name': 'User 1 Order Item',
                    'product_price': 5000,
                    'quantity': 1
                }
            ],
            'order_notes': 'User 1 private order'
        }
        
        response1 = requests.post(
            f'{BASE_URL}/api/user/orders',
            json=order_data,
            headers=self.get_headers(user1)
        )
        
        if response1.status_code == 201:
            print(f"✅ {user1} placed order successfully")
        else:
            print(f"❌ {user1} failed to place order: {response1.text}")
            return False
        
        # User 2 checks their orders (should be empty)
        response2 = requests.get(
            f'{BASE_URL}/api/user/orders',
            headers=self.get_headers(user2)
        )
        
        if response2.status_code == 200:
            user2_orders = response2.json().get('orders', [])
            if len(user2_orders) == 0:
                print(f"✅ {user2} order history is empty (correct isolation)")
            else:
                print(f"❌ {user2} can see {len(user2_orders)} orders (ISOLATION BREACH!)")
                return False
        else:
            print(f"❌ {user2} failed to get orders: {response2.text}")
            return False
        
        return True
    
    def test_calendar_isolation(self):
        """Test calendar events isolation"""
        print("\n🧪 Testing Calendar Events Isolation")
        print("=" * 50)
        
        user1 = TEST_USERS[0]['email']
        user2 = TEST_USERS[1]['email']
        
        # User 1 saves calendar event
        tomorrow = datetime.now() + timedelta(days=1)
        event_data = {
            'user_gender': 'Women',
            'event_date': tomorrow.strftime('%Y-%m-%d'),
            'event_name': 'User 1 Private Event',
            'event_category': 'personal',
            'notes': 'User 1 private calendar event'
        }
        
        response1 = requests.post(
            f'{BASE_URL}/api/user/calendar-events',
            json=event_data,
            headers=self.get_headers(user1)
        )
        
        if response1.status_code == 201:
            print(f"✅ {user1} saved calendar event")
        else:
            print(f"❌ {user1} failed to save event: {response1.text}")
            return False
        
        # User 2 checks their calendar (should be empty)
        response2 = requests.get(
            f'{BASE_URL}/api/user/calendar-events',
            headers=self.get_headers(user2)
        )
        
        if response2.status_code == 200:
            user2_events = response2.json().get('events', [])
            if len(user2_events) == 0:
                print(f"✅ {user2} calendar is empty (correct isolation)")
            else:
                print(f"❌ {user2} can see {len(user2_events)} events (ISOLATION BREACH!)")
                return False
        else:
            print(f"❌ {user2} failed to get calendar: {response2.text}")
            return False
        
        return True
    
    def test_chat_history_isolation(self):
        """Test chat history isolation"""
        print("\n🧪 Testing Chat History Isolation")
        print("=" * 50)
        
        user1 = TEST_USERS[0]['email']
        user2 = TEST_USERS[1]['email']
        
        # User 1 saves chat message
        chat_data = {
            'session_id': f'session_{user1}',
            'message_text': 'User 1 private chat message',
            'is_user_message': True,
            'message_type': 'text'
        }
        
        response1 = requests.post(
            f'{BASE_URL}/api/user/chat-history',
            json=chat_data,
            headers=self.get_headers(user1)
        )
        
        if response1.status_code == 201:
            print(f"✅ {user1} saved chat message")
        else:
            print(f"❌ {user1} failed to save chat: {response1.text}")
            return False
        
        # User 2 checks their chat history (should be empty)
        response2 = requests.get(
            f'{BASE_URL}/api/user/chat-history',
            headers=self.get_headers(user2)
        )
        
        if response2.status_code == 200:
            user2_chats = response2.json().get('messages', [])
            if len(user2_chats) == 0:
                print(f"✅ {user2} chat history is empty (correct isolation)")
            else:
                print(f"❌ {user2} can see {len(user2_chats)} messages (ISOLATION BREACH!)")
                return False
        else:
            print(f"❌ {user2} failed to get chat history: {response2.text}")
            return False
        
        return True
    
    def test_cross_user_verification(self):
        """Verify no cross-user data access"""
        print("\n🧪 Testing Cross-User Data Verification")
        print("=" * 50)
        
        results = []
        
        for i, user in enumerate(TEST_USERS):
            user_email = user['email']
            print(f"\n📊 Checking {user_email} data isolation:")
            
            # Check all user data endpoints
            endpoints = [
                ('wishlist', '/api/user/wishlist'),
                ('cart', '/api/user/cart'),
                ('orders', '/api/user/orders'),
                ('search_history', '/api/user/search-history'),
                ('calendar_events', '/api/user/calendar-events'),
                ('chat_history', '/api/user/chat-history')
            ]
            
            user_data_counts = {}
            
            for endpoint_name, endpoint_url in endpoints:
                try:
                    response = requests.get(
                        f'{BASE_URL}{endpoint_url}',
                        headers=self.get_headers(user_email)
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Get count based on endpoint response structure
                        if endpoint_name == 'wishlist':
                            count = len(data.get('wishlist', []))
                        elif endpoint_name == 'cart':
                            count = len(data.get('cart', []))
                        elif endpoint_name == 'orders':
                            count = len(data.get('orders', []))
                        elif endpoint_name == 'search_history':
                            count = len(data.get('searches', []))
                        elif endpoint_name == 'calendar_events':
                            count = len(data.get('events', []))
                        elif endpoint_name == 'chat_history':
                            count = len(data.get('messages', []))
                        else:
                            count = 0
                        
                        user_data_counts[endpoint_name] = count
                        print(f"  - {endpoint_name}: {count} items")
                    else:
                        user_data_counts[endpoint_name] = 'ERROR'
                        print(f"  - {endpoint_name}: ERROR ({response.status_code})")
                        
                except Exception as e:
                    user_data_counts[endpoint_name] = 'ERROR'
                    print(f"  - {endpoint_name}: ERROR ({e})")
            
            results.append({
                'user': user_email,
                'data': user_data_counts
            })
        
        # Verify isolation
        print(f"\n📋 Data Isolation Summary:")
        isolation_success = True
        
        for result in results:
            user = result['user']
            data = result['data']
            
            # Check if user has their own data (first user should have data)
            if user == TEST_USERS[0]['email']:
                expected_data = True
                for key, count in data.items():
                    if isinstance(count, int) and count > 0:
                        print(f"✅ {user} has {count} {key} items (expected)")
                    elif count == 0:
                        print(f"⚠️  {user} has 0 {key} items")
            else:
                # Other users should have no data from first user
                has_data = any(isinstance(count, int) and count > 0 for count in data.values())
                if not has_data:
                    print(f"✅ {user} has no data from other users (correct isolation)")
                else:
                    print(f"❌ {user} has data from other users (ISOLATION BREACH!)")
                    isolation_success = False
        
        return isolation_success
    
    def run_complete_test(self):
        """Run complete user isolation test suite"""
        print("🚀 Starting Complete User Data Isolation Test Suite")
        print("=" * 70)
        
        # Step 1: Login all test users
        print("\n1️⃣ Logging in test users...")
        login_success = True
        for user in TEST_USERS:
            if not self.login_user(user['email'], user['password']):
                login_success = False
        
        if not login_success:
            print("❌ User login failed. Cannot proceed with tests.")
            return False
        
        # Step 2: Run isolation tests
        test_methods = [
            ('Wishlist Isolation', self.test_wishlist_isolation),
            ('Cart Isolation', self.test_cart_isolation),
            ('Search History Isolation', self.test_search_history_isolation),
            ('Order History Isolation', self.test_order_isolation),
            ('Calendar Events Isolation', self.test_calendar_isolation),
            ('Chat History Isolation', self.test_chat_history_isolation),
            ('Cross-User Verification', self.test_cross_user_verification)
        ]
        
        test_results = {}
        
        for test_name, test_method in test_methods:
            print(f"\n{'='*70}")
            try:
                result = test_method()
                test_results[test_name] = result
                if result:
                    print(f"✅ {test_name}: PASSED")
                else:
                    print(f"❌ {test_name}: FAILED")
            except Exception as e:
                test_results[test_name] = False
                print(f"❌ {test_name}: ERROR - {e}")
        
        # Step 3: Final results
        print(f"\n{'='*70}")
        print("🎯 FINAL TEST RESULTS")
        print("=" * 70)
        
        passed_tests = sum(1 for result in test_results.values() if result)
        total_tests = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            print(f"{test_name}: {status}")
        
        print(f"\n📊 Summary: {passed_tests}/{total_tests} tests passed")
        
        if passed_tests == total_tests:
            print("🎉 ALL TESTS PASSED - USER DATA ISOLATION IS COMPLETE!")
            print("✅ Zero data leakage between users")
            print("✅ Complete privacy and data separation")
            return True
        else:
            print("⚠️  SOME TESTS FAILED - USER DATA ISOLATION NEEDS ATTENTION")
            print("🔧 Check failed tests and fix isolation issues")
            return False

if __name__ == '__main__':
    tester = UserIsolationTester()
    success = tester.run_complete_test()
    
    if success:
        print("\n🚀 USER DATA ISOLATION SYSTEM IS PRODUCTION READY!")
    else:
        print("\n🔧 USER DATA ISOLATION SYSTEM NEEDS FIXES!")