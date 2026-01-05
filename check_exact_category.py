import mysql.connector

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )
    cursor = conn.cursor()
    
    print('Checking exact category names for bottomwear...')
    cursor.execute('''
        SELECT DISTINCT product_category 
        FROM clothing 
        WHERE gender = 'Women' AND product_category LIKE '%bottom%'
    ''')
    categories = cursor.fetchall()
    
    print('Exact category names:')
    for cat in categories:
        print(f'  - "{cat[0]}"')
        
    # Test the exact query that backend is running
    print('\nTesting backend query...')
    cursor.execute('''
        SELECT COUNT(*) 
        FROM clothing 
        WHERE LOWER(product_category) LIKE %s AND LOWER(gender) = %s
    ''', ('%women\'s bottomwear%', 'women'))
    
    count = cursor.fetchone()[0]
    print(f'Backend query result: {count} products')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')