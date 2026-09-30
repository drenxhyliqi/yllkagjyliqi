"""
Admin account management.

    python -m app.cli create-admin --email yllka@example.com --name "Yllka"

Prompts for the password. If the email already exists, its name and password
are updated and every signed-in device is signed out.
"""

import argparse
import getpass
import os
import sys

from sqlalchemy import delete, select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Admin, AdminSession
from app.services.auth_service import normalize_email

MIN_PASSWORD_LENGTH = 10


def read_password(env_var: str | None) -> str:
    if env_var:
        password = os.environ.get(env_var, "")
        if not password:
            sys.exit(f"Environment variable {env_var} is empty or not set.")
        return password

    password = getpass.getpass("Password: ")
    if getpass.getpass("Repeat password: ") != password:
        sys.exit("Passwords do not match.")
    return password


def create_admin(email: str, name: str, password_env: str | None) -> None:
    email = normalize_email(email)
    if "@" not in email:
        sys.exit("Please enter a valid email address.")

    password = read_password(password_env)
    if len(password) < MIN_PASSWORD_LENGTH:
        sys.exit(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")

    with SessionLocal() as db:
        admin = db.scalar(select(Admin).where(Admin.email == email))
        if admin is None:
            db.add(Admin(email=email, name=name, password_hash=hash_password(password)))
            action = "Created"
        else:
            admin.name = name
            admin.password_hash = hash_password(password)
            admin.is_active = True
            db.execute(delete(AdminSession).where(AdminSession.admin_id == admin.id))
            action = "Updated"
        db.commit()

    print(f"{action} admin {email}.")


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    commands = parser.add_subparsers(dest="command", required=True)

    create = commands.add_parser("create-admin", help="Create an admin or reset their password.")
    create.add_argument("--email", required=True)
    create.add_argument("--name", required=True)
    create.add_argument(
        "--password-env",
        metavar="VAR",
        help="Read the password from this environment variable instead of prompting.",
    )

    args = parser.parse_args()
    if args.command == "create-admin":
        create_admin(args.email, args.name, args.password_env)


if __name__ == "__main__":
    main()
