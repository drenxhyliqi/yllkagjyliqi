import uuid
from datetime import datetime
from typing import Annotated

import re

from pydantic import BaseModel, ConfigDict, StringConstraints, field_validator

Email = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=254)]
Password = Annotated[str, StringConstraints(min_length=1, max_length=1024)]


class LoginRequest(BaseModel):
    email: Email
    password: Password


# Same rule as the command-line tool.
MIN_PASSWORD_LENGTH = 10


class EmailChange(BaseModel):
    email: Email
    current_password: Password

    @field_validator("email")
    @classmethod
    def looks_like_email(cls, value: str) -> str:
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$", value):
            raise ValueError("Please enter a valid email address.")
        return value


class PasswordChange(BaseModel):
    current_password: Password
    new_password: Annotated[str, StringConstraints(min_length=MIN_PASSWORD_LENGTH, max_length=1024)]


class PasswordResetRequest(BaseModel):
    email: Email


class PasswordResetConfirm(BaseModel):
    token: Annotated[str, StringConstraints(min_length=20, max_length=200)]
    new_password: Annotated[str, StringConstraints(min_length=MIN_PASSWORD_LENGTH, max_length=1024)]


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str


class LoginResponse(BaseModel):
    token: str
    expires_at: datetime
    admin: AdminOut
