
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.supabase_client import get_supabase_client

router = APIRouter()
security = HTTPBearer()


def get_authenticated_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    access_token = credentials.credentials

    try:
        supabase = get_supabase_client(access_token)
        auth_response = supabase.auth.get_user(access_token)
        user = auth_response.user

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired access token"
            )

        return supabase, user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )


# Get all conversations belonging to the logged-in user
@router.get("/conversations")
async def get_conversations(
    auth=Depends(get_authenticated_user)
):
    supabase, user = auth

    try:
        response = (
            supabase.table("conversations")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", desc=True)
            .execute()
        )

        return {"conversations": response.data}

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# Get messages from a particular conversation
@router.get("/conversations/{conversation_id}")
async def get_conversation_messages(
    conversation_id: str,
    auth=Depends(get_authenticated_user)
):
    supabase, user = auth

    try:
        conversation = (
            supabase.table("conversations")
            .select("id")
            .eq("id", conversation_id)
            .eq("user_id", user.id)
            .execute()
        )

        if not conversation.data:
            raise HTTPException(
                status_code=404,
                detail="Conversation not found"
            )

        response = (
            supabase.table("conversation_messages")
            .select("*")
            .eq("conversation_id", conversation_id)
            .eq("user_id", user.id)
            .order("created_at", desc=False)
            .execute()
        )

        return {"messages": response.data}

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))
