from flask import Flask
from flask_cors import CORS
from app.models import db
from app.routes import auth, ride, request, chat
import os

def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
        'DATABASE_URL', 
        'postgresql://postgres:postgres@localhost:5432/railpool'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JSON_SORT_KEYS'] = False
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth.auth_bp)
    app.register_blueprint(ride.ride_bp)
    app.register_blueprint(request.request_bp)
    app.register_blueprint(chat.chat_bp)
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app
