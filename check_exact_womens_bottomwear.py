import mysql.connector

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )
    cursor = conn.cursor()
    
    print('Checking exact Women\'s Bottomwear category...')
    
    # Check exact category name
    cursor.execute('''
        SELECT DISTINCT product_category 
        FROM clothing 
        WHERE gender = 'Women' AND product_category LIKE '%bottom%'
    ''')
    categories = cursor.fetchall()
    
    print('Categories containing "bottom":')
    for cat in categories:
        print(f'  - "{cat[0]}"')
        
    # Test exact match
    cursor.execute('''
        SELECT COUNT(*), product_category
        FROM clothing 
        WHERE LOWER(product_category) = 'women\'s bottomwear'
        GROUP BY product_category
    ''')
    exact_match = cursor.fetchall()
    
    print('\nExact match for "women\'s bottomwear":')
    for match in exact_match:
        print(f'  - Count: {match[0]}, Category: "{match[1]}"')
        
    # Test with apostrophe variations
    cursor.execute('''
        SELECT COUNT(*), product_category
        FROM clothing 
        WHERE product_category = 'Women\'s Bottomwear'
        GROUP BY product_category
    ''')
    apostrophe_match = cursor.fetchall()
    
    print('\nExact match with apostrophe:')
    for match in apostrophe_match:
        print(f'  - Count: {match[0]}, Category: "{match[1]}"')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')