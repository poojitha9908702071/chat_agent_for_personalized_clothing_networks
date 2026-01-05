import mysql.connector

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )
    cursor = conn.cursor()
    
    print('Checking Women\'s Bottomwear products...')
    
    # Check exact category name with proper escaping
    cursor.execute('''
        SELECT COUNT(*), product_category
        FROM clothing 
        WHERE product_category = %s
        GROUP BY product_category
    ''', ("Women's Bottomwear",))
    
    exact_match = cursor.fetchall()
    
    print('Exact match for "Women\'s Bottomwear":')
    for match in exact_match:
        print(f'  - Count: {match[0]}, Category: "{match[1]}"')
        
    # Get sample products
    cursor.execute('''
        SELECT product_id, product_name, product_category, gender
        FROM clothing 
        WHERE product_category = %s
        LIMIT 5
    ''', ("Women's Bottomwear",))
    
    products = cursor.fetchall()
    
    print('\nSample Women\'s Bottomwear products:')
    for product in products:
        print(f'  - ID: {product[0]}, Name: {product[1]}, Category: {product[2]}, Gender: {product[3]}')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')