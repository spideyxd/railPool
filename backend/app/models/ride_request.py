from datetime import datetime
from . import db

class RideRequest(db.Model):
    """Ride request model for pooling requests between users"""
    __tablename__ = 'ride_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    ride_intent_id = db.Column(db.Integer, db.ForeignKey('ride_intents.id'), nullable=False, index=True)
    status = db.Column(db.String(20), default='pending', index=True)  # pending, accepted, rejected, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships for messages
    messages = db.relationship('Message', backref='ride_request', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert ride request to dictionary"""
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'ride_intent_id': self.ride_intent_id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
