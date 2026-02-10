import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_community.tools import TavilySearchResults
from langchain_core.messages import HumanMessage, AIMessage
# LLM 추론 엔진으로 사용하여 어떤 작업을 수행할 것인지, 해당 작억을 수행하는데 필요한 입력은 무엇인지 판단하는 모듈 - react(ReAct)
from langgraph.prebuilt import create_react_agent

load_dotenv()

# API Keys
TAVILY_API_KEY = os.getenv('TAVILY_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# LLM 구성
openai_llm = ChatOpenAI(
  model='gpt-4o-mini',
  api_key=OPENAI_API_KEY,
  temperature=0.5,
  max_completion_tokens=1024 # 답변 토큰 제한
)

search_tool = TavilySearchResults(max_results=1)

# 프롬프트 구성
system_prompt = """
  You are a helpful assistant that can search the web about law information. Please answer only legal-related questions. 
  If the question is related to previous conversations, refer to that context in your response.
  If the question is not related to law, kindly remind the user that you can only answer legal questions.
  If a greeting is entered as a question, please respond in Korean with "반갑습니다. 어떤 법률을 알려드릴까요?"
  Only answer in Korean.
"""

# agent 생성 부분 try-exception 구문
try:
  agent = create_react_agent(
    model=openai_llm,
    tools=[search_tool],
    prompt=system_prompt
  )
except Exception as e:
  print(f'에이전트 생성 중 오류 발생: {str(e)}')

# 답변 히스토리 누적 함수
async def process_query(query, conversation_history):
  messages = [HumanMessage(content=system_prompt)]

  # 기존 대화 내용 추가
  for msg in conversation_history:
    if isinstance(msg, tuple):
      messages.append(HumanMessage(content=msg[0]))
      messages.append(AIMessage(content=msg[1]))

  # 새로운 질문 추가
  messages.append(HumanMessage(content=query))

  # 메시지 상태 저장
  state = {
    'messages': messages
  }

  # 응답 요청
  response = await agent.ainvoke(state) # async invoke
  ai_message = [message.content for message in response.get("messages", []) if isinstance(message, AIMessage)]

  # 답변을 coversation_history에 추가
  answer = ai_message[-1] if ai_message else '응답을 생성할 수 없습니다.'

  return answer

# main 함수
async def main():
  print('법률 관련 질문에 답변해 드립니다. 종료는 "q"를 입력하세요.')

  # 대화 기록 초기화
  conversation_history = []

  # 대화 루프 시작
  while True:
    query = input('질문을 입력해 주세요: ').strip() # 사용자 입력 - 양쪽 공백 제거

    if query.lower() == "q":
      print('프로그램을 종료합니다.')
      break

    # 답변
    response = await process_query(query, conversation_history)
    print(f'답변: ', response)

# 프로그램 실행
if __name__ == "__main__":
  import asyncio # 비동기 처리 모듈
  asyncio.run(main())