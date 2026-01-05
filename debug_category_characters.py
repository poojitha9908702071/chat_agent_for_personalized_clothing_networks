import mysql.connector

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )
    cursor = conn.cursor()
    
    print('Debugging category characters...')
    
    # Get all categories with "bottom" in them
    cursor.execute('''
        SELECT DISTINCT product_category, COUNT(*) as count
        FROM clothing 
        WHERE product_category LIKE '%bottom%'
        GROUP BY product_category
    ''')
    
    categories = cursor.fetchall()
    
    print('Categories containing "bottom":')
    for cat in categories:
        category_name = cat[0]
        count = cat[1]
        print(f'  - "{category_name}" ({count} products)')
        
        # Show character codes for debugging
        print(f'    Character codes: {[ord(c) for c in category_name]}')
        
        # Test if this matches our query
        cursor.execute('''
            SELECT COUNT(*)
            FROM clothing 
            WHERE LOWER(product_category) = %s
        ''', (category_name.lower(),))
        
        match_count = cursor.fetchone()[0]
        print(f'    Lowercase match count: {match_count}')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'Error: {e}')