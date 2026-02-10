from pydantic import BaseModel # 데이터 타입 정의 모듈
from typing import List, Dict # 타입 힌트 모듈
from fastapi import FastAPI, HTTPException # 웹 서버 모듈, 예외 처리 모듈
from fastapi.middleware.cors import CORSMiddleware # 교차 출처 리소스 공유 설정
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="법률 관련 채팅 서비스 API", description="법률 관련 질문에 답변해 드립니다.")

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
async def root():
    return {"message": "법률 관련 채팅 서비스"}

@app.post("/chat")
async def chat_endpoint():
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
