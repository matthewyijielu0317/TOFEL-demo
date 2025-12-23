"""Question schemas."""

from datetime import datetime
from pydantic import BaseModel, Field


class QuestionBase(BaseModel):
    """Base question schema."""
    instruction: str = Field(..., description="Question instruction text")
    title: str | None = Field(None, description="Display title for the question")
    difficulty: str | None = Field(None, description="Question difficulty: EASY, MEDIUM, or HARD")
    tags: list[str] | None = Field(None, description="Tags for categorization")
    sos_keywords: list[str] | None = Field(None, description="SOS hint keywords")
    sos_starter: str | None = Field(None, description="SOS starter sentence")


class QuestionCreate(QuestionBase):
    """Schema for creating a question."""
    question_id: str = Field(..., description="Business key like 'ind_001'")


class QuestionResponse(QuestionBase):
    """Schema for question response with all details."""
    question_id: str
    audio_url: str | None = Field(None, description="Presigned URL for audio playback")
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuestionListResponse(BaseModel):
    """Schema for list of questions."""
    questions: list[QuestionResponse]
    total: int
