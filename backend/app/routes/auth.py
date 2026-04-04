from flask import Blueprint, request, jsonify
from app.models import db, User
from app.utils.auth import generate_token, token_required
from datetime import datetime
from google.auth.transport import requests
from google.oauth2 import id_token
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User signup endpoint"""
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Email, password, and name are required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    
    try:
        # Create new user
        user = User(
            email=data['email'],
            name=data['name'],
            phone=data.get('phone'),
            gender=data.get('gender')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'token': token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user.id)
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'token': token
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(user_id):
    """Get current user profile"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(user_id):
    """Update user profile"""
    data = request.get_json()
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update fields
        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'gender' in data:
            user.gender = data['gender']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    """Google OAuth login endpoint"""
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Google token is required'}), 400
    
    try:
        # Verify the Google token
        GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
        
        if not GOOGLE_CLIENT_ID:
            return jsonify({'error': 'Google Client ID not configured'}), 500
        
        # Verify token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # Token is valid, extract user info
        google_id = idinfo['sub']
        email = idinfo.get('email')
        name = idinfo.get('name', 'Google User')
        avatar_url = idinfo.get('picture')
        
        # Check if user exists by google_id
        user = User.query.filter_by(google_id=google_id).first()
        
        if not user:
            # Check if user exists by email
            user = User.query.filter_by(email=email).first()
            
            if user:
                # Link existing account with Google
                user.google_id = google_id
                user.oauth_provider = 'google'
                user.avatar_url = avatar_url
            else:
                # Create new user
                user = User(
                    email=email,
                    name=name,
                    google_id=google_id,
                    oauth_provider='google',
                    avatar_url=avatar_url
                )
                # Set a placeholder password for OAuth users
                user.password_hash = None
        else:
            # Update user info
            user.name = name
            user.avatar_url = avatar_url
            user.updated_at = datetime.utcnow()
        
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token for our app
        jwt_token = generate_token(user.id)
        
        return jsonify({
            'message': 'Google login successful',
            'user': user.to_dict(),
            'token': jwt_token
        }), 200
        
    except ValueError as e:
        # Invalid token
        return jsonify({'error': 'Invalid Google token'}), 401
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
