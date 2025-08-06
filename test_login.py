import requests
import json

# Test the login endpoint
def test_login():
    url = "http://45.56.120.65:8001/api/user/login/"
    data = {
        "username": "admin",  # Replace with your actual username
        "password": "admin"   # Replace with your actual password
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Access Token: {result.get('access_token', 'Not found')[:50]}...")
            print(f"Refresh Token: {result.get('refresh_token', 'Not found')[:50]}...")
        else:
            print("Login failed")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login() 