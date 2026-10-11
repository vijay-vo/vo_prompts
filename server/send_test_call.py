"""Pretend to be the VoiceOwl HTTP node: post a sample post-call JSON to the server.

Use it to test WhatsApp and email without making a voice call.

    .venv\\Scripts\\python send_test_call.py --phone 9876543210
    .venv\\Scripts\\python send_test_call.py --phone 9876543210 --url https://xyz.trycloudflare.com
    .venv\\Scripts\\python send_test_call.py --phone 9876543210 --file samples/post_call_short_of_cash.json
"""
import argparse
import json
import sys
import uuid
from pathlib import Path

import httpx

sys.path.insert(0, str(Path(__file__).parent))
from app import config  # noqa: E402

parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
parser.add_argument("--phone", required=True, help="the demo customer's WhatsApp number, e.g. 9876543210")
parser.add_argument("--url", default="http://127.0.0.1:8000", help="server address (default: local)")
parser.add_argument("--file", default="samples/post_call.json", help="the post-call JSON to send")
args = parser.parse_args()

body = json.loads((Path(__file__).parent / args.file).read_text(encoding="utf-8"))
body["customerPhone"] = args.phone
body["callSid"] = "test-" + uuid.uuid4().hex[:12]  # a new SID every time, so it is never a duplicate

headers = {"X-Webhook-Token": config.WEBHOOK_TOKEN} if config.WEBHOOK_TOKEN else {}
response = httpx.post(args.url.rstrip("/") + "/voice/post-call", json=body, headers=headers, timeout=30)
print(response.status_code, response.text)
