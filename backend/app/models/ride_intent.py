from datetime import datetime
from . import db

class RideIntent(db.Model):
    """Ride intent model for storing user's ride requirements"""
    __tablename__ = 'ride_intents'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    train_number = db.Column(db.String(10), nullable=True, index=True)  # e.g., "00101"
    train_name = db.Column(db.String(255), nullable=True)  # e.g., "CNB MAGHMELA SPL"
    station = db.Column(db.String(120), nullable=False, index=True)
    arrival_date = db.Column(db.Date, nullable=False, index=True)  # Date only (YYYY-MM-DD)
    destination_name = db.Column(db.String(255), nullable=False)
    destination_lat = db.Column(db.Float, nullable=False)
    destination_lng = db.Column(db.Float, nullable=False)
    intent_type = db.Column(db.String(20), nullable=False)  # 'offering' or 'seeking'
    seats_available = db.Column(db.Integer, nullable=True)  # for offering
    seats_needed = db.Column(db.Integer, nullable=True)  # for seeking
    is_active = db.Column(db.Boolean, default=True, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ride_requests = db.relationship('RideRequest', backref='ride_intent', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert ride intent to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'train_number': self.train_number,
            'train_name': self.train_name,
            'station': self.station,
            'arrival_date': self.arrival_date.isoformat() if self.arrival_date else None,
            'destination_name': self.destination_name,
            'destination_lat': self.destination_lat,
            'destination_lng': self.destination_lng,
            'intent_type': self.intent_type,
            'seats_available': self.seats_available,
            'seats_needed': self.seats_needed,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }
