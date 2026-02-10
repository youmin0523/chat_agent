from pydantic import BaseModel  # 데이터 타입 정의 모듈
from typing import List, Dict  # 타입 힌트 모듈
from fastapi import FastAPI, HTTPException  # 웹 서버 모듈, 예외 처리 모듈
from fastapi.middleware.cors import CORSMiddleware  # 교차 출처 리소스 공유 설정
from dotenv import load_dotenv
from agent import process_query

load_dotenv()


# 타입 정의
class ChatMessage(BaseModel):
    role: str
    parts: List[Dict[str, str]]


class ChatRequest(BaseModel):
    contents: List[ChatMessage]


class ChatCandidate(BaseModel):  # 챗봇 답변 타입
    content: ChatMessage


class ChatResponse(BaseModel):
    candidates: List[ChatCandidate]


app = FastAPI(
    title="법률 관련 채팅 서비스 API", description="법률 관련 질문에 답변해 드립니다."
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "법률 관련 채팅 서비스"}


# 상태 초기화
app.state.conversation_history = []


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    법률 관련 질문에 답해 드립니다.
    """

    try:
        # 기존 대화 기록 호출
        conversation_history = app.state.conversation_history

        # 현재 사용자의 입력 메시지 가져오기
        current_user_message = (
            request.contents[-1].parts[0].get("text", "") if request.contents else ""
        )
        # print(current_user_message)

        # 챗봇 응답 생성
        response = await process_query(current_user_message, conversation_history)
        # print(response)

        # app.state.conversation_history.append((current_user_message, response))

        return ChatResponse(
            candidates=[
                ChatCandidate(
                    content=ChatMessage(role="model", parts=[{"text": response}])
                )
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"오류 발생: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
