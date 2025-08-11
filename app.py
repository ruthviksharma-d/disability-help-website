import os
import json
import logging
from flask import Flask, render_template, request, jsonify

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "fallback_secret_key_for_development")

# Load data files
def load_json_data(filename):
    try:
        with open(f'data/{filename}', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"Data file {filename} not found")
        return {}
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON in {filename}")
        return {}

@app.route('/')
def index():
    cities_data = load_json_data('cities.json')
    return render_template('index.html', cities=cities_data.get('cities', []))

@app.route('/city/<city_name>')
def city_dashboard(city_name):
    cities_data = load_json_data('cities.json')
    help_centers_data = load_json_data('help_centers.json')
    schemes_data = load_json_data('schemes.json')
    
    # Find city data
    city_info = None
    for city in cities_data.get('cities', []):
        if city['name'].lower() == city_name.lower():
            city_info = city
            break
    
    if not city_info:
        return render_template('city_dashboard.html', 
                             city_name=city_name, 
                             error="City not found"), 404
    
    # Get city-specific help centers
    city_help_centers = help_centers_data.get(city_name.lower(), [])
    
    # Get state-specific schemes
    state_schemes = []
    for scheme in schemes_data.get('schemes', []):
        if scheme.get('state') == city_info.get('state') or scheme.get('type') == 'national':
            state_schemes.append(scheme)
    
    return render_template('city_dashboard.html', 
                         city_info=city_info,
                         help_centers=city_help_centers,
                         schemes=state_schemes[:5])  # Limit to 5 featured schemes

@app.route('/schemes')
def schemes():
    city = request.args.get('city', '')
    schemes_data = load_json_data('schemes.json')
    cities_data = load_json_data('cities.json')
    
    # Filter schemes by city/state if provided
    filtered_schemes = schemes_data.get('schemes', [])
    if city:
        city_info = None
        for c in cities_data.get('cities', []):
            if c['name'].lower() == city.lower():
                city_info = c
                break
        
        if city_info:
            filtered_schemes = [
                scheme for scheme in schemes_data.get('schemes', [])
                if scheme.get('state') == city_info.get('state') or scheme.get('type') == 'national'
            ]
    
    return render_template('schemes.html', schemes=filtered_schemes, current_city=city)

@app.route('/assistive-products')
def assistive_products():
    return render_template('assistive_products.html')

@app.route('/events')
def events():
    city = request.args.get('city', '')
    events_data = load_json_data('events.json')
    
    # Filter events by city if provided
    filtered_events = events_data.get('events', [])
    if city:
        filtered_events = [
            event for event in events_data.get('events', [])
            if event.get('city', '').lower() == city.lower() or event.get('type') == 'national'
        ]
    
    return render_template('events.html', events=filtered_events, current_city=city)

@app.route('/reservations')
def reservations():
    return render_template('reservations.html')

@app.route('/legal-rights')
def legal_rights():
    return render_template('legal_rights.html')

@app.route('/emergency-help')
def emergency_help():
    return render_template('emergency_help.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

# API endpoints for dynamic content
@app.route('/api/cities')
def api_cities():
    cities_data = load_json_data('cities.json')
    return jsonify(cities_data)

@app.route('/api/help-centers/<city_name>')
def api_help_centers(city_name):
    help_centers_data = load_json_data('help_centers.json')
    city_centers = help_centers_data.get(city_name.lower(), [])
    return jsonify(city_centers)

@app.route('/api/search')
def api_search():
    query = request.args.get('q', '').lower()
    city = request.args.get('city', '')
    
    results = []
    
    # Search in schemes
    schemes_data = load_json_data('schemes.json')
    for scheme in schemes_data.get('schemes', []):
        if query in scheme.get('name', '').lower() or query in scheme.get('description', '').lower():
            results.append({
                'type': 'scheme',
                'title': scheme.get('name'),
                'description': scheme.get('description'),
                'url': f'/schemes?city={city}'
            })
    
    # Search in help centers
    if city:
        help_centers_data = load_json_data('help_centers.json')
        for center in help_centers_data.get(city.lower(), []):
            if query in center.get('name', '').lower() or query in center.get('type', '').lower():
                results.append({
                    'type': 'help_center',
                    'title': center.get('name'),
                    'description': center.get('type'),
                    'url': f'/city/{city}'
                })
    
    return jsonify(results[:10])  # Limit to 10 results

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
