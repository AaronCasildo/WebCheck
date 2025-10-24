# Initialize the service by executing: uvicorn main:app --reload 
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import google.generativeai as genai
from dotenv import load_dotenv
import os
import logging

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
        try:
            response = model.generate_content(
                contents=f"""Eres un hematólogo experto analizando resultados de laboratorio. Tu tarea tiene tres partes:
                    1. ANÁLISIS TÉCNICO:
                    - Identifica todos los valores fuera del rango normal
                    - Clasifica cada hallazgo por nivel de severidad (crítico, moderado, leve)
                    - Detecta patrones o relaciones entre diferentes parámetros

                    2. INTERPRETACIÓN CLÍNICA:
                    - Explica qué significa cada valor anormal para la salud del paciente
                    - Identifica posibles condiciones o riesgos asociados
                    - Destaca cualquier hallazgo que requiera atención inmediata

                    3. EXPLICACIÓN PARA EL PACIENTE:
                    - Traduce los hallazgos a lenguaje simple y claro
                    - Usa analogías cuando sea apropiado
                    - Proporciona contexto sobre qué acciones podría considerar (sin sustituir consulta médica)

                    FORMATO DE RESPUESTA:
                    - Usa secciones claramente definidas
                    - Destaca los puntos críticos
                    - Evita alarmismo innecesario pero sé honesto sobre riesgos reales
                    - Incluye un resumen ejecutivo al inicio

                    RECORDATORIO IMPORTANTE: Esta es una interpretación informativa. Siempre recomienda consultar con su médico tratante para decisiones clínicas.

                    RESULTADOS DE LABORATORIO:
                    {texto_completo}"""
            )
            return response.text
        
        except Exception as e: 
            logger.error(f'Error generating response: {e}')

    logger.info(f"📥 Recibiendo archivo: {file.filename}")
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be PDF")
    
    # Leer el PDF
    pdf_bytes = await file.read()
    logger.info(f"✅ PDF leído: {len(pdf_bytes)} bytes")
    
    # Convertir PDF a texto
    texto_completo = ""
    try:
        # Abrir el PDF desde bytes
        pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        num_paginas = pdf_document.page_count  # Guardar antes de cerrar
        logger.info(f"📄 Total de páginas: {num_paginas}")
        
        # Extraer texto de cada página
        for page_num in range(num_paginas):
            page = pdf_document[page_num]
            texto_pagina = page.get_text()
            texto_completo += f"\n--- Página {page_num + 1} ---\n"
            texto_completo += texto_pagina
        
        pdf_document.close()  # Cerrar después de extraer todo
        
        logger.info(f"✅ Texto extraído: {len(texto_completo)} caracteres")
        
        # Guardar el texto en un archivo .txt
        nombre_txt = file.filename.replace('.pdf', '.txt')
        ruta_txt = Path("outputs") / nombre_txt
        
        # Crear carpeta outputs si no existe
        ruta_txt.parent.mkdir(exist_ok=True)
        
        # Guardar el archivo
        with open(ruta_txt, 'w', encoding='utf-8') as f:
            f.write(texto_completo)
        
        logger.info(f"💾 Archivo guardado en: {ruta_txt}")
        
        # Mostrar primeros 500 caracteres en consola
        print("\n" + "="*50)
        print("TEXTO EXTRAÍDO (primeros 500 caracteres):")
        print("="*50)
        print(texto_completo[:500])
        print("="*50 + "\n")

        try:   
            result = generate_response(texto_completo)
            print (result)
        except Exception as e: 
            logger.error(f'Error generating response: {e}')
        
        return {
            "message": "PDF procesado correctamente",
            "filename": file.filename,
            "txt_filename": nombre_txt,
            "pdf_size": len(pdf_bytes),
            "pages": num_paginas,  # Usar la variable guardada
            "text_length": len(texto_completo),
            "text_preview": texto_completo[:200] + "..." if len(texto_completo) > 200 else texto_completo,
            "saved_path": str(ruta_txt),
            "analysis_result": result
        }    
    except Exception as e:
        logger.error(f"❌ Error procesando PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error procesando PDF: {str(e)}")