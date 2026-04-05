from flask import Blueprint, request, jsonify
from app.models import db, Message, RideRequest, User
from app.utils.auth import token_required
from app.services.ride import ChatService

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')

@chat_bp.route('/<int:request_id>/messages', methods=['GET'])
@token_required
def get_messages(user_id, request_id):
    """Get all messages for a ride request"""
    limit = request.args.get('limit', 50, type=int)
    
    try:
        ride_request = RideRequest.query.get(request_id)
        
        if not ride_request:
            return jsonify({'error': 'Request not found'}), 404
        
        # Check if user is involved in this request
        if ride_request.sender_id != user_id and ride_request.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        messages = ChatService.get_messages(request_id, limit)
        
        # Format messages with sender info
        formatted_messages = []
        for msg in messages:
            sender = User.query.get(msg.sender_id)
            formatted_messages.append({
                'id': msg.id,
                'sender_id': msg.sender_id,
                'sender_name': sender.name,
                'sender_avatar': sender.avatar_url,
                'content': msg.content,
                'created_at': msg.created_at.isoformat()
            })
        
        return jsonify({
            'messages': formatted_messages,
            'count': len(formatted_messages)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/<int:request_id>/send', methods=['POST'])
@token_required
def send_message(user_id, request_id):
    """Send a message in a ride request chat"""
    data = request.get_json()
    
    if not data or not data.get('content'):
        return jsonify({'error': 'Message content is required'}), 400
    
    try:
        ride_request = RideRequest.query.get(request_id)
        
        if not ride_request:
            return jsonify({'error': 'Request not found'}), 404
        
        # Check if user is involved in this request
        if ride_request.sender_id != user_id and ride_request.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        message = ChatService.send_message(user_id, request_id, data['content'])
        
        # Get sender info
        sender = User.query.get(user_id)
        
        return jsonify({
            'message': 'Message sent',
            'data': {
                'id': message.id,
                'sender_id': message.sender_id,
                'sender_name': sender.name,
                'sender_avatar': sender.avatar_url,
                'content': message.content,
                'created_at': message.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@chat_bp.route('/conversations', methods=['GET'])
@token_required
def get_conversations(user_id):
    """Get all conversations for a user"""
    try:
        # Get all ride requests where user is sender or receiver
        ride_requests = RideRequest.query.filter(
            (RideRequest.sender_id == user_id) | (RideRequest.receiver_id == user_id)
        ).all()
        
        conversations = []
        for ride_req in ride_requests:
            # Get the other user
            other_user_id = ride_req.receiver_id if user_id == ride_req.sender_id else ride_req.sender_id
            other_user = User.query.get(other_user_id)
            
            # Get latest message
            latest_message = Message.query.filter_by(
                ride_request_id=ride_req.id
            ).order_by(Message.created_at.desc()).first()
            
            conversations.append({
                'ride_request_id': ride_req.id,
                'other_user': {
                    'id': other_user.id,
                    'name': other_user.name,
                    'avatar_url': other_user.avatar_url,
                    'rating': other_user.rating
                },
                'ride_intent': {
                    'id': ride_req.ride_intent.id,
                    'station': ride_req.ride_intent.station,
                    'destination_name': ride_req.ride_intent.destination_name,
                    'arrival_time': ride_req.ride_intent.arrival_time.isoformat()
                },
                'status': ride_req.status,
                'latest_message': latest_message.content if latest_message else '',
                'latest_message_time': latest_message.created_at.isoformat() if latest_message else None,
                'message_count': Message.query.filter_by(ride_request_id=ride_req.id).count()
            })
        
        # Sort by latest message
        conversations.sort(
            key=lambda x: x['latest_message_time'] or x['ride_intent']['arrival_time'],
            reverse=True
        )
        
        return jsonify({
            'conversations': conversations,
            'total': len(conversations)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
