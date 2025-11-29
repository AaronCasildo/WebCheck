# services/ai_service.py
# AI analysis using Google Gemini

import google.generativeai as genai
import logging
from config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Configure model to always return JSON
generation_config = genai.types.GenerationConfig(
    response_mime_type="application/json"
)

model = genai.GenerativeModel(
    GEMINI_MODEL,
    generation_config=generation_config
)


def analyze_lab_results(texto_completo: str) -> str:
    """
    Analyze laboratory results using Gemini AI.
    
    Args:
        texto_completo: The extracted text from the lab results PDF
        
    Returns:
        JSON string with the analysis results
    """
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
        return '{ "error": "No se pudo generar el análisis.", "details": "' + str(e) + '" }'
