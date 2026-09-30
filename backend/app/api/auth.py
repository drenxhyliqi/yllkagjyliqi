from fastapi import APIRouter, HTTPException, Response, status

from app.api.deps import CurrentAdmin, DbSession, SessionToken
from app.schemas.auth import AdminOut, LoginRequest, LoginResponse
from app.services.auth_service import (
    authenticate,
    create_session,
    login_throttle,
    normalize_email,
    revoke_session,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(body: LoginRequest, db: DbSession) -> LoginResponse:
    key = normalize_email(body.email)

    retry_after = login_throttle.retry_after(key)
    if retry_after is not None:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many sign-in attempts. Please wait a few minutes and try again.",
            headers={"Retry-After": str(retry_after)},
        )

    admin = authenticate(db, body.email, body.password)
    if admin is None:
        login_throttle.record_failure(key)
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Email or password is incorrect."
        )

    login_throttle.reset(key)
    token, session = create_session(db, admin)
    return LoginResponse(
        token=token,
        expires_at=session.expires_at,
        admin=AdminOut.model_validate(admin),
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(token: SessionToken, db: DbSession) -> Response:
    revoke_session(db, token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me")
def me(admin: CurrentAdmin) -> AdminOut:
    return AdminOut.model_validate(admin)
