import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Every error leaves the API as {"message": "..."}, never as a stack trace."""

    @app.exception_handler(StarletteHTTPException)
    async def http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        message = exc.detail if isinstance(exc.detail, str) else "Request failed."
        return JSONResponse(
            {"message": message}, status_code=exc.status_code, headers=exc.headers
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        errors = [
            {
                "field": ".".join(str(part) for part in error["loc"] if part != "body"),
                "message": error["msg"],
            }
            for error in exc.errors()
        ]
        first = errors[0] if errors else {"field": "", "message": "Invalid request."}
        message = f"{first['field']}: {first['message']}" if first["field"] else first["message"]
        return JSONResponse({"message": message, "errors": errors}, status_code=422)

    @app.exception_handler(Exception)
    async def unexpected_error(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error on %s %s", request.method, request.url.path)
        return JSONResponse(
            {"message": "Something went wrong. Please try again."}, status_code=500
        )


class NotFoundError(Exception):
    """Something the request refers to doesn't exist. The message is shown to people."""


class ConflictError(Exception):
    """The change would leave data in a bad state, e.g. deleting a category in use."""


class InvalidInputError(Exception):
    """Input that passed the schema but doesn't make sense, e.g. an unknown photo id."""


_STATUS = {NotFoundError: 404, ConflictError: 409, InvalidInputError: 422}


def register_domain_errors(app: FastAPI) -> None:
    for error_type, status_code in _STATUS.items():

        async def handler(_: Request, exc: Exception, status_code: int = status_code) -> JSONResponse:
            return JSONResponse({"message": str(exc)}, status_code=status_code)

        app.add_exception_handler(error_type, handler)
