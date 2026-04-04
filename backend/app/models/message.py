from datetime import datetime
from . import db

class Message(db.Model):
    """Message model for chat between users"""
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    ride_request_id = db.Column(db.Integer, db.ForeignKey('ride_requests.id'), nullable=False, index=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    def to_dict(self):
        """Convert message to dictionary"""
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'ride_request_id': self.ride_request_id,
            'content': self.content,
            'created_at': self.created_at.isoformat()
        }
