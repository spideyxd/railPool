from flask import Blueprint, request, jsonify
from app.models import db, RideRequest, User, Message
from app.utils.auth import token_required
from app.services.ride import RequestService, ChatService

request_bp = Blueprint('request', __name__, url_prefix='/request')

@request_bp.route('/send', methods=['POST'])
@token_required
def send_request(user_id):
    """Send a pooling request to join a ride"""
    data = request.get_json()
    
    # Accept both old format (receiver_id + ride_intent_id) and new format (just ride_intent_id)
    ride_intent_id = data.get('ride_intent_id')
    receiver_id = data.get('receiver_id')
    
    if not ride_intent_id:
        return jsonify({'error': 'ride_intent_id is required'}), 400
    
    try:
        from app.models import RideIntent
        ride_intent_id = int(ride_intent_id)
        
        # If receiver_id not provided, get it from the ride_intent
        if not receiver_id:
            ride_intent = RideIntent.query.get(ride_intent_id)
            if not ride_intent:
                return jsonify({'error': 'Ride not found'}), 404
            receiver_id = ride_intent.user_id
        else:
            receiver_id = int(receiver_id)
        
        # Check if receiver exists
        receiver = User.query.get(receiver_id)
        if not receiver:
            return jsonify({'error': 'Receiver not found'}), 404
        
        # Check if user is sending to themselves
        if user_id == receiver_id:
            return jsonify({'error': 'Cannot send request to yourself'}), 400
        
        ride_request, error = RequestService.send_request(user_id, receiver_id, ride_intent_id)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Request sent successfully',
            'request': ride_request.to_dict()
        }), 201
    except ValueError:
        return jsonify({'error': 'Invalid ID format'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@request_bp.route('/<int:request_id>/respond', methods=['POST'])
@token_required
def respond_request(user_id, request_id):
    """Respond to a pooling request"""
    data = request.get_json()
    
    if not data or not data.get('status'):
        return jsonify({'error': 'status is required'}), 400
    
    try:
        ride_request = RideRequest.query.get(request_id)
        
        if not ride_request:
            return jsonify({'error': 'Request not found'}), 404
        
        # Check if user is the receiver
        if ride_request.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        updated_request, error = RequestService.respond_to_request(request_id, data['status'])
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': f'Request {data["status"]}',
            'request': updated_request.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@request_bp.route('/my-requests', methods=['GET'])
@token_required
def get_user_requests(user_id):
    """Get all requests for current user"""
    status = request.args.get('status')
    
    try:
        requests_data = RequestService.get_user_requests(user_id, status)
        
        return jsonify({
            'sent_requests': [r.to_dict(include_users=True) for r in requests_data['sent']],
            'received_requests': [r.to_dict(include_users=True) for r in requests_data['received']],
            'total': len(requests_data['sent']) + len(requests_data['received'])
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@request_bp.route('/<int:request_id>', methods=['GET'])
@token_required
def get_request_details(user_id, request_id):
    """Get details of a specific request"""
    try:
        ride_request = RideRequest.query.get(request_id)
        
        if not ride_request:
            return jsonify({'error': 'Request not found'}), 404
        
        # Check if user is involved in this request
        if ride_request.sender_id != user_id and ride_request.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify({
            'request': ride_request.to_dict(),
            'sender': User.query.get(ride_request.sender_id).to_dict(),
            'receiver': User.query.get(ride_request.receiver_id).to_dict(),
            'ride_intent': ride_request.ride_intent.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
