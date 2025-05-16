from api_client_utils import *
import json
from pathlib import Path


def main():
    
    TOKEN = get_login_token()
    subscribers_json = get_subscribers(TOKEN)

    BASE = Path(__file__).resolve().parent.parent
    # dev
    # dest = BASE / "frontend" / "src" / "assets" / "pabx" / "subscribers.json"
    # prod
    dest = BASE / "backend" / "static" / "pabx" / "subscribers.json"
    with dest.open("w", encoding="utf-8") as f:
        json.dump(subscribers_json, f, ensure_ascii=False, indent=2)
        
if __name__ == "__main__":
    main()