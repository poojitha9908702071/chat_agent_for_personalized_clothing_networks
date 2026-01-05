#!/usr/bin/env python3
"""
Debug the smart quote character issue
"""

import mysql.connector

def main():
    print("🔍 DEBUGGING SMART QUOTE CHARACTER")
    print("=" * 50)
    
    try:
        conn = mysql.connector.connect(
            host='localhost',
            user='root',
            password='',
            database='fashiopulse'
        )
        cursor = conn.cursor()
        
        # Get the exact category string from database
        cursor.execute("""
            SELECT DISTINCT product_category 
            FROM clothing 
            WHERE product_category LIKE '%bottomwear%'
        """)
        
        categories = cursor.fetchall()
        
        print("Categories containing 'bottomwear':")
        for cat in categories:
            category = cat[0]
            print(f"  - '{category}'")
            print(f"    Character codes: {[ord(c) for c in category]}")
            print(f"    Lowercase: '{category.lower()}'")
            print(f"    Lowercase codes: {[ord(c) for c in category.lower()]}")
            print()
        
        # Test with the exact smart quote character (8217)
        smart_quote_char = chr(8217)  # '
        test_category = f"women{smart_quote_char}s bottomwear"
        
        print(f"Testing with smart quote: '{test_category}'")
        print(f"Character codes: {[ord(c) for c in test_category]}")
        
        cursor.execute("""
            SELECT COUNT(*) 
            FROM clothing 
            WHERE LOWER(product_category) = %s AND LOWER(gender) = %s
        """, (test_category, "women"))
        
        count = cursor.fetchone()[0]
        print(f"Products found with smart quote: {count}")
        
        # Also test regular apostrophe
        regular_category = "women's bottomwear"
        print(f"\nTesting with regular apostrophe: '{regular_category}'")
        print(f"Character codes: {[ord(c) for c in regular_category]}")
        
        cursor.execute("""
            SELECT COUNT(*) 
            FROM clothing 
            WHERE LOWER(product_category) = %s AND LOWER(gender) = %s
        """, (regular_category, "women"))
        
        count = cursor.fetchone()[0]
        print(f"Products found with regular apostrophe: {count}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()