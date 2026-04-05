from app.models import db, User, RideIntent, RideRequest, Message
from datetime import datetime, timedelta
from app.utils.distance import haversine_distance

class RideService:
    """Service for managing ride intents and matching"""
    
    @staticmethod
    def create_ride_intent(user_id, train_number=None, train_name=None, station=None, arrival_date=None, 
                          destination_name=None, destination_lat=None, destination_lng=None, intent_type=None, 
                          seats_available=None, seats_needed=None):
        """Create a new ride intent"""
        ride_intent = RideIntent(
            user_id=user_id,
            train_number=train_number,
            train_name=train_name,
            station=station,
            arrival_date=arrival_date,
            destination_name=destination_name,
            destination_lat=destination_lat,
            destination_lng=destination_lng,
            intent_type=intent_type,
            seats_available=seats_available,
            seats_needed=seats_needed
        )
        db.session.add(ride_intent)
        db.session.commit()
        return ride_intent
    
    @staticmethod
    def search_matches(user_id, train_number=None, station=None, arrival_date=None, destination_lat=None, destination_lng=None, time_buffer=3600):
        """
        Search for matching ride intents
        
        Args:
            user_id: Current user ID
            train_number: Train number (optional filter)
            station: Destination station
            arrival_date: Arrival date (date object)
            destination_lat: Destination latitude
            destination_lng: Destination longitude
            time_buffer: Time buffer in seconds (default 1 hour)
        
        Returns:
            List of matching rides sorted by distance
        """
        # Build query for matching ride intents from other users
        query = RideIntent.query.filter(
            RideIntent.user_id != user_id,
            RideIntent.station == station,
            RideIntent.arrival_date == arrival_date,
            RideIntent.is_active == True
        )
        
        # Optional train number filter
        if train_number:
            query = query.filter(RideIntent.train_number == train_number)
        
        matches = query.all()
        
        # Calculate distance and create match objects
        match_results = []
        for match in matches:
            distance = haversine_distance(
                destination_lat, destination_lng,
                match.destination_lat, match.destination_lng
            )
            
            # Calculate match score (lower distance = higher score)
            match_score = max(0, 100 - (distance * 10))
            
            match_results.append({
                'ride_intent': match,
                'distance': distance,
                'match_score': match_score,
                'user': match.user
            })
        
        # Sort by distance (nearest first)
        match_results.sort(key=lambda x: x['distance'])
        
        return match_results
    
    @staticmethod
    def deactivate_ride_intent(ride_intent_id):
        """Deactivate a ride intent"""
        ride_intent = RideIntent.query.get(ride_intent_id)
        if ride_intent:
            ride_intent.is_active = False
            db.session.commit()
            return ride_intent
        return None

class RequestService:
    """Service for managing ride requests"""
    
    @staticmethod
    def send_request(sender_id, receiver_id, ride_intent_id):
        """Send a pooling request"""
        # Check if request already exists
        existing = RideRequest.query.filter_by(
            sender_id=sender_id,
            receiver_id=receiver_id,
            ride_intent_id=ride_intent_id
        ).first()
        
        if existing:
            return None, "Request already exists"
        
        ride_request = RideRequest(
            sender_id=sender_id,
            receiver_id=receiver_id,
            ride_intent_id=ride_intent_id,
            status='pending'
        )
        db.session.add(ride_request)
        db.session.commit()
        return ride_request, None
    
    @staticmethod
    def respond_to_request(request_id, status):
        """Respond to a pooling request (accept or reject)"""
        ride_request = RideRequest.query.get(request_id)
        if not ride_request:
            return None, "Request not found"
        
        if ride_request.status != 'pending':
            return None, f"Request is already {ride_request.status}"
        
        if status not in ['accepted', 'rejected']:
            return None, "Invalid status"
        
        ride_request.status = status
        db.session.commit()
        return ride_request, None
    
    @staticmethod
    def get_user_requests(user_id, status=None):
        """Get requests for a user (sent and received)"""
        query_sent = RideRequest.query.filter_by(sender_id=user_id)
        query_received = RideRequest.query.filter_by(receiver_id=user_id)
        
        if status:
            query_sent = query_sent.filter_by(status=status)
            query_received = query_received.filter_by(status=status)
        
        sent = query_sent.all()
        received = query_received.all()
        
        return {
            'sent': sent,
            'received': received
        }

class ChatService:
    """Service for managing messages"""
    
    @staticmethod
    def send_message(sender_id, ride_request_id, content):
        """Send a message"""
        message = Message(
            sender_id=sender_id,
            ride_request_id=ride_request_id,
            content=content
        )
        db.session.add(message)
        db.session.commit()
        return message
    
    @staticmethod
    def get_messages(ride_request_id, limit=50):
        """Get messages for a ride request"""
        messages = Message.query.filter_by(ride_request_id=ride_request_id)\
            .order_by(Message.created_at.asc())\
            .limit(limit)\
            .all()
        return messages
