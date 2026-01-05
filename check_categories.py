import mysql.connector

try:
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='fashiopulse'
    )
    cursor = conn.cursor()
    
    print('🔍 Checking exact category names in database...')
    cursor.execute('''
        SELECT DISTINCT product_category, COUNT(*) as count
        FROM clothing 
        WHERE gender = 'Women' 
        GROUP BY product_category
        ORDER BY count DESC
    ''')
    categories = cursor.fetchall()
    
    print('Women\'s Categories in Database:')
    for cat in categories:
        print(f'  - "{cat[0]}" ({cat[1]} products)')
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f'❌ Database Error: {e}')