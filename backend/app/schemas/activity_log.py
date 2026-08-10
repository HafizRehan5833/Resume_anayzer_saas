import uuid
from datetime import datetime
from pydantic import BaseModel


class ActivityLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    activity: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ActivityLogListResponse(BaseModel):
    logs: list[ActivityLogResponse]
    total: int
    page: int
    size: int
