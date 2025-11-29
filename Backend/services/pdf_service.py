# services/pdf_service.py
# PDF processing and text extraction

import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    """
    Extract text content from a PDF file.
    
    Args:
        pdf_bytes: The PDF file content as bytes
        
    Returns:
        A tuple of (extracted_text, page_count)
    """
    texto_completo = ""
    
    pdf_document = fitz.open(stream=pdf_bytes, filetype="pdf")
    num_paginas = pdf_document.page_count
    logger.info(f"📄 Total de páginas: {num_paginas}")
    
    for page_num in range(num_paginas):
        page = pdf_document.load_page(page_num)
        texto_completo += page.get_text()
    
    pdf_document.close()
    logger.info(f"✅ Texto extraído: {len(texto_completo)} caracteres")
    
    return texto_completo, num_paginas
