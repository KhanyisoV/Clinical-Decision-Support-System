from pydantic import BaseModel
from typing import List, Dict

class PredictionInput(BaseModel):
    symptoms: List[str]
    sex: str

class PredictionOutput(BaseModel):
    predictions: Dict[str, float]
