# 시스템 아키텍처 및 데이터 흐름 (Architecture & Data Flow)

이 문서는 프론트엔드(React)와 백엔드(FastAPI) 간의 **파일 연결 관계**와 **데이터 흐름**을 상세히 설명합니다.
각 컴포넌트가 어떻게 상호작용하는지 이해하는 데 도움을 줍니다.

---

## 🏗 전체 구조도 (High-Level Architecture)

```mermaid
graph LR
    User[사용자 (Browser)] -- "1. 질문 입력 (Click/Enter)" --> ChatForm[Front: ChatForm.jsx]
    ChatForm -- "2. 상태 업데이트 (setChatHistory)" --> App[Front: App.jsx]
    App -- "3. API 요청 (POST /chat)" --> Backend[Back: main.py]
    Backend -- "4. LLM 처리 요청" --> Agent[Back: agent.py]
    Agent -- "5. 검색 수행 (Tavily API)" --> Search[External: Web Search]
    Agent -- "6. 답변 생성 (OpenAI API)" --> LLM[External: GPT-4o-mini]
    Agent -- "7. 최종 답변 반환" --> Backend
    Backend -- "8. 응답 (JSON)" --> App
    App -- "9. 화면 렌더링" --> ChatMessages[Front: ChatMessages.jsx]
```

---

## 📂 파일별 상세 연결 관계 (File Dependency Map)

### 1. Frontend (React)

**`src/App.jsx` (Control Center)**

- **역할**: 전체 앱의 상태(`chatHistory`, `showChatbot`)를 관리하고 백엔드와 통신하는 핵심 컨트롤 타워입니다.
- **연결 관계**:
  - `Import` -> `ChatForm.jsx`: 사용자의 입력을 받는 하위 컴포넌트.
  - `Import` -> `ChatMessages.jsx`: 대화 내용을 화면에 표시하는 하위 컴포넌트.
  - `Import` -> `ChatIcon.jsx`: 챗봇 아이콘 컴포넌트.
  - `Fetch` -> `http://localhost:8000/chat`: 백엔드 API 호출.

**`src/components/ChatForm.jsx` (Input Handler)**

- **역할**: 사용자로부터 텍스트 입력을 받고 엔터 키나 전송 버튼 이벤트를 처리합니다.
- **데이터 흐름**:
  - `Props` -> `generateChatResponse`: 부모(`App.jsx`)로부터 전달받은 함수를 실행하여 백엔드 통신을 트리거합니다.
  - `Ref` -> `inputRef`: 입력창의 값을 직접 제어합니다.

**`src/components/ChatMessages.jsx` (Display)**

- **역할**: 개별 메시지(사용자 질문 or 챗봇 답변)를 렌더링합니다.
- **데이터 흐름**:
  - `Props` -> `chat`: 부모(`App.jsx`)로부터 메시지 객체(`{ role, text }`)를 전달받아 화면에 그립니다.

---

### 2. Backend (FastAPI)

**`back/main.py` (API Server)**

- **역할**: 클라이언트(프론트엔드)의 요청을 받는 **진입점(Entry Point)**입니다.
- **연결 관계**:
  - `Import` -> `agent.py`: 실제 AI 로직을 처리하는 모듈을 가져옵니다.
  - `Endpoint` -> `@app.post("/chat")`: 프론트엔드의 요청을 수신합니다.
- **데이터 흐름**:
  - `Request Body` (`ChatRequest`) -> `process_query` 함수 호출 -> `Response Body` (`ChatResponse`) 반환.

**`back/agent.py` (AI Logic Core)**

- **역할**: LangChain을 사용하여 검색(Search)과 추론(Reasoning)을 수행하는 두뇌입니다.
- **연결 관계**:
  - `Import` -> `langchain_openai`: OpenAI 모델(`gpt-4o-mini`) 연결.
  - `Import` -> `langchain_community`: Tavily 검색 도구 연결.
  - `Env` -> `.env`: API Key (`OPENAI_API_KEY`, `TAVILY_API_KEY`) 로드.

---

## 🔄 데이터 흐름 시나리오 (Data Flow Scenario)

**Scenario: 사용자가 "전세 사기 예방법 알려줘"라고 입력했을 때**

1.  **Frontend (`ChatForm.jsx`)**
    - 사용자가 입력한 텍스트를 감지하고 `handleSubmit` 함수 실행.
    - 화면에 즉시 "전세 사기 예방법 알려줘" (User Message) 표시.
    - "생각중 ..." (Loading Message) 임시 표시.
    - `App.jsx`의 `generateChatResponse` 함수 호출.

2.  **API Request (`App.jsx` -> `main.py`)**
    - `POST http://localhost:8000/chat` 요청 전송.
    - Body: `{"contents": [{"role": "user", "parts": [{"text": "전세 사기..."}]}]}`

3.  **Backend Processing (`main.py` -> `agent.py`)**
    - `main.py`가 요청을 받아 `agent.process_query()` 호출.
    - `agent.py`의 `LangGraph` 에이전트가 질문 분석.
    - **판단**: "이건 법률 정보니까 검색이 필요해." -> `TavilySearchResults` 도구 실행.
    - **검색**: 웹에서 최신 전세 사기 예방법 검색.
    - **생성**: 검색 결과를 바탕으로 답변 생성.

4.  **Frontend Rendering (`App.jsx` -> `ChatMessages.jsx`)**
    - 백엔드로부터 200 OK 응답 수신.
    - "생각중 ..." 메시지를 실제 답변으로 교체 (`setChatHistory`).
    - `ChatMessages.jsx`가 새로운 답변을 화면에 렌더링.
    - 화면이 자동으로 아래로 스크롤됨.
