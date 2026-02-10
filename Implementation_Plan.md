# 구현 계획서 (Implementation Plan) - v1.2

## 1. 시스템 아키텍처

이 프로젝트는 OpenAI와 LangChain을 활용한 Python 기반 챗 에이전트입니다.

- **백엔드**: Python 3.14 (전역 환경: `C:\Users\pc9\AppData\Local\Programs\Python\Python314\python.exe`).
- **핵심 파일**: `back/agent.py`, `back/main.py`.
- **설정 파일**: `back/.env`.
- **설정 파일**: `back/.env`.
- **주요 라이브러리**: `python-dotenv`, `langchain-openai`, `langchain-community`, `langgraph`, `tavily-python`.

- **프론트엔드**: React + Vite (Node.js 환경).
- **핵심 파일**: `front/src/App.jsx`, `front/src/components/ChatForm.jsx`.
- **UI 스타일**: Vanilla CSS (`App.css`).
- **상태 관리**: `useState`, `useRef` (Local State).

## 2. 이슈 분석 및 해결 전략

### 이슈 1: `ModuleNotFoundError: No module named 'dotenv'`

- **원인**: 현재 사용 중인 Python 환경에 `python-dotenv` 패키지가 설치되지 않음.
- **해결**: `pip`를 통해 `python-dotenv` 설치. `agent.py` 실행에 필요한 다른 라이브러리들도 선제적으로 일괄 설치함.

### 이슈 2: `.env` 파일이 "사라져 보이는" 현상

- **원인**: `back/.gitignore` 파일 11번째 줄에 `.env`가 등록되어 있음. 이로 인해 Git이 해당 파일을 무시(Ignore)하게 되며, IDE(VS Code)에서는 파일이 흐리게 보이거나 특정 설정에 따라 숨겨질 수 있음.
- **해결**: 이는 보안상(비밀번호 유출 방지) **의도된 정상 동작**임을 사용자에게 안내.

### 환경 변수 관리 전략

- **보안**: `.env` 파일에는 민감한 키(API Key 등)가 포함되므로 `.gitignore`에 포함하는 것이 원칙이나, 사용자의 명시적 요청으로 가시성을 우선시하는 설정을 적용할 수 있음.
- **가시성 확보**: `.vscode/settings.json`을 생성하여 `files.exclude`에서 `.env`를 강제로 보이게 설정함.
- **협업**: 팀원들에게 필요한 변수를 알리기 위해, 실제 값은 비워둔 `.env.example` 파일을 만들어 Git에 올리는 것을 권장.

### 구현 상태 (Implementation Status)

- [x] **환경 관리**: `python-dotenv` 및 `.env` 파일 설정 완료.
- [x] **AI/LangChain**: `langchain-openai`, `langchain-community`, `langgraph`, `tavily-python` 통합 완료.
- [x] **API 서버**: `FastAPI` 기반 `back/main.py` 서버 구축 완료.
- [x] **에러 핸들링 (v1.2)**: `agent.py` 초기화 실패 및 `main.py` 잘못된 요청 파싱에 대한 방어 로직 구현.

## 3. API 안정성 개선 (API Robustness)

### 이슈 3: 서버 크래시 (Server Crash)

- **증상**: API 키 누락이나 네트워크 오류로 `create_react_agent` 실패 시, 이후 요청에서 `NameError: name 'agent' is not defined` 발생하며 500 에러 반환.
- **해결**:
  1. `agent.py`: `agent = None`으로 초기화하고, 생성 실패 시 예외를 잡아 로그를 출력하되 프로그램이 죽지 않게 함.
  2. `process_query`: `agent`가 `None`인 경우 안전하게 에러 메시지 문자열을 반환하도록 수정.
- **효과**: 서버가 죽지 않고 클라이언트에게 명확한 에러 메시지 전달 가능.

### 향후 고려 사항

- **Logging**: 프로덕션 레벨의 로깅 시스템 도입 고려.
- **Validation**: Pydantic 모델을 더 엄격하게 정의하여 입력 데이터 검증 강화.

## 4. API 명세 (API Specification)

상세한 API 명세는 프로젝트 루트의 `API_SPECIFICATION.md` 파일을 참조하십시오.

### 핵심 엔드포인트 요약

- **`GET /`**: Health Check
- **`POST /chat`**: Main Chat Endpoint (Legal Advice)

## 5. 시스템 아키텍처 (System Architecture)

상세한 시스템 아키텍처와 데이터 흐름은 프로젝트 루트의 **`README.md`** 파일에 통합되었습니다.

### 주요 데이터 흐름

1. **User Input** -> `ChatForm.jsx` -> `App.jsx`
2. **API Request** -> `main.py` -> `agent.py`
3. **AI Logic** -> `LangChain Agent` -> `Tavily Search` -> `OpenAI`
4. **Response** -> `main.py` -> `App.jsx` -> `ChatMessages.jsx`
