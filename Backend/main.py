# main.py

from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import google.generativeai as genai
from dotenv import load_dotenv
import os
import logging
import json # Importante: Añadir la librería json

# Safe load environment variables
load_dotenv()

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load Gemini API Key from environment variables
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY no encontrada en variables de entorno")

# Initialze FastAPI and GenAI
app = FastAPI()
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash') 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    
    def generate_response(texto_completo):
        prompt = f"""
            Eres un hematólogo experto analizando resultados de laboratorio. Analiza los siguientes resultados y proporciona una respuesta estructurada en formato JSON. El JSON debe contener tres claves principales: "interpretacionConceptos", "resultadosSimplificados" y "resumenEjecutivo".

            1.  **interpretacionConceptos**:
                -   Aquí va el ANÁLISIS TÉCNICO y la INTERPRETACIÓN CLÍNICA.
                -   Identifica valores fuera de rango, clasifícalos por severidad (crítico, moderado, leve) y explica qué significan clínicamente.
                -   Usa formato Markdown para listas y énfasis (ej. **texto en negrita** o - elemento de lista).

            2.  **resultadosSimplificados**:
                -   Aquí va la EXPLICACIÓN PARA EL PACIENTE.
                -   Traduce todos los hallazgos a un lenguaje simple y claro, como si hablaras con una persona sin conocimientos médicos.
                -   Usa analogías y proporciona contexto sobre posibles siguientes pasos (sin sustituir la consulta médica).
                -   Usa formato Markdown.

            3.  **resumenEjecutivo**:
                -   Un párrafo muy breve y conciso con los hallazgos más importantes.

            Asegúrate de que la salida sea un único objeto JSON válido y nada más. No incluyas "```json" o "```" en la respuesta.

            RESULTADOS DE LABORATORIO:
            {texto_completo}
        """
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f'Error generating response from Gemini: {e}')
            # Devuelve un error en formato JSON
            return '{ "error": "No se pudo generar el análisis.", "details": "' + str(e) + '" }'

    logger.info(f"📥 Recibiendo archivo: {file.filename}")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF.")
    
    pdf_bytes = await file.read()
    logger.info(f"✅ PDF leído: {len(pdf_bytes)} bytes")    

    texto_completo = ""
    num_paginas = 0
    try:
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        num_paginas = pdf_document.page_count
        logger.info(f"📄 Total de páginas: {num_paginas}")
        
        for page_num in range(num_paginas):
            page = pdf_document.load_page(page_num)
            texto_completo += page.get_text()
        
        pdf_document.close()
        logger.info(f"✅ Texto extraído: {len(texto_completo)} caracteres")

        # IA analysis generation
        analysis_result_str = generate_response(texto_completo)
        logger.info(f"🤖 Respuesta de IA recibida: {analysis_result_str[:200]}...")
        
        try:
            analysis_result_json = json.loads(analysis_result_str)
        except json.JSONDecodeError:
            # Handle JSON decoding error
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
            "analysis_result": analysis_result_json  # Sending structured JSON response
        }
    except Exception as e:
        logger.error(f"❌ Error procesando PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")