import mysql.connector

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )
    cursor = conn.cursor()
    
    print('Checking lowercase category names...')
    
    # Get the exact lowercase version
    cursor.execute('''
        SELECT DISTINCT LOWER(product_category) as lower_cat, product_category, COUNT(*) as count
        FROM clothing 
        WHERE product_category LIKE '%bottom%'
        GROUP BY product_category
    ''')
    
    categories = cursor.fetchall()
    
    print('Lowercase categories:')
    for cat in categories:
        lower_cat = cat[0]
        original_cat = cat[1]
        count = cat[2]
        print(f'  - Lowercase: "{lower_cat}"')
        print(f'    Original: "{original_cat}"')
        print(f'    Count: {count}')
        print(f'    Character codes: {[ord(c) for c in lower_cat]}')
        print()
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')