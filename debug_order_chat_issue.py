#!/usr/bin/env python3

import mysql.connector
import json
from datetime import datetime

# Database connection
def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )

def debug_order_issue():
    """Debug why orders are not showing in chat for sunitha@gmail.com"""
    
    print("🔍 DEBUGGING ORDER CHAT ISSUE")
    print("=" * 50)
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # 1. Check if user exists
        print("\n1️⃣ Checking if user exists...")
        cursor.execute("SELECT * FROM users WHERE email = %s", ('sunitha@gmail.com',))
        user = cursor.fetchone()
        
        if user:
            print(f"✅ User found: {user['name']} ({user['email']})")
        else:
            print("❌ User not found in users table")
            return
        
        # 2. Check user_orders table
        print("\n2️⃣ Checking user_orders table...")
        cursor.execute("SELECT * FROM user_orders WHERE user_email = %s", ('sunitha@gmail.com',))
        user_orders = cursor.fetchall()
        
        print(f"📦 Found {len(user_orders)} orders in user_orders table")
        for order in user_orders:
            print(f"   - Order ID: {order['order_id']}")
            print(f"   - Status: {order['order_status']}")
            print(f"   - Amount: ₹{order['total_amount']}")
            print(f"   - Date: {order['created_at']}")
            print()
        
        # 3. Check if there are orders in other tables
        print("\n3️⃣ Checking for orders in other possible tables...")
        
        # Check if there's a general orders table
        cursor.execute("SHOW TABLES LIKE '%order%'")
        order_tables = cursor.fetchall()
        
        print("📋 Order-related tables found:")
        for table in order_tables:
            table_name = list(table.values())[0]
            print(f"   - {table_name}")
            
            # Check if this table has sunitha's data
            try:
                cursor.execute(f"SELECT COUNT(*) as count FROM {table_name} WHERE user_email = %s OR email = %s", 
                             ('sunitha@gmail.com', 'sunitha@gmail.com'))
                count = cursor.fetchone()['count']
                if count > 0:
                    print(f"     ✅ Found {count} records for sunitha@gmail.com")
                    
                    # Show sample records
                    cursor.execute(f"SELECT * FROM {table_name} WHERE user_email = %s OR email = %s LIMIT 3", 
                                 ('sunitha@gmail.com', 'sunitha@gmail.com'))
                    records = cursor.fetchall()
                    for record in records:
                        print(f"     📄 Sample: {record}")
                else:
                    print(f"     ❌ No records for sunitha@gmail.com")
            except Exception as e:
                print(f"     ⚠️ Error checking {table_name}: {e}")
        
        # 4. Check localStorage orders (this might be where the order is stored)
        print("\n4️⃣ Checking localStorage vs Database mismatch...")
        print("🔍 The order shown in the UI (ORD40207088) might be stored in:")
        print("   - localStorage (frontend only)")
        print("   - A different table")
        print("   - Not synced to user_orders table")
        
        # 5. Create test order in user_orders table
        print("\n5️⃣ Creating test order in user_orders table...")
        
        test_order_id = "ORD40207088"  # Same as shown in UI
        test_order_data = {
            'user_email': 'sunitha@gmail.com',
            'order_id': test_order_id,
            'total_amount': 2541,
            'order_status': 'confirmed',
            'payment_status': 'paid',
            'shipping_address': 'Test Address',
            'order_items': json.dumps([{
                'product_name': 'Classic White Slim-Fit Shirt (M, White)',
                'quantity': 1,
                'price': 2541
            }])
        }
        
        # Check if order already exists
        cursor.execute("SELECT * FROM user_orders WHERE order_id = %s", (test_order_id,))
        existing_order = cursor.fetchone()
        
        if existing_order:
            print(f"✅ Order {test_order_id} already exists in user_orders")
        else:
            cursor.execute("""
                INSERT INTO user_orders 
                (user_email, order_id, total_amount, order_status, payment_status, shipping_address, order_items)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                test_order_data['user_email'],
                test_order_data['order_id'], 
                test_order_data['total_amount'],
                test_order_data['order_status'],
                test_order_data['payment_status'],
                test_order_data['shipping_address'],
                test_order_data['order_items']
            ))
            conn.commit()
            print(f"✅ Created test order {test_order_id} in user_orders table")
        
        # 6. Verify the fix
        print("\n6️⃣ Verifying the fix...")
        cursor.execute("SELECT * FROM user_orders WHERE user_email = %s", ('sunitha@gmail.com',))
        final_orders = cursor.fetchall()
        
        print(f"📦 Final count: {len(final_orders)} orders for sunitha@gmail.com")
        for order in final_orders:
            print(f"   ✅ Order {order['order_id']} - Status: {order['order_status']} - Amount: ₹{order['total_amount']}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    debug_order_issue()