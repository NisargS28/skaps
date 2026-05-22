You are a senior FastAPI + PostgreSQL backend developer.

I have a SKAPS AI chatbot project with:
- Frontend: Next.js
- Backend: FastAPI
- Database: PostgreSQL
- LLM: LM Studio running on another system
- LM Studio base URL is configured in .env, example:
  LM_STUDIO_BASE_URL=http://192.168.23.111:1233/v1
  LM_STUDIO_MODEL=<model-id>

My admin dashboard already has cards for:
- Total Queries
- Successful
- Failed
- Avg Response
- Prompt Tokens
- Completion Tokens
- Total Tokens
- Estimated Cost

Currently prompt_tokens, completion_tokens, total_tokens, and response_time_ms are stored as 0 in chat_messages table. I want to extract real values and store them.

DATABASE CONTEXT:
chat_messages table already has these columns:
- prompt_tokens integer
- completion_tokens integer
- total_tokens integer
- response_time_ms integer
- status varchar(30)
- sender
- message
- session_id
- sources

GOAL:
Update backend so every bot response stores:
- prompt_tokens
- completion_tokens
- total_tokens
- response_time_ms
- status

IMPLEMENTATION REQUIREMENTS:

1. Create or update backend/app/services/llm_service.py

Implement a function:
ask_lm_studio(user_message: str, system_prompt: str | None = None) -> dict

This function should:
- Call LM Studio OpenAI-compatible API using openai Python client.
- Use base_url from LM_STUDIO_BASE_URL.
- Use model from LM_STUDIO_MODEL.
- Start timer before API call.
- Stop timer after API call.
- Calculate response_time_ms in milliseconds.
- Extract assistant answer.
- Extract token usage from response.usage:
  - prompt_tokens
  - completion_tokens
  - total_tokens
- If response.usage is missing or tokens are 0, fallback to estimating tokens using word count:
  estimated_tokens = int(len(text.split()) * 1.3)
- Return:
  {
    "answer": answer,
    "prompt_tokens": prompt_tokens,
    "completion_tokens": completion_tokens,
    "total_tokens": total_tokens,
    "response_time_ms": response_time_ms,
    "status": "success"
  }
- If LM Studio call fails, return:
  {
    "answer": "Sorry, I could not generate a response right now.",
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0,
    "response_time_ms": response_time_ms,
    "status": "failed",
    "error": error_message
  }

2. Update chat route

Find the existing chat endpoint that sends message to LLM and saves chat_messages.

Modify it so:
- User message is saved with sender="user"
- Bot response is generated using ask_lm_studio()
- Bot message is saved with:
  sender="bot"
  message=llm_result["answer"]
  prompt_tokens=llm_result["prompt_tokens"]
  completion_tokens=llm_result["completion_tokens"]
  total_tokens=llm_result["total_tokens"]
  response_time_ms=llm_result["response_time_ms"]
  status=llm_result["status"]

Important:
- Do not save token usage on user message rows.
- Save token usage only on bot message rows.
- If response fails, still save failed bot message with status="failed" and response_time_ms.

3. Update SQLAlchemy ChatMessage model

Ensure backend/app/models/chat_message.py includes:
- prompt_tokens = Column(Integer, default=0)
- completion_tokens = Column(Integer, default=0)
- total_tokens = Column(Integer, default=0)
- response_time_ms = Column(Integer, default=0)
- status = Column(String(30), default="success")

Do not duplicate columns if already present.

4. Add or update admin analytics API

Create or update endpoint:
GET /api/admin/analytics/usage

It should return real values from chat_messages where sender="bot":

{
  "total_queries": number,
  "successful": number,
  "failed": number,
  "avg_response_time_ms": number,
  "prompt_tokens": number,
  "completion_tokens": number,
  "total_tokens": number,
  "estimated_cost": 0
}

Use these rules:
- total_queries = count of user messages OR count of bot responses, whichever is already used consistently in project.
- successful = count where sender='bot' and status='success'
- failed = count where sender='bot' and status='failed'
- avg_response_time_ms = average response_time_ms where sender='bot' and response_time_ms > 0
- prompt_tokens = sum prompt_tokens where sender='bot'
- completion_tokens = sum completion_tokens where sender='bot'
- total_tokens = sum total_tokens where sender='bot'
- estimated_cost = 0 because LM Studio is local.

5. Update frontend admin dashboard

Find the admin dashboard cards that show:
- Avg Response
- Prompt Tokens
- Completion Tokens
- Total Tokens
- Estimated Cost

Modify them to call:
GET http://localhost:8000/api/admin/analytics/usage

Then update card values from API response:
- avg_response_time_ms should display like "1234 ms" or "1.23 s"
- prompt_tokens should display actual sum
- completion_tokens should display actual sum
- total_tokens should display actual sum
- estimated_cost should remain "$0.00"

Add loading state and error state.

6. Add debugging logs during development

In backend, temporarily print/log:
- response_time_ms
- prompt_tokens
- completion_tokens
- total_tokens
- status

Example:
print("LLM usage:", prompt_tokens, completion_tokens, total_tokens, response_time_ms)

7. Environment variables

Ensure .env supports:
LM_STUDIO_BASE_URL=http://192.168.23.111:1233/v1
LM_STUDIO_MODEL=<actual-model-id>

Do not hardcode the IP or model in code.

8. Testing checklist

After implementation:
- Send one chatbot message.
- Check pgAdmin chat_messages table.
- Bot row should have non-zero response_time_ms.
- Bot row should have non-zero token values if LM Studio returns usage.
- If LM Studio does not return usage, estimated token values should still be saved.
- Admin dashboard should show updated real values instead of 0 and "-".

IMPORTANT:
- Do not change existing UI design.
- Do not break chat history.
- Do not break authentication.
- Do not implement RAG yet.
- Only implement LM Studio response tracking, token extraction/estimation, response time measurement, database storage, and admin dashboard update.