from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .database import create_db_and_tables, get_session, seed_db
from .llm import generate_llm_response
from .models import Conversation, Message


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    seed_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/conversations/", response_model=Conversation)
def create_conversation(
    conversation: Conversation, session: Session = Depends(get_session)
):
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


@app.get("/conversations/", response_model=List[Conversation])
def read_conversations(
    offset: int = 0, limit: int = 100, session: Session = Depends(get_session)
):
    conversations = session.exec(
        select(Conversation).offset(offset).limit(limit)
    ).all()
    return conversations


@app.get("/conversations/{conversation_id}", response_model=Conversation)
def read_conversation(
    conversation_id: int, session: Session = Depends(get_session)
):
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@app.put("/conversations/{conversation_id}", response_model=Conversation)
def update_conversation(
    conversation_id: int,
    conversation_update: Conversation,
    session: Session = Depends(get_session),
):
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation_update.title is not None:
        conversation.title = conversation_update.title

    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


@app.get(
    "/conversations/{conversation_id}/messages", response_model=List[Message]
)
def read_conversation_messages(
    conversation_id: int, session: Session = Depends(get_session)
):
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation.messages


@app.post("/conversations/{conversation_id}/messages", response_model=Message)
def create_message(
    conversation_id: int,
    message: Message,
    session: Session = Depends(get_session),
):
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save the user's message
    message.conversation_id = conversation_id
    session.add(message)
    session.commit()
    session.refresh(message)

    # Only generate assistant response for user messages
    if message.role == "user":
        # Get all messages in the conversation via relationship
        all_messages = conversation.messages

        # Sort messages by ID to maintain chronological order
        all_messages = sorted(all_messages, key=lambda m: m.id or 0)

        # Build message history for the LLM
        messages_for_llm = [
            {"role": msg.role, "content": msg.content} for msg in all_messages
        ]

        # Call the LLM
        try:
            response_content = generate_llm_response(messages_for_llm)

            # Create and save the assistant's response
            assistant_message = Message(
                conversation_id=conversation_id,
                role="assistant",
                content=response_content,
            )
            session.add(assistant_message)
            session.commit()
            session.refresh(assistant_message)

            return assistant_message
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error generating LLM response: {str(e)}",
            )

    return message


@app.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int, session: Session = Depends(get_session)
):
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    session.delete(conversation)
    session.commit()
    return {"ok": True}
