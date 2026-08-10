import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile, HTTPException, status

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


async def save_upload_file(file: UploadFile, company_id: uuid.UUID) -> str:
    """Validate and save an uploaded file. Returns the saved file path."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided.",
        )

    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file_ext}' not allowed. Allowed types: {settings.ALLOWED_FILE_TYPES}",
        )

    # Validate file size
    contents = await file.read()
    file_size_mb = len(contents) / (1024 * 1024)
    if file_size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size ({file_size_mb:.1f} MB) exceeds maximum ({settings.MAX_UPLOAD_SIZE_MB} MB).",
        )

    # Create company-specific upload directory
    upload_dir = settings.upload_path / str(company_id)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = upload_dir / unique_filename

    # Save file
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(contents)

    saved_path = str(file_path)
    logger.info(f"File saved: {saved_path} ({file_size_mb:.2f} MB)")
    return saved_path
