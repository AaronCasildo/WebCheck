# routes/pdf.py
# PDF upload and processing endpoints

import json
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException

from services.pdf_service import extract_text_from_pdf
from services.ai_service import analyze_lab_results

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    """
    Upload a PDF file and get AI-powered analysis of lab results.
    """
    logger.info(f"📥 Recibiendo archivo: {file.filename}")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF.")
    
    # Read PDF content
    pdf_bytes = await file.read()
    logger.info(f"✅ PDF leído: {len(pdf_bytes)} bytes")
    
    try:
        # Extract text from PDF
        texto_completo, num_paginas = extract_text_from_pdf(pdf_bytes)
        
        # Generate AI analysis
        analysis_result_str = analyze_lab_results(texto_completo)
        logger.info(f"🤖 Respuesta de IA recibida: {analysis_result_str[:200]}...")
        
        # Parse JSON response
        try:
            analysis_result_json = json.loads(analysis_result_str)
        except json.JSONDecodeError:
            logger.error("Error al decodificar la respuesta JSON de la IA. Enviando como texto plano.")
            analysis_result_json = {
                "interpretacionConceptos": "Error: La respuesta de la IA no estaba en formato JSON válido.",
                "resultadosSimplificados": analysis_result_str,
                "resumenEjecutivo": "No se pudo procesar la respuesta."
            }
        
        return {
            "message": "PDF procesado correctamente",
            "filename": file.filename,
            "pages": num_paginas,
            "analysis_result": analysis_result_json
        }
        
    except Exception as e:
        logger.error(f"❌ Error procesando PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")
