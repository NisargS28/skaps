import re

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> list:
    """
    Splits text into chunks of a maximum character size with a specified overlap.
    Normalizes consecutive whitespace, filters out small chunks (under 50 chars).
    """
    if not text:
        return []

    # Normalize whitespaces: compress multiple whitespaces to single spaces/newlines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n+', '\n', text)
    text = text.strip()

    if len(text) < 50:
        return [text] if len(text) >= 10 else []

    chunks = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = start + chunk_size
        
        # If we are not at the end of the text, try to find a natural boundary (newline or space)
        if end < text_len:
            # Look backwards up to overlap characters to find a nice place to split
            boundary = -1
            search_start = end - min(overlap, chunk_size // 2)
            
            # Prefer split at paragraph boundary (double newline or single newline)
            newline_idx = text.rfind('\n', search_start, end)
            if newline_idx != -1:
                boundary = newline_idx
            else:
                # Otherwise, split at space
                space_idx = text.rfind(' ', search_start, end)
                if space_idx != -1:
                    boundary = space_idx
            
            if boundary != -1:
                end = boundary + 1 # Include the space/newline in current chunk

        chunk = text[start:end].strip()
        
        # Reject tiny chunks under 50 characters
        if len(chunk) >= 50:
            chunks.append(chunk)

        # Move starting pointer, accounting for overlap
        start = end - overlap
        
        # Guard to prevent infinite loop if overlap >= chunk_size
        if overlap >= chunk_size:
            start = end
        
        # If the remaining text is extremely small, we don't need a separate chunk
        if text_len - start < 50:
            break

    # If nothing was generated but we have enough text, add the whole thing as a single chunk
    if not chunks and len(text) >= 50:
        chunks.append(text)

    return chunks
