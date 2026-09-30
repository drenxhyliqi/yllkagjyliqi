from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Admin
from app.services.auth_service import get_admin_by_token

DbSession = Annotated[Session, Depends(get_db)]

_bearer = HTTPBearer(auto_error=False)


def get_session_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> str:
    if credentials is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Please sign in.")
    return credentials.credentials


def get_current_admin(
    token: Annotated[str, Depends(get_session_token)], db: DbSession
) -> Admin:
    admin = get_admin_by_token(db, token)
    if admin is None:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Your session has expired. Please sign in again.",
        )
    return admin


SessionToken = Annotated[str, Depends(get_session_token)]
CurrentAdmin = Annotated[Admin, Depends(get_current_admin)]
