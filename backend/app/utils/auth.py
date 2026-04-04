from functools import wraps
from flask import request, jsonify
import jwt
import os
from datetime import datetime, timedelta

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

def generate_token(user_id, expires_in=86400):
    """
    Generate JWT token for user
    
    Args:
        user_id: User ID
        expires_in: Token expiration time in seconds (default 24 hours)
    
    Returns:
        JWT token string
    """
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(seconds=expires_in),
        'iat': datetime.utcnow()
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def token_required(f):
    """
    Decorator to verify JWT token from request headers
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        # Pass user_id to route handler
        return f(user_id, *args, **kwargs)
    
    return decorated
