"""The customer memory: one SQLite file, one timeline of events per phone number.

Every channel writes to the same timeline, which is what makes the demo omnichannel:
a voice call, the WhatsApp messages and the email all sit under one customer.
"""
import json
import re
import sqlite3
from datetime import datetime, timedelta, timezone

from . import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS customers (
    phone           TEXT PRIMARY KEY,
    name            TEXT,
    business        TEXT,
    email           TEXT,
    do_not_contact  INTEGER NOT NULL DEFAULT 0,
    last_inbound_at TEXT,
    created_at      TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    phone      TEXT NOT NULL,
    channel    TEXT NOT NULL,   -- voice | whatsapp | email
    direction  TEXT NOT NULL,   -- in | out
    kind       TEXT NOT NULL,   -- call | message | template | email
    ref_id     TEXT UNIQUE,     -- Plivo call SID or WhatsApp message id, for duplicates
    text       TEXT,
    data       TEXT,            -- JSON
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_phone ON events (phone, id);
"""


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)


def normalize_phone(raw: str) -> str:
    """Digits only, with the country code, which is the form WhatsApp uses ("919876543210")."""
    digits = re.sub(r"\D", "", raw or "")
    if digits.startswith("00"):
        digits = digits[2:]
    if len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    if len(digits) == 10:
        digits = config.DEFAULT_COUNTRY_CODE + digits
    return digits


def ensure_customer(phone: str) -> dict:
    with connect() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO customers (phone, name, business, email, created_at) VALUES (?, ?, ?, ?, ?)",
            (phone, config.DEMO_CUSTOMER_NAME, config.DEMO_CUSTOMER_BUSINESS, config.DEMO_CUSTOMER_EMAIL, now()),
        )
        return dict(conn.execute("SELECT * FROM customers WHERE phone = ?", (phone,)).fetchone())


def add_event(phone: str, channel: str, direction: str, kind: str,
              text: str = "", data: dict | None = None, ref_id: str | None = None) -> bool:
    """Save one event. Returns False if ref_id was already saved (a duplicate delivery)."""
    try:
        with connect() as conn:
            conn.execute(
                "INSERT INTO events (phone, channel, direction, kind, ref_id, text, data, created_at)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (phone, channel, direction, kind, ref_id, text,
                 json.dumps(data, ensure_ascii=False) if data else None, now()),
            )
        return True
    except sqlite3.IntegrityError:
        return False


def set_do_not_contact(phone: str) -> None:
    with connect() as conn:
        conn.execute("UPDATE customers SET do_not_contact = 1 WHERE phone = ?", (phone,))


def mark_inbound(phone: str) -> None:
    with connect() as conn:
        conn.execute("UPDATE customers SET last_inbound_at = ? WHERE phone = ?", (now(), phone))


def window_open(customer: dict) -> bool:
    """True inside WhatsApp's 24-hour window, when free-text messages are allowed."""
    last = customer.get("last_inbound_at")
    if not last:
        return False
    return datetime.now(timezone.utc) - datetime.fromisoformat(last) < timedelta(hours=23, minutes=50)


def timeline(phone: str, limit: int = 200) -> list[dict]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM (SELECT * FROM events WHERE phone = ? ORDER BY id DESC LIMIT ?) ORDER BY id",
            (phone, limit),
        ).fetchall()
    events = []
    for row in rows:
        event = dict(row)
        event["data"] = json.loads(event["data"]) if event["data"] else None
        events.append(event)
    return events


def calls(phone: str) -> list[dict]:
    return [e for e in timeline(phone) if e["kind"] == "call"]


def whatsapp_history(phone: str, limit: int = 20) -> list[dict]:
    return [e for e in timeline(phone) if e["channel"] == "whatsapp"][-limit:]
