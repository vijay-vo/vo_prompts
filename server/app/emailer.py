"""Gmail SMTP: the one support email after a call."""
import logging
import smtplib
from email.message import EmailMessage

from . import config

log = logging.getLogger("email")


def send(to: str, subject: str, body: str) -> bool:
    if config.DRY_RUN:
        log.info("DRY RUN, email not sent to %s\nSubject: %s\n\n%s", to, subject, body)
        return True
    message = EmailMessage()
    message["From"] = f"Bharat Petroleum Smart Fleet (demo) <{config.GMAIL_ADDRESS}>"
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as smtp:
            smtp.starttls()
            smtp.login(config.GMAIL_ADDRESS, config.GMAIL_APP_PASSWORD)
            smtp.send_message(message)
        return True
    except (smtplib.SMTPException, OSError) as error:
        log.error("Email send failed: %s", error)
        return False
