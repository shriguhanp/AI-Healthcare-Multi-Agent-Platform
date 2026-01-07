from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from diagnostic_agent import get_diagnostic_response
from masc_agent import get_masc_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # replace "*" with frontend URL in production
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.post("/agent/diagnostic")
async def diagnostic_chat(request: Request):
    data = await request.json()
    question = data.get("question", "")
    return {"answer": get_diagnostic_response(question)}

@app.post("/agent/masc")
async def masc_chat(request: Request):
    data = await request.json()
    question = data.get("question", "")
    return {"answer": get_masc_response(question)}
