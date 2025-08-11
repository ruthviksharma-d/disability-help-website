# Disability Support India

**Disability Support India** is an accessibility-first web platform that centralizes disability-related services, benefits, and support information across India. It helps persons with disabilities quickly find city-specific resources such as government schemes, emergency contacts, help centers, events, and assistive tools — all with a strong focus on WCAG-compliant design and multilingual accessibility.

---

## 🏗️ Architecture & Technology Stack
- **Backend:** Flask (Python)
- **Frontend:** HTML5, CSS3, JavaScript, Bootstrap 5
- **Data Storage:** JSON files
- **Maps:** Leaflet.js
- **Icons:** Font Awesome

---

## 📁 Project Structure

### Backend
- **`app.py`** – Main Flask application with routes and APIs  
- **`main.py`** – Entry point to run the app

---

### Data (`/data/`)
- `cities.json` – 8 major Indian cities with helplines  
- `events.json` – Events, workshops, programs  
- `help_centers.json` – NGOs, hospitals, govt offices  
- `schemes.json` – National and state-level disability schemes

---

### Static Assets (`/static/`)
- `CSS/style.css` – Accessibility-focused styles, dark/light mode, high contrast
- `JS/main.js` – Core site functionality  
- `JS/accessibility.js` – Screen reader, font scaling, keyboard shortcuts

---

### Templates (`/templates/`)
- `base.html` – Layout with accessibility toolbar  
- `index.html` – Home page with city selector  
- `city_dashboard.html` – City-specific info  
- `schemes.html` – Filterable list of schemes  
- `events.html` – Event listings  
- `assistive_products.html` – Assistive technology info  
- `legal_rights.html` – RPWD Act 2016 rights  
- `emergency_help.html` – 24/7 helplines  
- `contact.html` – Contact info  
- `reservations.html` – Reservation details for PwD

---

## 🎯 Key Features

### Accessibility-First Design
- WCAG 2.1 AA compliance
- Screen reader & text-to-speech
- High contrast & font scaling
- Keyboard navigation shortcuts
- Dark/light mode
- Multi-language support (8 Indian languages)
---
### Core Functionality
- City auto-detection & manual selection
- Real-time search across all content
- City-specific dashboard
- Scheme filtering by category & type
- Emergency contact quick access
- Help center maps & details
---
### API Endpoints
- `/api/cities` – Get all cities  
- `/api/help-centers/<city>` – City-specific help centers  
- `/api/search` – Search all content types
---
## 🌟 User Experience Highlights
- Mobile-first responsive design
- Works without JavaScript (progressive enhancement)
- Optimized loading & lazy loading
- Clear navigation & structured layout
- Prominent emergency access
---
## 🚀 Getting Started

1. **Install Flask**  
   ```bash
   pip install flask
   ```
2. **Run the application**
   ```bash
   python main.py
   ```
3. **Open in browser**
   ```bash
   http://localhost:5000
   ```
---   
