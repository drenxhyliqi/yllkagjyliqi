from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Request, Response, status

from app.api.deps import CurrentAdmin, DbSession, SessionToken
from app.core.security import verify_password
from app.services.rate_limit import login_limit, password_reset_limit
from app.schemas.auth import (
    AdminOut,
    EmailChange,
    LoginRequest,
    LoginResponse,
    PasswordChange,
    PasswordResetConfirm,
    PasswordResetRequest,
)
from app.services import notification_service, password_reset_service
from app.services.auth_service import (
    authenticate,
    change_email,
    change_password,
    create_session,
    normalize_email,
    revoke_session,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(body: LoginRequest, db: DbSession) -> LoginResponse:
    key = normalize_email(body.email)

    retry_after = login_limit.retry_after(db, key)
    if retry_after is not None:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many sign-in attempts. Please wait a few minutes and try again.",
            headers={"Retry-After": str(retry_after)},
        )

    admin = authenticate(db, body.email, body.password)
    if admin is None:
        login_limit.hit(db, key)
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Email or password is incorrect."
        )

    login_limit.reset(db, key)
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


def _confirm_password(db, admin, password: str) -> None:
    """Account changes need the current password, with the same throttle as sign-in."""
    key = f"account:{admin.id}"
    retry_after = login_limit.retry_after(db, key)
    if retry_after is not None:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many attempts. Please wait a few minutes and try again.",
            headers={"Retry-After": str(retry_after)},
        )
    if not verify_password(admin.password_hash, password):
        login_limit.hit(db, key)
        # 403, not 401: the session is fine, the password isn't.
        raise HTTPException(status.HTTP_403_FORBIDDEN, "The current password is incorrect.")
    login_limit.reset(db, key)


@router.put("/me/email")
def update_email(body: EmailChange, admin: CurrentAdmin, db: DbSession) -> AdminOut:
    _confirm_password(db, admin, body.current_password)
    return AdminOut.model_validate(change_email(db, admin, body.email))


@router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_password(
    body: PasswordChange, admin: CurrentAdmin, token: SessionToken, db: DbSession
) -> Response:
    _confirm_password(db, admin, body.current_password)
    if body.new_password == body.current_password:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "The new password must be different."
        )
    change_password(db, admin, body.new_password, keep_token=token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/password-reset", status_code=status.HTTP_202_ACCEPTED)
def request_password_reset(
    body: PasswordResetRequest,
    request: Request,
    db: DbSession,
    tasks: BackgroundTasks,
    x_client_ip: str | None = Header(default=None, alias="X-Client-IP"),
) -> dict[str, str]:
    """Always the same answer, so nobody can find out which emails have an account."""
    answer = {"message": "If this email has an account, a link is on its way."}
    client = x_client_ip or (request.client.host if request.client else "unknown")
    email = normalize_email(body.email)
    for key in (f"email:{email}", f"client:{client}"):
        if password_reset_limit.retry_after(db, key) is not None:
            return answer
    for key in (f"email:{email}", f"client:{client}"):
        password_reset_limit.hit(db, key)
    message = password_reset_service.start(db, email)
    if message is not None:
        tasks.add_task(notification_service.send, message)
    return answer


@router.post("/password-reset/confirm", status_code=status.HTTP_204_NO_CONTENT)
def confirm_password_reset(body: PasswordResetConfirm, db: DbSession) -> Response:
    password_reset_service.finish(db, body.token, body.new_password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
