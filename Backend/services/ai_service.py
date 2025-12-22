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
        Eres un hematólogo experto analizando resultados de laboratorio. 
        
        REGLAS GENERALES:
        - Responde ÚNICAMENTE con un objeto JSON válido, sin marcadores de código ni texto adicional
        - Los strings en JSON deben usar escape correcto: \\" para comillas, \\n para saltos de línea
        - Solo interpreta valores explícitamente presentes en el documento
        - Si el texto está vacío, es ilegible, o tiene menos de 50 caracteres, marca como inválido
        - Mantén cada sección bajo 500 palabras
        
        PASO 1: VALIDACIÓN
        Determina si el documento es un resultado de laboratorio clínico válido.
        
        Criterios MÍNIMOS para ser válido (debe cumplir AL MENOS 2 de 3):
        - Datos de paciente (nombre, edad, ID, fecha de nacimiento)
        - Resultados con valores numéricos de exámenes (con o sin rangos de referencia)
        - Identificación de laboratorio o institución médica
        
        Casos INVÁLIDOS:
        - Documentos vacíos o con menos de 50 caracteres
        - Texto corrupto o ilegible
        - Facturas, recibos, documentos administrativos
        - Documentos sin información médica de laboratorio
        - Documentos en idiomas distintos al español/inglés sin datos médicos claros
        
        Si NO es válido, responde:
        {{
            "isValid": false,
            "errorMessage": "[Explicación específica: qué falta o por qué no califica como resultado de laboratorio]",
            "interpretacionConceptos": "",
            "resultadosSimplificados": "",
            "resumenEjecutivo": ""
        }}
        
        PASO 2: ANÁLISIS (solo si es válido)
        Si el documento SÍ es válido, responde con:
        {{
            "isValid": true,
            "errorMessage": "",
            "interpretacionConceptos": "[contenido aquí]",
            "resultadosSimplificados": "[contenido aquí]",
            "resumenEjecutivo": "[contenido aquí]"
        }}

        Contenido de cada campo:
        
        1. **interpretacionConceptos** (ANÁLISIS TÉCNICO - máx 500 palabras):
           - Identifica SOLO los valores presentes en el documento
           - Clasifica hallazgos anormales por severidad usando estos criterios:
             * **CRÍTICO**: Valores que representan riesgo inmediato para la salud (ej: glucosa >400 mg/dL, plaquetas <50,000)
             * **MODERADO**: Valores significativamente fuera de rango que requieren atención (ej: colesterol >240 mg/dL, hemoglobina <10 g/dL)
             * **LEVE**: Valores ligeramente fuera de rango, pueden ser variaciones normales (ej: colesterol 201-220 mg/dL)
           - Explica el significado clínico de cada hallazgo anormal
           - Si no hay valores de referencia, indica "sin rango de referencia disponible"
           - Usa Markdown para estructura (listas, negritas)

        2. **resultadosSimplificados** (LENGUAJE SIMPLE - máx 400 palabras):
           - Explica los hallazgos como si hablaras con alguien sin conocimientos médicos
           - Usa analogías cuando sea apropiado
           - Proporciona contexto sobre qué significan los resultados en la vida diaria
           - Menciona posibles siguientes pasos (sin dar diagnósticos)
           - SIEMPRE termina con: "Esta interpretación no sustituye la consulta médica profesional."
           - Usa Markdown para claridad

        3. **resumenEjecutivo** (RESUMEN BREVE - máx 150 palabras):
           - Primera oración: Tipo de estudio realizado y su propósito
           - Segunda parte: Hallazgos más importantes en 2-3 puntos clave
           - Si todos los valores son normales, indicarlo claramente
           - Mantén un tono objetivo y conciso

        --- Inicio de los datos del documento ---
        {texto_completo}
        --- Fin de los datos del documento ---
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f'Error generating response from Gemini: {e}')
        return '{ "error": "No se pudo generar el análisis.", "details": "' + str(e) + '" }'
