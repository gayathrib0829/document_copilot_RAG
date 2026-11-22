import os

from dotenv import load_dotenv
from groq import Groq

# Load environment variables from .env
load_dotenv()

# Read Groq API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY is missing from .env")

# Initialize Groq client
groq_client = Groq(api_key=GROQ_API_KEY)

# Select the Llama model
MODEL_NAME = "openai/gpt-oss-120b"