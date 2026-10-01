from typing import Annotated

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.api.deps import CurrentAdmin, DbSession
from app.integrations.storage.image_provider import (
    MAX_UPLOAD_BYTES,
    InvalidImage,
    StorageUnavailable,
)
from app.schemas.common import MediaOut
from app.services import media_service

router = APIRouter(prefix="/admin/media", tags=["admin: media"])


@router.post("", status_code=status.HTTP_201_CREATED)
def upload(
    file: Annotated[UploadFile, File()], _: CurrentAdmin, db: DbSession
) -> MediaOut:
    """Uploads one photo. It is kept once saved with a category or a piece of work."""
    # Read one byte past the limit to tell "too large" apart without loading more.
    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    try:
        asset = media_service.upload(db, data)
    except InvalidImage as exc:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, str(exc)) from exc
    except StorageUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    return MediaOut.model_validate(asset)
