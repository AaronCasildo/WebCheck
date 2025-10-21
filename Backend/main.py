from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    logger.info(f"📥 Recibiendo archivo: {file.filename}")
    logger.info(f"Content-Type: {file.content_type}")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be PDF")
    
    pdf_bytes = await file.read()
    logger.info(f"✅ PDF leído correctamente: {len(pdf_bytes)} bytes")
    
    return {
        "message": "PDF recibido correctamente",
        "filename": file.filename,
        "size": len(pdf_bytes),
        "status": "success"
    }