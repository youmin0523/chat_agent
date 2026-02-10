# API 명세서 (API Specification)

**Project**: Chat Agent - AI Law Assistant
**Base URL**: `http://localhost:8000`
**Content-Type**: `application/json`

---

## 1. 서버 상태 확인 (Health Check)

서버가 정상적으로 실행 중인지 확인하는 헬스 체크용 엔드포인트입니다.

### Endpoint

| Method | URI | Description                               |
| :----- | :-- | :---------------------------------------- |
| `GET`  | `/` | 서비스 가동 상태 확인 및 환영 메시지 반환 |

### Response (200 OK)

```json
{
  "message": "법률 관련 채팅 서비스"
}
```

---

## 2. 법률 상담 채팅 (Legal Chat)

사용자의 질문을 받아 AI 에이전트가 처리한 답변을 반환합니다. 이전 대화 기록(Context)을 포함하여 전송할 수 있습니다.

### Endpoint

| Method | URI     | Description                        |
| :----- | :------ | :--------------------------------- |
| `POST` | `/chat` | 사용자 메시지 전송 및 AI 답변 수신 |

### Request Body

**Schema**: `ChatRequest`

| Field      | Type                | Required | Description                                                  |
| :--------- | :------------------ | :------: | :----------------------------------------------------------- |
| `contents` | `List[ChatMessage]` |    O     | 대화 메시지 목록 (최신 메시지는 리스트의 마지막 요소여야 함) |

**`ChatMessage` Schema**

| Field   | Type         | Required | Description                              |
| :------ | :----------- | :------: | :--------------------------------------- |
| `role`  | `string`     |    O     | 메시지 발신자 역할 (`user` 또는 `model`) |
| `parts` | `List[Dict]` |    O     | 메시지 본문 컨텐츠                       |

**`parts` Item Schema**

| Field  | Type     | Required | Description        |
| :----- | :------- | :------: | :----------------- |
| `text` | `string` |    O     | 실제 메시지 텍스트 |

### Request Example

```json
{
  "contents": [
    {
      "role": "user",
      "parts": [
        {
          "text": "전세 사기를 당했을 때 어떻게 해야 하나요?"
        }
      ]
    }
  ]
}
```

### Response Body

**Schema**: `ChatResponse`

| Field        | Type                  | Description                                  |
| :----------- | :-------------------- | :------------------------------------------- |
| `candidates` | `List[ChatCandidate]` | AI 답변 후보군 리스트 (통상 1개의 답변 포함) |

**`ChatCandidate` Schema**

| Field     | Type          | Description    |
| :-------- | :------------ | :------------- |
| `content` | `ChatMessage` | 답변 내용 객체 |

### Response Example (200 OK)

```json
{
  "candidates": [
    {
      "content": {
        "role": "model",
        "parts": [
          {
            "text": "전세 사기 피해를 입으셨다면 즉시 경찰에 신고하고, 주택임대차분쟁조정위원회에 조정을 신청하는 것이 좋습니다. 또한..."
          }
        ]
      }
    }
  ]
}
```

### Error Response

**500 Internal Server Error**

```json
{
  "detail": "오류 발생: [에러 상세 내용]"
}
```

---

## 💡 Mentor's Tip (시니어 개발자의 조언)

### 1. 왜 중첩된 JSON 구조를 사용하나요? (Google Gemini Style)

- 현재 API 구조(`contents` -> `parts` -> `text`)는 Google Gemini API의 스키마를 따르고 있습니다.
- **장점**: 텍스트뿐만 아니라 이미지, 파일 등 멀티모달(Multi-modal) 데이터를 처리할 때 확장성이 좋습니다. 예를 들어, `parts` 리스트에 텍스트와 이미지를 동시에 담아 보낼 수 있습니다.
- **단점**: 단순 텍스트 챗봇에는 다소 복잡(Over-engineering)해 보일 수 있습니다. 프론트엔드 연동 시 데이터 파싱 로직에 주의가 필요합니다.

### 2. 대용량 트래픽 처리 시 고려할 점 (Scalability)

- 현재 서버는 `app.state.conversation_history`라는 **메모리 변수**에 대화 기록을 저장합니다.
- **문제점**: 서버가 재시작되거나, 로드 밸런서(Load Balancer)를 통해 여러 서버가 운영될 경우 대화 맥락이 끊길 수 있습니다.
- **해결책**: 실무에서는 **Redis**나 **DB**를 사용하여 세션(Session) 정보를 외부 저장소에서 관리해야 합니다.

### 3. Pydantic의 강력함 (Validation)

- `main.py`에 정의된 `BaseModel` 상속 클래스들은 데이터가 들어올 때 자동으로 타입을 검사해줍니다.
- 만약 클라이언트가 `text` 필드를 빼먹고 보내면, 서버는 코드를 실행하기도 전에 `422 Unprocessable Entity` 에러를 반환하여 잘못된 데이터 처리를 원천 차단합니다. 이는 서버의 안정성을 높이는 핵심 요소입니다.
