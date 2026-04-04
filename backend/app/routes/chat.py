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
        
        # Check if request is accepted
        if ride_request.status != 'accepted':
            return jsonify({'error': 'Chat only available for accepted requests'}), 403
        
        messages = ChatService.get_messages(request_id, limit)
        
        return jsonify({
            'messages': [msg.to_dict() for msg in messages],
            'count': len(messages)
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
        
        # Check if request is accepted
        if ride_request.status != 'accepted':
            return jsonify({'error': 'Chat only available for accepted requests'}), 403
        
        message = ChatService.send_message(user_id, request_id, data['content'])
        
        return jsonify({
            'message': 'Message sent',
            'data': message.to_dict()
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
