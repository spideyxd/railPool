# Mock IRCTC API to simulate train search
from datetime import datetime, timedelta

MOCK_TRAINS = {
    'train_001': {
        'train_number': '12001',
        'train_name': 'Rajdhani Express',
        'source': 'Mumbai Central',
        'destination': 'Delhi Central',
        'arrival_time': (datetime.utcnow() + timedelta(hours=14)).isoformat()
    },
    'train_002': {
        'train_number': '12002',
        'train_name': 'Shatabdi Express',
        'source': 'Mumbai Central',
        'destination': 'Pune Junction',
        'arrival_time': (datetime.utcnow() + timedelta(hours=3)).isoformat()
    },
    'train_003': {
        'train_number': '12003',
        'train_name': 'Express Train',
        'source': 'Bangalore City',
        'destination': 'Hyderabad Deccan',
        'arrival_time': (datetime.utcnow() + timedelta(hours=8)).isoformat()
    }
}

def search_train(pnr=None, train_number=None, journey_date=None, destination_station=None):
    """
    Mock IRCTC API search function
    
    Args:
        pnr: Passenger Name Record
        train_number: Train number
        journey_date: Journey date
        destination_station: Destination station
    
    Returns:
        List of matching trains
    """
    results = []
    
    for train_id, train_info in MOCK_TRAINS.items():
        # Mock matching logic
        if destination_station:
            if destination_station.lower() in train_info['destination'].lower():
                results.append(train_info)
        elif train_number:
            if train_number in train_info['train_number']:
                results.append(train_info)
        else:
            # Return all if no specific criteria
            results.append(train_info)
    
    return results if results else MOCK_TRAINS.values()
