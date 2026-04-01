# HealthCheck - Intelligent Laboratory Results Interpreter

<div align="center">

![Project Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

**Transform complex laboratory results into clear, understandable insights**

</div>

---

## About the Project

**HealthCheck** is a web application that uses artificial intelligence to interpret blood test results, translating complex medical terminology into clear and understandable language for patients.

### What does it do?

- Upload laboratory results in PDF format
- Intelligent analysis powered by Google Gemini AI
- Interpretation in simple and accessible language
- Medical perspective specialized in hematology
- Secure processing of sensitive information
- Download results as professional PDF reports
- Dark mode support for comfortable viewing

---

## Medical Disclaimer
   
**HealthCheck is NOT a medical device.**
   
This tool is for informational purposes only. Do not use it for diagnosis or treatment. Always consult a qualified healthcare professional. AI-generated results may contain inaccuracies and do not replace professional medical interpretation.

---

## Screenshots

### Home Page
<img width="1920" height="953" alt="image" src="https://github.com/user-attachments/assets/41f642c8-df3e-4e18-82b6-f68102a91e7f" />
<img width="1920" height="943" alt="image" src="https://github.com/user-attachments/assets/681dca5a-fa38-4886-8aa6-3ee4e1c27f14" />

### Analysis in Progress
<img width="1920" height="951" alt="image" src="https://github.com/user-attachments/assets/354702d2-5c78-410d-bcb0-0118c9be3a6a" />

### Results Page
<img width="1920" height="951" alt="image" src="https://github.com/user-attachments/assets/3f5509a9-43c4-4d9b-bdfd-2b22aaf16bbb" />
<img width="1920" height="947" alt="image" src="https://github.com/user-attachments/assets/372ed164-ff83-40ad-b2a0-c4e6e4c5c13c" />

### PDF Export
<img width="795" height="811" alt="image" src="https://github.com/user-attachments/assets/0a605709-07f0-4330-b590-a6d49f20eb3e" />

---

## Features

### Core Features
| Feature | Description |
|---------|-------------|
| **PDF Upload** | Drag & drop or click to upload laboratory PDFs |
| **AI Analysis** | Powered by Google Gemini 2.5 Flash for accurate interpretation |
| **Dual View** | Technical interpretation + simplified explanation |
| **Executive Summary** | Quick overview of your results |

### User Experience
| Feature | Description |
|---------|-------------|
| **Dark Mode** | Toggle between light and dark themes |
| **Theme Persistence** | Your preference saved automatically |
| **System Detection** | Respects your OS color scheme |
| **Responsive Design** | Works on desktop and mobile |

### Export & Download
| Feature | Description |
|---------|-------------|
| **PDF Export** | Download results as professional PDF |
| **Formatted Report** | Includes header, sections, and disclaimer |
| **Multi-page Support** | Automatic pagination for long results |

### Recent Additions
| Feature | Description |
|---------|-------------|
| **History Page** | View and manage past analysis results |
| **History Manager** | Local storage system for saved analyses |
| **Sort Controls** | Organize history by name (A-Z, Z-A) |
| **Quick Access** | Breadcrumb navigation and direct result links |
| **Processing Time Display** | Shows analysis duration and pages processed |
| **API Status Monitoring** | Enhanced health check with detailed logging |
| **Startup Banner** | Displays API info and configuration on server start |
| **Rate Limiting** | API protection with 60 requests/minute limit |
| **Enhanced Security** | CORS configuration and request validation |
| **Modular Architecture** | Organized routes and services structure |

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.8+** | Core language |
| **FastAPI** | Web framework |
| **PyMuPDF** | PDF text extraction |
| **Google Gemini AI** | AI-based analysis |
| **python-dotenv** | Environment management |

### Frontend
| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **CSS3** | Styling with CSS Variables |
| **JavaScript** | Interactivity |
| **jsPDF** | Client-side PDF generation |
| **marked.js** | Markdown parsing |

---

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/AaronCasildo/WebCheck.git
   cd WebCheck
```

2. **Install dependencies**
```bash
   pip install -r requirements.txt
```

3. **Set up environment variables**

   Create a `.env` file in the `Backend/` folder:
```env
   GEMINI_API_KEY=your_api_key_here
```

4. **Run the server**
```bash
   cd Backend
   uvicorn main:app --reload
```

5. **Open in browser**

   Navigate to `http://localhost:8000` or open `WebCheck.html`

---

## Project Structure
```
WebCheck/
├── WebCheck.html          # Main landing page
├── script.js              # Main JavaScript file
├── requirements.txt       # Python dependencies
├── readme.md              # This file
│
├── Backend/
│   ├── main.py            # FastAPI application
│   ├── config.py          # Configuration settings
│   ├── routes/            # API endpoints
│   │   └── pdf.py         # PDF processing routes
│   ├── services/          # Business logic
│   │   ├── ai_service.py  # Gemini AI integration
│   │   └── pdf_service.py # PDF extraction
│   └── outputs/           # Sample outputs
│
├── Frontend/
│   ├── pages/
│   │   ├── Results.html   # Results display page
│   │   ├── History.html   # History page for past results
│   │   ├── Login.html     # Login page
│   │   └── Register.html  # Registration page
│   ├── scripts/
│   │   ├── modules/
│   │   │   ├── results-page.js    # Results page logic
│   │   │   ├── pdf-generator.js   # PDF export module
│   │   │   └── history.js         # History page logic
│   │   └── utils/
│   │       ├── theme-toggle.js    # Dark mode functionality
│   │       └── history-manager.js # Local storage management
│   └── styles/
│       └── styles.css     # Global styles + theming
│
└── media/                 # Images and icons
```

---

## Contributing

Contributions are welcome. To collaborate:

1. **Fork** the repository
2. **Create** a feature branch
```bash
   git checkout -b feature/AmazingFeature
```
3. **Commit** your changes
```bash
   git commit -m 'feat: add amazing feature'
```
4. **Push** to your branch
```bash
   git push origin feature/AmazingFeature
```
5. **Open** a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring

---

## Developers

**Aaron Casildo Rubalcava · Daniel Romero Bravo**

---

<div align="center">

![Status](https://img.shields.io/badge/Status-Alpha-red?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

Actively in Development – 2025

</div>
