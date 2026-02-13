# main.py
# Application entry point - FastAPI setup and router registration

import logging
from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# database and models
from models import db, User, AnalysisResult

from config import CORS_ORIGINS, GEMINI_API_KEY
from routes.pdf import router as pdf_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI
app = FastAPI(
    title="HealthCheck API",
    description="AI-powered laboratory results interpreter",
    version="0.1.0"
)

db.init_app(app)  # Initialize database with FastAPI app

# Create database tables on startup
@app.on_event("startup")
async def startup():
    with app.app_context():
        db.create_all()

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(pdf_router)


# Startup Event
@app.on_event("startup")
async def startup_event():
    """Display startup banner with API information."""
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    gemini_status = "Connected" if GEMINI_API_KEY else "Not configured"
    
    banner = f"""
╔══════════════════════════════════════════════════════════════╗
║                      HEALTHCHECK API                         ║
╠══════════════════════════════════════════════════════════════╣
║  Version: 0.1.0                                              ║
║  Status:  Running                                            ║
║  Time:    {current_time:<46}     ║
╠══════════════════════════════════════════════════════════════╣
║  ENDPOINTS:                                                  ║
║    • GET  /health          - Health check                    ║
║    • POST /upload-pdf      - Upload & analyze PDF            ║
╠══════════════════════════════════════════════════════════════╣
║  CONFIGURATION:                                              ║
║    • Gemini AI: {gemini_status:<43}  ║
║    • Rate Limit: 60 requests/minute                          ║
║    • CORS: Enabled                                           ║
╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)
    logger.info("HealthCheck API started successfully")


@app.get("/health")
@limiter.limit("60/minute")
async def health_check(request: Request):
    """Health check endpoint for monitoring."""
    timestamp = datetime.now().strftime("%H:%M:%S")
    client_ip = request.client.host
    gemini_status = "Up" if GEMINI_API_KEY else "Down"
    
    logger.info(f"[{timestamp}] Health Check | IP: {client_ip} | Gemini: {gemini_status} | Status: OK")
    return {"status": "healthy", "message": "API is operational"}