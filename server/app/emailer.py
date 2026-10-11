"""Gmail SMTP: the one support email after a call."""
import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from . import config

log = logging.getLogger("email")


def send(to: str, subject: str, body: str) -> bool:
    if config.DRY_RUN:
        log.info("DRY RUN, email not sent to %s\nSubject: %s\n\n%s", to, subject, body)
        return True
    if not (config.GMAIL_ADDRESS and config.GMAIL_APP_PASSWORD):
        log.warning("Email skipped: GMAIL_ADDRESS / GMAIL_APP_PASSWORD missing")
        return False
    message = EmailMessage()
    message["From"] = formataddr((config.EMAIL_FROM_NAME, config.GMAIL_ADDRESS))
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=20) as smtp:
            smtp.starttls()
            smtp.login(config.GMAIL_ADDRESS, config.GMAIL_APP_PASSWORD.replace(" ", ""))
            smtp.send_message(message)
        log.info("Email sent to %s", to)
        return True
    except smtplib.SMTPAuthenticationError:
        log.error("Email not sent: Gmail refused the login. Use an App Password, not the Gmail password.")
    except (smtplib.SMTPException, OSError) as error:
        log.error("Email not sent: %s", error)
    return False
