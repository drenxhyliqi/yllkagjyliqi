import uuid
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints

Email = Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=254)]
Password = Annotated[str, StringConstraints(min_length=1, max_length=1024)]


class LoginRequest(BaseModel):
    email: Email
    password: Password


class AdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str


class LoginResponse(BaseModel):
    token: str
    expires_at: datetime
    admin: AdminOut
