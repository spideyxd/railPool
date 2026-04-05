"""
Database Migration Script - Train Number Feature
Run this script to add the new columns to your ride_intents table

Usage:
    python migrate_train_feature.py
"""

from app import create_app, db
from app.models import RideIntent
from sqlalchemy import text

def migrate_database():
    """Apply database migrations for train number feature"""
    app = create_app()
    
    with app.app_context():
        try:
            print("Starting database migration...")
            
            # Get the database connection
            connection = db.engine.connect()
            
            # Check if columns already exist
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('ride_intents')]
            
            if 'train_number' not in columns:
                print("Adding train_number column...")
                connection.execute(text(
                    'ALTER TABLE ride_intents ADD COLUMN train_number VARCHAR(10)'
                ))
                connection.commit()
                print("✓ train_number column added")
            else:
                print("✓ train_number column already exists")
            
            if 'train_name' not in columns:
                print("Adding train_name column...")
                connection.execute(text(
                    'ALTER TABLE ride_intents ADD COLUMN train_name VARCHAR(255)'
                ))
                connection.commit()
                print("✓ train_name column added")
            else:
                print("✓ train_name column already exists")
            
            if 'arrival_date' not in columns:
                print("Adding arrival_date column...")
                connection.execute(text(
                    'ALTER TABLE ride_intents ADD COLUMN arrival_date DATE'
                ))
                connection.commit()
                print("✓ arrival_date column added")
                
                # Migrate data from arrival_time if it exists
                if 'arrival_time' in columns:
                    print("Migrating data from arrival_time to arrival_date...")
                    connection.execute(text(
                        'UPDATE ride_intents SET arrival_date = DATE(arrival_time) WHERE arrival_date IS NULL'
                    ))
                    connection.commit()
                    print("✓ Data migration completed")
                    
                    # Make arrival_date NOT NULL
                    connection.execute(text(
                        'ALTER TABLE ride_intents ALTER COLUMN arrival_date SET NOT NULL'
                    ))
                    connection.commit()
                    print("✓ arrival_date now required")
                    
                    # Drop old column
                    print("Dropping old arrival_time column...")
                    connection.execute(text(
                        'ALTER TABLE ride_intents DROP COLUMN arrival_time'
                    ))
                    connection.commit()
                    print("✓ arrival_time column removed")
            else:
                print("✓ arrival_date column already exists")
            
            # Create indexes
            print("Creating indexes...")
            connection.execute(text(
                'CREATE INDEX IF NOT EXISTS idx_ride_intents_arrival_date ON ride_intents(arrival_date)'
            ))
            connection.execute(text(
                'CREATE INDEX IF NOT EXISTS idx_ride_intents_train_number ON ride_intents(train_number)'
            ))
            connection.commit()
            print("✓ Indexes created")
            
            print("\n✓ Migration completed successfully!")
            
        except Exception as e:
            print(f"\n✗ Migration failed: {str(e)}")
            connection.rollback()
            raise
        finally:
            connection.close()

if __name__ == '__main__':
    migrate_database()
