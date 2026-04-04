from flask import Blueprint, request, jsonify
from app.models import db, User, RideIntent, RideRequest, Message
from app.utils.auth import token_required
from app.utils.irctc_mock import search_train
from app.services.ride import RideService, RequestService, ChatService
from datetime import datetime

ride_bp = Blueprint('ride', __name__, url_prefix='/ride')

@ride_bp.route('/search-train', methods=['POST'])
def search_train_route():
    """Search for trains using IRCTC mock API"""
    data = request.get_json()
    
    try:
        results = search_train(
            pnr=data.get('pnr'),
            train_number=data.get('train_number'),
            journey_date=data.get('journey_date'),
            destination_station=data.get('destination_station')
        )
        
        return jsonify({
            'trains': list(results)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/create', methods=['POST'])
@token_required
def create_ride_intent(user_id):
    """Create a new ride intent"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['station', 'arrival_time', 'destination_name', 
                      'destination_lat', 'destination_lng', 'intent_type']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        # Parse arrival time
        arrival_time = datetime.fromisoformat(data['arrival_time'])
        
        # Validate intent type
        if data['intent_type'] not in ['offering', 'seeking']:
            return jsonify({'error': 'intent_type must be offering or seeking'}), 400
        
        # Validate seats based on intent type
        if data['intent_type'] == 'offering' and not data.get('seats_available'):
            return jsonify({'error': 'seats_available required for offering'}), 400
        
        if data['intent_type'] == 'seeking' and not data.get('seats_needed'):
            return jsonify({'error': 'seats_needed required for seeking'}), 400
        
        ride_intent = RideService.create_ride_intent(
            user_id=user_id,
            station=data['station'],
            arrival_time=arrival_time,
            destination_name=data['destination_name'],
            destination_lat=float(data['destination_lat']),
            destination_lng=float(data['destination_lng']),
            intent_type=data['intent_type'],
            seats_available=data.get('seats_available'),
            seats_needed=data.get('seats_needed')
        )
        
        return jsonify({
            'message': 'Ride intent created successfully',
            'ride_intent': ride_intent.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/search', methods=['POST'])
@token_required
def search_matches(user_id):
    """Search for matching ride intents"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['station', 'arrival_time', 'destination_lat', 'destination_lng']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        arrival_time = datetime.fromisoformat(data['arrival_time'])
        time_buffer = data.get('time_buffer', 3600)  # Default 1 hour
        
        matches = RideService.search_matches(
            user_id=user_id,
            station=data['station'],
            arrival_time=arrival_time,
            destination_lat=float(data['destination_lat']),
            destination_lng=float(data['destination_lng']),
            time_buffer=time_buffer
        )
        
        # Format results
        results = []
        for match in matches:
            results.append({
                'ride_intent': match['ride_intent'].to_dict(),
                'user': match['user'].to_dict(),
                'distance': round(match['distance'], 2),
                'match_score': round(match['match_score'], 1)
            })
        
        return jsonify({
            'matches': results,
            'count': len(results)
        }), 200
    except ValueError as e:
        return jsonify({'error': f'Invalid data format: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/my-intents', methods=['GET'])
@token_required
def get_user_intents(user_id):
    """Get all ride intents created by user"""
    try:
        intents = RideIntent.query.filter_by(user_id=user_id).all()
        
        return jsonify({
            'intents': [intent.to_dict() for intent in intents],
            'count': len(intents)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ride_bp.route('/<int:ride_intent_id>/deactivate', methods=['POST'])
@token_required
def deactivate_intent(user_id, ride_intent_id):
    """Deactivate a ride intent"""
    try:
        ride_intent = RideIntent.query.get(ride_intent_id)
        
        if not ride_intent:
            return jsonify({'error': 'Ride intent not found'}), 404
        
        if ride_intent.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        RideService.deactivate_ride_intent(ride_intent_id)
        
        return jsonify({
            'message': 'Ride intent deactivated',
            'ride_intent': ride_intent.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
