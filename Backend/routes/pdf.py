# routes/pdf.py
# PDF upload and processing endpoints

import json
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException

from services.pdf_service import extract_text_from_pdf
from services.ai_service import analyze_lab_results

logger = logging.getLogger(__name__)

router = APIRouter()


def _create_fallback_response(raw_text: str) -> dict:
    """
    Create a user-friendly fallback response when JSON parsing fails.
    """
    # Clean up the raw text - remove JSON artifacts
    cleaned_text = raw_text
    
    # Remove common JSON artifacts that might appear
    import re
    cleaned_text = re.sub(r'^[\s\{]*"?\w+"?\s*:\s*"?', '', cleaned_text)
    cleaned_text = re.sub(r'"\s*,?\s*"?\w+"?\s*:\s*"?', '\n\n', cleaned_text)
    cleaned_text = re.sub(r'"\s*\}?\s*$', '', cleaned_text)
    cleaned_text = cleaned_text.replace('\\n', '\n')
    
    return {
        "interpretacionConceptos": "⚠️ **Nota:** Hubo un problema al estructurar la respuesta. A continuación se muestra el análisis en formato de texto.",
        "resultadosSimplificados": cleaned_text.strip(),
        "resumenEjecutivo": "La respuesta de la IA no pudo ser procesada correctamente. Por favor, revisa los resultados simplificados."
    }


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
        
        # Parse JSON response with better error recovery
        try:
            analysis_result_json = json.loads(analysis_result_str)
        except json.JSONDecodeError as e:
            logger.error(f"Error al decodificar JSON de la IA: {e}")
            
            # Try to extract JSON from response (sometimes AI wraps it in markdown)
            import re
            json_match = re.search(r'\{[\s\S]*\}', analysis_result_str)
            
            if json_match:
                try:
                    analysis_result_json = json.loads(json_match.group())
                    logger.info("✅ JSON extraído exitosamente del texto")
                except json.JSONDecodeError:
                    analysis_result_json = _create_fallback_response(analysis_result_str)
            else:
                analysis_result_json = _create_fallback_response(analysis_result_str)
        
        return {
            "message": "PDF procesado correctamente",
            "filename": file.filename,
            "pages": num_paginas,
            "analysis_result": analysis_result_json
        }
        
    except Exception as e:
        logger.error(f"❌ Error procesando PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")
