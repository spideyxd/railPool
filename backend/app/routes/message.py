from flask import Blueprint, request, jsonify
from app.models import db, Message, RideRequest, User
from app.utils.auth import token_required
from datetime import datetime

message_bp = Blueprint('message', __name__, url_prefix='/message')

@message_bp.route('/send', methods=['POST'])
@token_required
def send_message(user_id):
    """Send a message in a chat"""
    data = request.get_json()
    
    if not data or not data.get('ride_request_id') or not data.get('content'):
        return jsonify({'error': 'ride_request_id and content are required'}), 400
    
    try:
        ride_request_id = int(data['ride_request_id'])
        content = data['content'].strip()
        
        if not content:
            return jsonify({'error': 'Message cannot be empty'}), 400
        
        # Check if ride_request exists and user is part of it
        ride_request = RideRequest.query.get(ride_request_id)
        
        if not ride_request:
            return jsonify({'error': 'Chat not found'}), 404
        
        # Check if user is sender or receiver
        if user_id != ride_request.sender_id and user_id != ride_request.receiver_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Create message
        message = Message(
            sender_id=user_id,
            ride_request_id=ride_request_id,
            content=content
        )
        
        db.session.add(message)
        db.session.commit()
        
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
                'created_at': message.created_at.isoformat(),
                'ride_request_id': message.ride_request_id
            }
        }), 201
    except ValueError:
        return jsonify({'error': 'Invalid ID format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@message_bp.route('/chat/<int:ride_request_id>', methods=['GET'])
@token_required
def get_chat_messages(user_id, ride_request_id):
    """Get all messages in a chat"""
    try:
        # Check if ride_request exists and user is part of it
        ride_request = RideRequest.query.get(ride_request_id)
        
        if not ride_request:
            return jsonify({'error': 'Chat not found'}), 404
        
        # Check if user is sender or receiver
        if user_id != ride_request.sender_id and user_id != ride_request.receiver_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get all messages
        messages = Message.query.filter_by(ride_request_id=ride_request_id).order_by(
            Message.created_at.asc()
        ).all()
        
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
        
        # Get ride request and ride details
        other_user_id = ride_request.receiver_id if user_id == ride_request.sender_id else ride_request.sender_id
        other_user = User.query.get(other_user_id)
        
        return jsonify({
            'messages': formatted_messages,
            'ride_request': ride_request.to_dict(),
            'other_user': {
                'id': other_user.id,
                'name': other_user.name,
                'avatar_url': other_user.avatar_url,
                'rating': other_user.rating
            },
            'ride_intent': ride_request.ride_intent.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@message_bp.route('/conversations', methods=['GET'])
@token_required
def get_user_conversations(user_id):
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
