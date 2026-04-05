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
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_requests_detail')
    receiver = db.relationship('User', foreign_keys=[receiver_id], backref='received_requests_detail')
    # Note: ride_intent is provided by backref from RideIntent.ride_requests
    
    def to_dict(self, include_users=False):
        """Convert ride request to dictionary"""
        data = {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'ride_intent_id': self.ride_intent_id,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_users:
            data['sender'] = {
                'id': self.sender.id,
                'name': self.sender.name,
                'avatar_url': self.sender.avatar_url,
                'rating': self.sender.rating
            }
            data['receiver'] = {
                'id': self.receiver.id,
                'name': self.receiver.name,
                'avatar_url': self.receiver.avatar_url,
                'rating': self.receiver.rating
            }
        
        return data
