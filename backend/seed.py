from app import create_app
from app.models import db, User, RideIntent, RideRequest, Message
from datetime import datetime, timedelta
import random

app = create_app()

def seed_data():
    """Seed database with sample data"""
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        db.drop_all()
        db.create_all()
        
        # Create sample users
        print("Creating sample users...")
        users = []
        user_data = [
            {'email': 'alice@railpool.com', 'name': 'Alice Johnson', 'phone': '9876543210', 'gender': 'Female'},
            {'email': 'bob@railpool.com', 'name': 'Bob Smith', 'phone': '9876543211', 'gender': 'Male'},
            {'email': 'carol@railpool.com', 'name': 'Carol White', 'phone': '9876543212', 'gender': 'Female'},
            {'email': 'dave@railpool.com', 'name': 'Dave Brown', 'phone': '9876543213', 'gender': 'Male'},
            {'email': 'eve@railpool.com', 'name': 'Eve Davis', 'phone': '9876543214', 'gender': 'Female'},
        ]
        
        for data in user_data:
            user = User(
                email=data['email'],
                name=data['name'],
                phone=data['phone'],
                gender=data['gender'],
                rating=round(random.uniform(3.5, 5.0), 1)
            )
            user.set_password('password123')
            users.append(user)
            db.session.add(user)
        
        db.session.commit()
        print(f"Created {len(users)} users")
        
        # Create sample ride intents
        print("Creating sample ride intents...")
        
        # Sample destinations (lat/lng)
        destinations = [
            {'name': 'Airport T1', 'lat': 28.5562, 'lng': 77.1199},
            {'name': 'Connaught Place', 'lat': 28.6292, 'lng': 77.1896},
            {'name': 'Sector 62 Noida', 'lat': 28.5862, 'lng': 77.3912},
            {'name': 'Gurgaon Mall', 'lat': 28.4595, 'lng': 77.0266},
            {'name': 'Airport T2', 'lat': 28.5520, 'lng': 77.1167},
        ]
        
        ride_intents = []
        
        # Alice offering a ride
        intent1 = RideIntent(
            user_id=users[0].id,
            station='Delhi Central',
            arrival_time=datetime.utcnow() + timedelta(hours=2),
            destination_name=destinations[0]['name'],
            destination_lat=destinations[0]['lat'],
            destination_lng=destinations[0]['lng'],
            intent_type='offering',
            seats_available=2
        )
        ride_intents.append(intent1)
        db.session.add(intent1)
        
        # Bob seeking a ride
        intent2 = RideIntent(
            user_id=users[1].id,
            station='Delhi Central',
            arrival_time=datetime.utcnow() + timedelta(hours=2.5),
            destination_name=destinations[1]['name'],
            destination_lat=destinations[1]['lat'],
            destination_lng=destinations[1]['lng'],
            intent_type='seeking',
            seats_needed=1
        )
        ride_intents.append(intent2)
        db.session.add(intent2)
        
        # Carol offering a ride
        intent3 = RideIntent(
            user_id=users[2].id,
            station='Delhi Central',
            arrival_time=datetime.utcnow() + timedelta(hours=2),
            destination_name=destinations[2]['name'],
            destination_lat=destinations[2]['lat'],
            destination_lng=destinations[2]['lng'],
            intent_type='offering',
            seats_available=3
        )
        ride_intents.append(intent3)
        db.session.add(intent3)
        
        # Dave seeking a ride
        intent4 = RideIntent(
            user_id=users[3].id,
            station='Delhi Central',
            arrival_time=datetime.utcnow() + timedelta(hours=2.2),
            destination_name=destinations[0]['name'],
            destination_lat=destinations[0]['lat'],
            destination_lng=destinations[0]['lng'],
            intent_type='seeking',
            seats_needed=1
        )
        ride_intents.append(intent4)
        db.session.add(intent4)
        
        # Eve offering a ride
        intent5 = RideIntent(
            user_id=users[4].id,
            station='Delhi Central',
            arrival_time=datetime.utcnow() + timedelta(hours=2),
            destination_name=destinations[4]['name'],
            destination_lat=destinations[4]['lat'],
            destination_lng=destinations[4]['lng'],
            intent_type='offering',
            seats_available=2
        )
        ride_intents.append(intent5)
        db.session.add(intent5)
        
        db.session.commit()
        print(f"Created {len(ride_intents)} ride intents")
        
        # Create sample ride requests
        print("Creating sample ride requests...")
        request1 = RideRequest(
            sender_id=users[1].id,
            receiver_id=users[0].id,
            ride_intent_id=intent1.id,
            status='pending'
        )
        db.session.add(request1)
        
        request2 = RideRequest(
            sender_id=users[3].id,
            receiver_id=users[0].id,
            ride_intent_id=intent1.id,
            status='accepted'
        )
        db.session.add(request2)
        
        db.session.commit()
        print("Created 2 ride requests")
        
        # Create sample messages for accepted request
        print("Creating sample messages...")
        message1 = Message(
            sender_id=users[3].id,
            ride_request_id=request2.id,
            content="Hi! I'm interested in sharing the ride to Airport T1. What time will you be there?"
        )
        db.session.add(message1)
        
        message2 = Message(
            sender_id=users[0].id,
            ride_request_id=request2.id,
            content="Hi Dave! I'll be arriving around 2 PM at Delhi Central. Looking forward to it!"
        )
        db.session.add(message2)
        
        db.session.commit()
        print("Created 2 sample messages")
        
        print("\nDatabase seeding completed successfully!")
        print(f"Total users: {User.query.count()}")
        print(f"Total ride intents: {RideIntent.query.count()}")
        print(f"Total ride requests: {RideRequest.query.count()}")
        print(f"Total messages: {Message.query.count()}")

if __name__ == '__main__':
    seed_data()
