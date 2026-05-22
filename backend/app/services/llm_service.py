import os
import time
from typing import Optional, List, Dict, Any, Generator
from openai import OpenAI

def ask_lm_studio(
    user_message: str,
    system_prompt: Optional[str] = None,
    messages: Optional[List[Dict[str, str]]] = None,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Call LM Studio using the openai Python client.
    Tracks execution time and extracts/estimates token usage.
    
    Supports conversation history via the messages argument, or a single prompt
    via user_message and system_prompt.
    """
    base_url = os.getenv("LM_STUDIO_BASE_URL", "http://192.168.23.111:1233/v1")
    if not model:
        model = os.getenv("LM_STUDIO_MODEL", "google/gemma-2-9b")

    # LM Studio works with OpenAI client pointing to the custom base URL.
    # We use a dummy api_key since LM Studio is local and doesn't require one.
    client = OpenAI(base_url=base_url, api_key="lm-studio")

    # If full chat history is provided, use it. Otherwise, build it.
    if messages is not None:
        lm_messages = list(messages)
    else:
        lm_messages = []
        if system_prompt:
            lm_messages.append({"role": "system", "content": system_prompt})
        lm_messages.append({"role": "user", "content": user_message})

    start_time = time.time()
    try:
        response = client.chat.completions.create(
            model=model,
            messages=lm_messages,
            temperature=0.7,
        )
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)

        answer = response.choices[0].message.content or ""

        # Extract tokens
        usage = response.usage
        if usage and (usage.prompt_tokens > 0 or usage.completion_tokens > 0):
            prompt_tokens = usage.prompt_tokens
            completion_tokens = usage.completion_tokens
            total_tokens = usage.total_tokens
        else:
            # Fallback: estimate based on word count
            # prompt_tokens based on input, completion_tokens based on output
            # If history is passed, we estimate the prompt tokens from the last user message, or the full context.
            # Estimating from user_message is standard per prompt instructions.
            prompt_tokens = int(len(user_message.split()) * 1.3)
            completion_tokens = int(len(answer.split()) * 1.3)
            total_tokens = prompt_tokens + completion_tokens

        # Print debug log as requested in guideline #6
        print("LLM usage:", prompt_tokens, completion_tokens, total_tokens, response_time_ms)

        return {
            "answer": answer,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "response_time_ms": response_time_ms,
            "status": "success",
        }

    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        error_message = str(e)
        print(f"Error calling LM Studio: {error_message}")

        # Fallback/default answer for failed calls
        return {
            "answer": "Sorry, I could not generate a response right now.",
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "response_time_ms": response_time_ms,
            "status": "failed",
            "error": error_message,
        }

def ask_lm_studio_stream(
    user_message: str,
    system_prompt: Optional[str] = None,
    messages: Optional[List[Dict[str, str]]] = None,
    model: Optional[str] = None,
) -> Generator[Dict[str, Any], None, None]:
    """
    Generator that calls LM Studio using the openai Python client with stream=True.
    Yields chunks of text as they arrive, and finally yields token counts and metadata.
    """
    base_url = os.getenv("LM_STUDIO_BASE_URL", "http://192.168.23.111:1233/v1")
    if not model:
        model = os.getenv("LM_STUDIO_MODEL", "google/gemma-2-9b")

    client = OpenAI(base_url=base_url, api_key="lm-studio")

    if messages is not None:
        lm_messages = list(messages)
    else:
        lm_messages = []
        if system_prompt:
            lm_messages.append({"role": "system", "content": system_prompt})
        lm_messages.append({"role": "user", "content": user_message})

    start_time = time.time()
    accumulated_content = []
    try:
        response = client.chat.completions.create(
            model=model,
            messages=lm_messages,
            temperature=0.7,
            stream=True
        )

        for chunk in response:
            delta = chunk.choices[0].delta if chunk.choices else None
            content = delta.content if delta else None
            if content:
                accumulated_content.append(content)
                yield {"event": "token", "text": content}

        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        answer = "".join(accumulated_content)

        # Estimate tokens
        prompt_tokens = int(len(user_message.split()) * 1.3)
        completion_tokens = int(len(answer.split()) * 1.3)
        total_tokens = prompt_tokens + completion_tokens

        # Print debug log as requested in guideline #6
        print("LLM stream usage:", prompt_tokens, completion_tokens, total_tokens, response_time_ms)

        yield {
            "event": "done",
            "answer": answer,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": total_tokens,
            "response_time_ms": response_time_ms,
            "status": "success",
        }

    except Exception as e:
        end_time = time.time()
        response_time_ms = int((end_time - start_time) * 1000)
        error_message = str(e)
        print(f"Error calling LM Studio in stream: {error_message}")
        yield {
            "event": "error",
            "error": error_message,
            "response_time_ms": response_time_ms,
        }
