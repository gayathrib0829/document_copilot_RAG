
import os

from dotenv import load_dotenv
from supabase import create_client, ClientOptions

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def get_supabase_client(access_token: str):

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError(
            "Supabase environment variables are missing."
        )

    if not access_token:
        raise ValueError("Access token is missing.")

    options = ClientOptions(
        headers={
            "Authorization": f"Bearer {access_token}"
        }
    )

    return create_client(
        SUPABASE_URL,
        SUPABASE_KEY,
        options=options
    )
