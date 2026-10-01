import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, String, func, text
from sqlalchemy.dialects.postgresql import ExcludeConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin
from app.models.service import Service

# expired: a request nobody answered before its time had passed.
STATUSES = ("pending", "confirmed", "declined", "cancelled", "completed", "no_show", "expired")
# Bookings that still need Yllka's attention or are going ahead.
ACTIVE_STATUSES = ("pending", "confirmed")
# Only confirmed bookings take a time off the website. Requests (pending) can
# overlap each other; Yllka sees the clash and decides which to accept.
HOLDING_STATUS = "confirmed"


class Booking(TimestampMixin, Base):
    """An appointment request or appointment."""

    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint(f"status IN {STATUSES}", name="status"),
        CheckConstraint("source IN ('website', 'admin')", name="source"),
        CheckConstraint("locale IN ('sq', 'en')", name="locale"),
        CheckConstraint("location IN ('studio', 'client')", name="location"),
        CheckConstraint("cancelled_by IN ('client', 'admin')", name="cancelled_by"),
        CheckConstraint("end_time > start_time", name="ends_after_start"),
        CheckConstraint(
            "block_start <= start_time AND block_end >= end_time", name="block_covers_appointment"
        ),
        # Two confirmed bookings can never overlap, travel and preparation time
        # included, even when both are confirmed at the same moment: the
        # database refuses the second.
        ExcludeConstraint(
            (func.tstzrange(text("block_start"), text("block_end"), "[)"), "&&"),
            name="ex_bookings_no_overlap",
            using="gist",
            where=text(f"status = '{HOLDING_STATUS}'"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    # Short code customers can quote, e.g. "K7M2QX".
    reference: Mapped[str] = mapped_column(String(12), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    source: Mapped[str] = mapped_column(String(20), default="website")

    # Summary of what was booked (the details are in `items`), as it was when
    # booked, so later edits to services don't rewrite history.
    service_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("services.id", ondelete="SET NULL"), index=True
    )
    service_name_sq: Mapped[str] = mapped_column(String(300))
    service_name_en: Mapped[str | None] = mapped_column(String(300))
    # Total for every service and person; null when only "on request".
    price: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    price_type: Mapped[str] = mapped_column(String(20))

    # The appointment itself…
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    # …and the time it takes from Yllka's day: travel before and after a visit,
    # and preparation time after.
    block_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    block_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    location: Mapped[str] = mapped_column(String(10), default="studio", server_default="studio")
    # Where to go, for appointments at the client's place.
    address: Mapped[str | None] = mapped_column(String(300))

    customer_name: Mapped[str] = mapped_column(String(120))
    customer_phone: Mapped[str] = mapped_column(String(40))
    customer_email: Mapped[str | None] = mapped_column(String(254))
    customer_note: Mapped[str | None] = mapped_column(String(1000))
    # The language the customer used, for messages back to them.
    locale: Mapped[str] = mapped_column(String(2), default="sq")

    # Message to the customer with the latest decision (confirmed, declined…).
    admin_message: Mapped[str | None] = mapped_column(String(1000))
    # Private note, never shown to the customer.
    admin_note: Mapped[str | None] = mapped_column(String(2000))
    decided_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Secret for the client's "manage my booking" link.
    manage_token: Mapped[str] = mapped_column(String(64), unique=True)
    cancelled_by: Mapped[str | None] = mapped_column(String(10))
    # Set when the client changed the time themselves; Yllka confirms again.
    client_changed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # When Yllka sent the day-before reminder.
    reminder_sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    service: Mapped[Service | None] = relationship()
    items: Mapped[list["BookingItem"]] = relationship(
        back_populates="booking",
        order_by="BookingItem.sort_order",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class BookingItem(Base):
    """One service in a booking, for one or more people, as it was when booked."""

    __tablename__ = "booking_items"
    __table_args__ = (CheckConstraint("quantity BETWEEN 1 AND 20", name="quantity_range"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    booking_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"), index=True
    )
    service_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("services.id", ondelete="SET NULL")
    )
    name_sq: Mapped[str] = mapped_column(String(100))
    name_en: Mapped[str | None] = mapped_column(String(100))
    # Per person.
    duration_minutes: Mapped[int]
    price: Mapped[Decimal | None] = mapped_column(Numeric(8, 2))
    price_type: Mapped[str] = mapped_column(String(20))
    # Number of people, e.g. the bride plus three bridesmaids.
    quantity: Mapped[int] = mapped_column(default=1)
    sort_order: Mapped[int] = mapped_column(default=0)

    booking: Mapped[Booking] = relationship(back_populates="items")
