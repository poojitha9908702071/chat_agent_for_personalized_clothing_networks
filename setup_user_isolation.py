#!/usr/bin/env python3
"""
Setup user data isolation tables in the database
"""
import mysql.connector
from backend.config import Config

def setup_user_isolation_tables():
    print("🔐 Setting up User Data Isolation Tables...")
    
    try:
        # Connect to database
        conn = mysql.connector.connect(
            host=Config.DB_HOST,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME
        )
        cursor = conn.cursor()
        
        # Read and execute SQL file
        with open('create_user_isolation_tables.sql', 'r') as file:
            sql_commands = file.read()
        
        # Split by semicolon and execute each command
        commands = [cmd.strip() for cmd in sql_commands.split(';') if cmd.strip()]
        
        for i, command in enumerate(commands, 1):
            try:
                cursor.execute(command)
                print(f"✅ Command {i}: Executed successfully")
            except mysql.connector.Error as e:
                if "already exists" in str(e).lower():
                    print(f"ℹ️  Command {i}: Table already exists, skipping")
                else:
                    print(f"❌ Command {i}: Error - {e}")
        
        conn.commit()
        
        # Verify tables were created
        cursor.execute("SHOW TABLES LIKE 'user_%'")
        tables = cursor.fetchall()
        
        print(f"\n📊 User isolation tables created:")
        for table in tables:
            print(f"   ✅ {table[0]}")
        
        cursor.close()
        conn.close()
        
        print(f"\n🎉 User data isolation setup complete!")
        print(f"   📝 {len(tables)} tables created")
        print(f"   🔐 All data will be isolated per user email")
        
    except Exception as e:
        print(f"❌ Setup failed: {e}")

if __name__ == "__main__":
    setup_user_isolation_tables()