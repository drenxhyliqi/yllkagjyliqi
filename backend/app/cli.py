"""
Command-line tasks.

    python -m app.cli create-admin --email yllka@example.com --name "Yllka"
    python -m app.cli ensure-admin  # first admin from INITIAL_ADMIN_* variables
    python -m app.cli seed-demo     # development only

Prompts for the password. If the email already exists, its name and password
are updated and every signed-in device is signed out.
"""

import argparse
import getpass
import os
import sys

from sqlalchemy import delete, func, select

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


def ensure_admin() -> str:
    """
    Creates the first admin from INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD
    (and optionally INITIAL_ADMIN_NAME), but only while there is no admin at
    all: it never changes or resets an existing account. Run on every start in
    production, so the first sign-in needs no server access.
    """
    email = normalize_email(os.environ.get("INITIAL_ADMIN_EMAIL", ""))
    password = os.environ.get("INITIAL_ADMIN_PASSWORD", "")
    name = os.environ.get("INITIAL_ADMIN_NAME", "").strip() or "Yllka"
    if not email or not password:
        return "No INITIAL_ADMIN_* variables; nothing to do."

    with SessionLocal() as db:
        if db.scalar(select(func.count()).select_from(Admin)):
            return "An admin already exists; INITIAL_ADMIN_* ignored (remove them)."
        if "@" not in email or len(password) < MIN_PASSWORD_LENGTH:
            return f"INITIAL_ADMIN_* not used: need an email and a password of {MIN_PASSWORD_LENGTH}+ characters."
        db.add(Admin(email=email, name=name, password_hash=hash_password(password)))
        db.commit()
    return f"Created the first admin {email}."


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

    commands.add_parser("seed-demo", help="Load placeholder content (development only).")
    commands.add_parser("ensure-admin", help="Create the first admin from INITIAL_ADMIN_* variables.")

    args = parser.parse_args()
    if args.command == "create-admin":
        create_admin(args.email, args.name, args.password_env)
    elif args.command == "ensure-admin":
        print(ensure_admin())
    elif args.command == "seed-demo":
        from app.demo.seed import seed_demo

        with SessionLocal() as db:
            print(seed_demo(db))


if __name__ == "__main__":
    main()
