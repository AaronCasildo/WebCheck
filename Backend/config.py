# config.py
# Application configuration and environment variables

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini API Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY no encontrada en variables de entorno")

# CORS Configuration
CORS_ORIGINS = ["*"]  # TODO: Change to specific origins in production

# Model Configuration
GEMINI_MODEL = "gemini-2.5-flash"
