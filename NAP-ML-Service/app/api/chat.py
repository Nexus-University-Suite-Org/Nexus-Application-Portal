import json
from typing import List

import anyio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import PORTAL_NAME
from app.models.generator import build_answer, is_conversational, quoted_sources
from app.models.knowledge_base import kb
from app.services.retrieval import retrieve

router = APIRouter()


class ChatMessage(BaseModel):
    role: str = Field(default="user")
    content: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list)


def _sse_chunk(text: str) -> str:
    delta = json.dumps(text, ensure_ascii=False)
    return f"data: {{\"choices\":[{{\"delta\":{{\"content\":{delta}}}}}]}}\n\n"


def _sse_sources(sources) -> str:
    return f"data: {json.dumps({'sources': sources}, ensure_ascii=False)}\n\n"


def _stream_answer(query: str, hits):
    answer = build_answer(query, hits, PORTAL_NAME)

    paragraph = ""
    for char in answer:
        paragraph += char
        if char == "\n":
            yield _sse_chunk(paragraph)
            paragraph = ""
    if paragraph:
        yield _sse_chunk(paragraph)

    # Only the records the reply actually quoted, so the panel under the answer
    # cannot list a source that was filtered out as irrelevant.
    sources = quoted_sources(query, hits)
    if sources:
        yield _sse_sources(sources)
    yield "data: [DONE]\n\n"


@router.post("/chat")
async def chat(request: ChatRequest):
    if len(request.messages) > 50:
        raise HTTPException(status_code=400, detail="Too many messages in conversation.")

    user_messages = [m for m in request.messages if m.role == "user"]
    if not user_messages:
        raise HTTPException(status_code=400, detail="A user message is required.")

    query = user_messages[-1].content

    if not kb.is_trained():
        return _sse_unavailable(query)

    # Small talk and messages with no topical words are answered from the canned
    # intents; running retrieval for them only risks attaching unrelated records.
    if is_conversational(query):
        hits = []
    else:
        hits = await anyio.to_thread.run_sync(retrieve, query)
    return _sse_response(query, hits)


def _sse_unavailable(query: str):
    from starlette.responses import StreamingResponse

    message = (
        "The knowledge base hasn't been trained yet. An administrator needs to run "
        "the training step so I can answer questions about Nexus University."
    )

    def generator():
        yield _sse_chunk(message)
        yield "data: [DONE]\n\n"

    return StreamingResponse(generator(), media_type="text/event-stream")


def _sse_response(query: str, hits):
    from starlette.responses import StreamingResponse

    return StreamingResponse(
        _stream_answer(query, hits),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )