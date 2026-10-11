"""The customer memory: one SQLite file, one timeline of events per phone number.

Every channel writes to the same timeline, which is what makes the demo omnichannel:
a voice call, the WhatsApp messages and the email all sit under one customer.
"""
import json
import re
import sqlite3
import threading
from datetime import datetime, timedelta, timezone

from . import config

IST = timezone(timedelta(hours=5, minutes=30))

SCHEMA = """
CREATE TABLE IF NOT EXISTS customers (
    phone            TEXT PRIMARY KEY,
    name             TEXT,
    business         TEXT,
    email            TEXT,
    do_not_contact   INTEGER NOT NULL DEFAULT 0,
    last_inbound_at  TEXT,
    pending_followup TEXT,          -- summary held back until the customer replies
    created_at       TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    phone      TEXT NOT NULL,
    channel    TEXT NOT NULL,   -- voice | whatsapp | email
    direction  TEXT NOT NULL,   -- in | out
    kind       TEXT NOT NULL,   -- call | message | template | email
    ref_id     TEXT UNIQUE,     -- Plivo call SID or WhatsApp message id, for duplicates
    status     TEXT,            -- WhatsApp delivery: sent | delivered | read | failed
    text       TEXT,
    data       TEXT,            -- JSON
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS events_phone ON events (phone, id);
"""

_locks: dict[str, threading.Lock] = {}
_locks_guard = threading.Lock()


def customer_lock(phone: str) -> threading.Lock:
    """One lock per customer, so their messages are answered one at a time, in order."""
    with _locks_guard:
        return _locks.setdefault(phone, threading.Lock())


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def to_ist(iso: str) -> str:
    return datetime.fromisoformat(iso).astimezone(IST).strftime("%d %b %Y, %I:%M %p IST")


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(config.DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init() -> None:
    config.DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with connect() as conn:
        conn.execute("PRAGMA journal_mode=WAL")
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


def get_customer(phone: str) -> dict | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM customers WHERE phone = ?", (phone,)).fetchone()
    return dict(row) if row else None


def update_customer(phone: str, **fields) -> None:
    columns = ", ".join(f"{name} = ?" for name in fields)
    with connect() as conn:
        conn.execute(f"UPDATE customers SET {columns} WHERE phone = ?", (*fields.values(), phone))


def delete_customer(phone: str) -> None:
    with connect() as conn:
        conn.execute("DELETE FROM events WHERE phone = ?", (phone,))
        conn.execute("DELETE FROM customers WHERE phone = ?", (phone,))


def add_event(phone: str, channel: str, direction: str, kind: str, text: str = "",
              data: dict | None = None, ref_id: str | None = None, status: str | None = None) -> bool:
    """Save one event. Returns False if ref_id was already saved (a duplicate delivery)."""
    try:
        with connect() as conn:
            conn.execute(
                "INSERT INTO events (phone, channel, direction, kind, ref_id, status, text, data, created_at)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (phone, channel, direction, kind, ref_id, status, text,
                 json.dumps(data, ensure_ascii=False) if data else None, now()),
            )
        return True
    except sqlite3.IntegrityError:
        return False


def set_status(ref_id: str, status: str, error: str = "") -> None:
    """Delivery receipts from Meta. A failure keeps its reason in data."""
    with connect() as conn:
        if error:
            conn.execute("UPDATE events SET status = ?, data = ? WHERE ref_id = ?",
                         (status, json.dumps({"error": error}, ensure_ascii=False), ref_id))
        else:
            # never move a message backwards, e.g. a late "delivered" after "read"
            order = "CASE status WHEN 'sent' THEN 1 WHEN 'delivered' THEN 2 WHEN 'read' THEN 3 ELSE 0 END"
            new = {"sent": 1, "delivered": 2, "read": 3}.get(status, 0)
            conn.execute(f"UPDATE events SET status = ? WHERE ref_id = ? AND {order} < ? AND "
                         "COALESCE(status, '') != 'failed'", (status, ref_id, new))


def window_open(customer: dict) -> bool:
    """True inside WhatsApp's 24-hour window, when free-text messages are allowed."""
    last = customer.get("last_inbound_at")
    if not last:
        return False
    return datetime.now(timezone.utc) - datetime.fromisoformat(last) < timedelta(hours=23, minutes=50)


def timeline(phone: str, limit: int = 300) -> list[dict]:
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
    return [e for e in timeline(phone) if e["channel"] == "whatsapp" and e["status"] != "failed"][-limit:]


def customers() -> list[dict]:
    with connect() as conn:
        return [dict(r) for r in conn.execute(
            "SELECT c.*, (SELECT MAX(created_at) FROM events e WHERE e.phone = c.phone) AS last_event_at"
            " FROM customers c ORDER BY last_event_at DESC").fetchall()]
