from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from typing import Optional

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Provider configurations
FALLBACK_PROVIDERS = ["mistral", "groq"]
USER_KEY_PROVIDERS = ["openai", "gemini", "openrouter"]

class AIRequest(BaseModel):
    prompt: str
    user_api_key: Optional[str] = None

def get_api_key(provider: str, user_key: Optional[str] = None) -> str:
    """Get API key for provider - fallback or user-provided"""
    if provider in FALLBACK_PROVIDERS:
        # Use fallback keys for mistral and groq
        key = os.getenv(f"{provider.upper()}_API_KEY")
        if not key:
            raise HTTPException(status_code=500, detail=f"Fallback key for {provider} not configured")
        return key
    elif provider in USER_KEY_PROVIDERS:
        # Require user key for openai, gemini, openrouter
        if not user_key:
            raise HTTPException(status_code=400, detail=f"{provider} requires your own API key")
        return user_key
    else:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

async def call_openai(prompt: str, api_key: str) -> str:
    """Call OpenAI API"""
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are a professional resume writing assistant. Parse the user's description and return structured resume data in JSON format with these keys: name, title, email, phone, location, summary, skills (array), experience (array of objects with company, position, duration, description), education (array of objects with school, degree, year), projects (array of objects with name, description, tech). Be concise and professional."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=data, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"OpenAI API error: {response.text}")
        return response.json()["choices"][0]["message"]["content"]

async def call_gemini(prompt: str, api_key: str) -> str:
    """Call Google Gemini API"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{
            "parts": [{
                "text": f"You are a professional resume writing assistant. Parse this description and return structured resume data in JSON format with these keys: name, title, email, phone, location, summary, skills (array), experience (array of objects with company, position, duration, description), education (array of objects with school, degree, year), projects (array of objects with name, description, tech). Be concise and professional.\n\nUser description: {prompt}"
            }]
        }],
        "generationConfig": {
            "temperature": 0.7
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=data, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Gemini API error: {response.text}")
        return response.json()["candidates"][0]["content"]["parts"][0]["text"]

async def call_mistral(prompt: str, api_key: str) -> str:
    """Call Mistral API"""
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "mistral-small-latest",
        "messages": [
            {"role": "system", "content": "You are a professional resume writing assistant. Parse the user's description and return structured resume data in JSON format with these keys: name, title, email, phone, location, summary, skills (array), experience (array of objects with company, position, duration, description), education (array of objects with school, degree, year), projects (array of objects with name, description, tech). Be concise and professional."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=data, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Mistral API error: {response.text}")
        return response.json()["choices"][0]["message"]["content"]

async def call_groq(prompt: str, api_key: str) -> str:
    """Call Groq API"""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a professional resume writing assistant. Parse the user's description and return structured resume data in JSON format with these keys: name, title, email, phone, location, summary, skills (array), experience (array of objects with company, position, duration, description), education (array of objects with school, degree, year), projects (array of objects with name, description, tech). Be concise and professional."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=data, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Groq API error: {response.text}")
        return response.json()["choices"][0]["message"]["content"]

async def call_openrouter(prompt: str, api_key: str) -> str:
    """Call OpenRouter API"""
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-resume-builder.app",
        "X-Title": "AI Resume Builder"
    }
    data = {
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [
            {"role": "system", "content": "You are a professional resume writing assistant. Parse the user's description and return structured resume data in JSON format with these keys: name, title, email, phone, location, summary, skills (array), experience (array of objects with company, position, duration, description), education (array of objects with school, degree, year), projects (array of objects with name, description, tech). Be concise and professional."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=data, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"OpenRouter API error: {response.text}")
        return response.json()["choices"][0]["message"]["content"]

@app.get("/")
async def root():
    return {
        "message": "AI Resume Builder API",
        "providers": {
            "fallback": FALLBACK_PROVIDERS,
            "user_key_required": USER_KEY_PROVIDERS
        }
    }

@app.post("/ask-ai/{provider}")
async def ask_ai(provider: str, request: AIRequest):
    """
    Call AI provider with prompt
    - Mistral and Groq use fallback keys
    - OpenAI, Gemini, OpenRouter require user keys
    """
    try:
        api_key = get_api_key(provider, request.user_api_key)
        
        if provider == "openai":
            response = await call_openai(request.prompt, api_key)
        elif provider == "gemini":
            response = await call_gemini(request.prompt, api_key)
        elif provider == "mistral":
            response = await call_mistral(request.prompt, api_key)
        elif provider == "groq":
            response = await call_groq(request.prompt, api_key)
        elif provider == "openrouter":
            response = await call_openrouter(request.prompt, api_key)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
        
        return {"response": response, "provider": provider}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calling {provider}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
