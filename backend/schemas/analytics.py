from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SentimentSummaryItem(BaseModel):
    sentiment: str
    count: int
    percentage: float

    model_config = ConfigDict(from_attributes=True)

class TopicOut(BaseModel):
    topic_name: str
    frequency: int
    date: datetime

    model_config = ConfigDict(from_attributes=True)

class KeywordOut(BaseModel):
    keyword: str
    score: float

    model_config = ConfigDict(from_attributes=True)
