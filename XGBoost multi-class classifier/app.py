from fastapi import FastAPI
from pydantic import BaseModel
from symptom_model import predict_cancer

app = FastAPI()

class PredictionRequest(BaseModel):
    symptoms: list[str]
    sex: str

@app.get("/")
def root():
    return {"message": "Cancer prediction ML service running"}

@app.post("/predict")
def predict(request: PredictionRequest):
    results = predict_cancer(request.symptoms, request.sex)
    return results
