import requests

API_BASE = 'http://localhost:5000/api'

# Create test users
users = [
    {'name': 'Poojitha Test', 'email': 'poojitha@example.com', 'password': 'password123'},
    {'name': 'Nithya Test', 'email': 'nithya@example.com', 'password': 'password123'}
]

for user in users:
    print(f'Creating user: {user["email"]}')
    response = requests.post(f'{API_BASE}/signup', json=user)
    if response.status_code == 201:
        print(f'✅ User created successfully')
    else:
        print(f'ℹ️  User might already exist: {response.status_code}')