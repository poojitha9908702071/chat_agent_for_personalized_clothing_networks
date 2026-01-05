import mysql.connector

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )
    cursor = conn.cursor()
    
    print('Testing exact Women\'s Bottomwear matching...')
    
    # Test the exact query the backend should run
    query = '''
    SELECT product_id, product_name, product_category, gender
    FROM clothing 
    WHERE (LOWER(product_category) = %s OR LOWER(product_category) = %s) 
    AND LOWER(gender) = %s 
    LIMIT 5
    '''
    
    # Use both regular and smart apostrophe
    params = ("women's bottomwear", "women's bottomwear", "women")
    
    print(f'Query: {query}')
    print(f'Params: {params}')
    
    cursor.execute(query, params)
    products = cursor.fetchall()
    
    print(f'\nResults: {len(products)} products found')
    for product in products:
        print(f'  - ID: {product[0]}, Name: {product[1]}')
        print(f'    Category: "{product[2]}", Gender: {product[3]}')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')