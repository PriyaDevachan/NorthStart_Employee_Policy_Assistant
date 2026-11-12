"""
Server-side Groq connectivity check for Northstar Policy Knowledge Assistant.
Verifies API credentials and model availability without exposing secrets.
"""
import os
import sys
from dotenv import load_dotenv

# Ensure Python uses the native Windows Certificate Store for secure HTTPS
try:
    import truststore
    truststore.inject_into_ssl()
except ImportError:
    pass

# Load environment variables strictly from local .env
load_dotenv()

api_key = os.getenv("GROQ_API_KEY", "").strip()
model_name = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip()

if not api_key or api_key == "your_actual_key_here":
    print("ERROR: GROQ_API_KEY is not set or still contains placeholder text in .env.")
    print("Please edit D:\\project2-antigravity\\.env and insert your valid Groq API key.")
    sys.exit(1)

try:
    from groq import Groq, AuthenticationError, BadRequestError, RateLimitError, APIStatusError
except ImportError:
    print("ERROR: 'groq' package is not installed in the active environment.")
    print("Run: pip install -r requirements.txt")
    sys.exit(1)

print(f"--- Groq Server-Side Connectivity Check ---")
print(f"Provider: Groq Cloud API")
print(f"Configured Model: {model_name}")
print(f"API Key Present: Yes (Length: {len(api_key)} chars, strictly shielded)")
print(f"Sending prompt: 'Reply with READY only'...")

try:
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model=model_name,
        messages=[
            {"role": "user", "content": "Reply with READY only"}
        ],
        temperature=0.0,
        max_tokens=100,
    )
    
    reply = (response.choices[0].message.content or "").strip()
    reasoning = getattr(response.choices[0].message, "reasoning", None)
    returned_model = response.model
    
    print("\n--- Connectivity Result ---")
    print(f"Status: SUCCESS (HTTP 200 OK)")
    print(f"Active Model ID: {returned_model}")
    if reasoning:
        print(f"Model Reasoning: {reasoning.strip()}")
    print(f"Model Response: {reply}")
    print("------------------------------------------")

except AuthenticationError as e:
    print("\n[ERROR 401 - Authentication Failed]")
    print("Check that GROQ_API_KEY in .env was copied correctly without extra spaces.")
    sys.exit(2)
except BadRequestError as e:
    print(f"\n[ERROR 400 - Bad Request / Model Unavailable]")
    print(f"Model '{model_name}' may not be supported on your account.")
    print(f"Details: {e.message if hasattr(e, 'message') else e}")
    print("Recommendation: Check https://console.groq.com/docs/models for active free models and update GROQ_MODEL in .env.")
    sys.exit(3)
except RateLimitError as e:
    print(f"\n[ERROR 429 - Rate Limit Reached]")
    print(f"Details: {e.message if hasattr(e, 'message') else e}")
    print("Recommendation: Wait for rate limit reset before retrying.")
    sys.exit(4)
except APIStatusError as e:
    print(f"\n[ERROR {e.status_code} - API Error]")
    print(f"Details: {e.message if hasattr(e, 'message') else e}")
    sys.exit(5)
except Exception as e:
    print(f"\n[UNEXPECTED ERROR]")
    print(f"Type: {type(e).__name__}")
    print(f"Message: {str(e)}")
    sys.exit(6)
