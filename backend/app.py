from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime
from werkzeug.utils import secure_filename
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create the Flask app
app = Flask(__name__)

# CORS middleware
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///marketplace.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize database
with app.app_context():
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if not os.path.exists('uploads'):
    os.makedirs('uploads')

db = SQLAlchemy(app)

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    listings = db.relationship('Listing', backref='seller', lazy=True)
    messages_sent = db.relationship('Message', foreign_keys='Message.sender_id', backref='sender', lazy=True)
    messages_received = db.relationship('Message', foreign_keys='Message.receiver_id', backref='receiver', lazy=True)

class Listing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    is_rental = db.Column(db.Boolean, default=False)
    rental_duration = db.Column(db.Integer)  # in hours
    images = db.Column(db.Text)  # comma-separated paths
    video = db.Column(db.String(200))
    category = db.Column(db.String(50))
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_available = db.Column(db.Boolean, default=True)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        # Get JSON data
        data = request.get_json()
        if not data:
            logger.error("No data received in registration request")
            return jsonify({
                'success': False,
                'error': 'No data received',
                'message': 'Please provide registration data'
            }), 400

        # Validate required fields
        required_fields = ['username', 'email', 'password']
        if not all(field in data for field in required_fields):
            logger.error("Missing required fields in registration request")
            return jsonify({
                'success': False,
                'error': 'Missing required fields',
                'message': 'Please provide username, email, and password'
            }), 400

        # Validate username
        username = data['username'].strip()
        if not username:
            logger.error("Empty username in registration request")
            return jsonify({
                'success': False,
                'error': 'Invalid username',
                'message': 'Username cannot be empty'
            }), 400
        if User.query.filter_by(username=username).first():
            logger.error(f"Username {username} already exists")
            return jsonify({
                'success': False,
                'error': 'Username already exists',
                'message': 'This username is already taken'
            }), 400

        # Validate email
        email = data['email'].strip()
        if not email:
            logger.error("Empty email in registration request")
            return jsonify({
                'success': False,
                'error': 'Invalid email',
                'message': 'Email cannot be empty'
            }), 400
        if not '@' in email:
            logger.error("Invalid email format in registration request")
            return jsonify({
                'success': False,
                'error': 'Invalid email',
                'message': 'Please enter a valid email address'
            }), 400
        if User.query.filter_by(email=email).first():
            logger.error(f"Email {email} already registered")
            return jsonify({
                'success': False,
                'error': 'Email already registered',
                'message': 'This email is already registered'
            }), 400

        # Validate password
        password = data['password']
        if not password:
            logger.error("Empty password in registration request")
            return jsonify({
                'success': False,
                'error': 'Invalid password',
                'message': 'Password cannot be empty'
            }), 400
        if len(password) < 6:
            logger.error("Password too short in registration request")
            return jsonify({
                'success': False,
                'error': 'Password too short',
                'message': 'Password must be at least 6 characters long'
            }), 400

        # Create user
        try:
            hashed_password = generate_password_hash(password)
            new_user = User(
                username=username,
                email=email,
                password_hash=hashed_password
            )
            db.session.add(new_user)
            db.session.commit()
            
            logger.info(f"User created successfully: {username}")
            return jsonify({
                'success': True,
                'message': 'User registered successfully',
                'user': {
                    'username': username,
                    'email': email
                }
            }), 201
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error during user creation: {str(e)}")
            return jsonify({
                'success': False,
                'error': 'Database error',
                'message': 'Failed to create user account'
            }), 500
            
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'message': 'An unexpected error occurred during registration'
        }), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and check_password_hash(user.password_hash, data['password']):
            login_user(user)
            # Generate a token
            token = generate_password_hash(str(user.id) + str(datetime.utcnow()))
            return jsonify({
                'message': 'Logged in successfully',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'token': token
            }), 200
        return jsonify({
            'error': 'Invalid username or password'
        }), 401
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/listings', methods=['GET'])
def get_listings():
    try:
        listings = Listing.query.all()
        return jsonify([{
            'id': listing.id,
            'title': listing.title,
            'description': listing.description,
            'price': listing.price,
            'is_rental': listing.is_rental,
            'category': listing.category,
            'seller': listing.seller.username,
            'created_at': listing.created_at.isoformat()
        } for listing in listings])
    except Exception as e:
        logger.error(f"Error fetching listings: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/listings/<int:id>', methods=['GET'])
def get_listing(id):
    try:
        listing = Listing.query.get_or_404(id)
        return jsonify({
            'id': listing.id,
            'title': listing.title,
            'description': listing.description,
            'price': listing.price,
            'is_rental': listing.is_rental,
            'rental_duration': listing.rental_duration,
            'images': listing.images,
            'video': listing.video,
            'category': listing.category,
            'seller': listing.seller.username,
            'created_at': listing.created_at.isoformat()
        })
    except Exception as e:
        logger.error(f"Error fetching listing: {str(e)}")
        return jsonify({'error': str(e)}), 404

@app.route('/api/listings', methods=['POST'])
@login_required
def create_listing():
    try:
        if 'title' not in request.form or 'description' not in request.form or 'price' not in request.form:
            return jsonify({'error': 'Missing required fields'}), 400

        images = []
        if 'images' in request.files:
            for image in request.files.getlist('images'):
                if image and allowed_file(image.filename):
                    filename = secure_filename(f"{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{image.filename}")
                    image.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    images.append(filename)

        video = None
        if 'video' in request.files:
            video_file = request.files['video']
            if video_file and allowed_file(video_file.filename):
                video = secure_filename(f"{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{video_file.filename}")
                video_file.save(os.path.join(app.config['UPLOAD_FOLDER'], video))

        listing = Listing(
            title=request.form['title'],
            description=request.form['description'],
            price=float(request.form['price']),
            is_rental=bool(request.form.get('is_rental', False)),
            rental_duration=int(request.form.get('rental_duration', 0)),
            images=','.join(images),
            video=video,
            category=request.form.get('category'),
            seller_id=current_user.id
        )
        
        try:
            db.session.add(listing)
            db.session.commit()
            logger.info(f"Listing created successfully: {listing.title}")
            return jsonify({'message': 'Listing created successfully'}), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error during listing creation: {str(e)}")
            return jsonify({'error': 'Database error during listing creation'}), 500
            
    except Exception as e:
        logger.error(f"Error creating listing: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/messages', methods=['GET'])
@login_required
def get_messages():
    try:
        messages = Message.query.filter(
            (Message.sender_id == current_user.id) | (Message.receiver_id == current_user.id)
        ).order_by(Message.timestamp.desc()).all()
        return jsonify([{
            'id': msg.id,
            'sender_id': msg.sender_id,
            'receiver_id': msg.receiver_id,
            'listing_id': msg.listing_id,
            'content': msg.content,
            'timestamp': msg.timestamp.isoformat(),
            'sender': msg.sender.username,
            'receiver': msg.receiver.username
        } for msg in messages])
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/messages', methods=['POST'])
@login_required
def send_message():
    try:
        data = request.get_json()
        required_fields = ['receiver_id', 'listing_id', 'content']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        message = Message(
            sender_id=current_user.id,
            receiver_id=data['receiver_id'],
            listing_id=data['listing_id'],
            content=data['content']
        )
        
        try:
            db.session.add(message)
            db.session.commit()
            logger.info(f"Message sent successfully")
            return jsonify({'message': 'Message sent successfully'}), 201
        except Exception as e:
            db.session.rollback()
            logger.error(f"Database error during message creation: {str(e)}")
            return jsonify({'error': 'Database error during message creation'}), 500
            
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        logger.error(f"Error serving uploaded file: {str(e)}")
        return jsonify({'error': str(e)}), 404

def init_db():
    try:
        with app.app_context():
            # Create tables if they don't exist
            db.create_all()
            print("Database tables created")
            
            # Check if tables were created and create test user if needed
            if not User.query.first():
                test_user = User(
                    username="testuser",
                    email="test@example.com",
                    password_hash=generate_password_hash("testpassword")
                )
                db.session.add(test_user)
                db.session.commit()
                print("Test user created")
            print("Database initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

if __name__ == '__main__':
    try:
        # Initialize database
        with app.app_context():
            print("Initializing database...")
            init_db()
        print("Starting Flask server...")
        app.run(debug=True, port=5000)
    except Exception as e:
        logger.error(f"Application startup error: {str(e)}")
        print(f"Error starting application: {str(e)}")
