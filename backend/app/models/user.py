from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from . import db

class User(db.Model):
    """User model for authentication and profile"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable for OAuth users
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    gender = db.Column(db.String(10), nullable=True)
    rating = db.Column(db.Float, default=5.0)
    
    # OAuth fields
    google_id = db.Column(db.String(255), unique=True, nullable=True, index=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    oauth_provider = db.Column(db.String(50), nullable=True)  # 'google', 'github', etc
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ride_intents = db.relationship('RideIntent', backref='user', lazy=True, cascade='all, delete-orphan')
    # Note: sent_requests and received_requests are provided by backrefs from RideRequest relationships
    messages = db.relationship('Message', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'phone': self.phone,
            'gender': self.gender,
            'rating': self.rating,
            'avatar_url': self.avatar_url,
            'oauth_provider': self.oauth_provider,
            'created_at': self.created_at.isoformat()
        }
