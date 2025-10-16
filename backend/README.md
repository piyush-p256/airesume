# AI Resume Builder Backend

FastAPI backend for AI Resume Builder with multi-provider support.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file with fallback API keys:
```env
MISTRAL_API_KEY=your_mistral_key_here
GROQ_API_KEY=your_groq_key_here
```

3. Run the server:
```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Provider Configuration

### Fallback Providers (No User Key Required)
- **Mistral**: Uses `MISTRAL_API_KEY` from .env
- **Groq**: Uses `GROQ_API_KEY` from .env

### User Key Providers (User Must Provide Key)
- **OpenAI**: Requires user's OpenAI API key
- **Google Gemini**: Requires user's Gemini API key
- **OpenRouter**: Requires user's OpenRouter API key

## API Endpoints

### GET /
Returns provider information

### POST /ask-ai/{provider}
Generate resume content using AI

**Body:**
```json
{
  "prompt": "User description",
  "user_api_key": "optional_user_key"
}
```

**Providers:** `mistral`, `groq`, `openai`, `gemini`, `openrouter`

## Deployment

For production, use a proper ASGI server:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```
