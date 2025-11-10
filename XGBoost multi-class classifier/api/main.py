from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from symptom_model import predict_cancer
from api.schemas import PredictionInput, PredictionOutput

# --- App Initialization ---
app = FastAPI(
    title="Cancer Prediction API",
    description=(
        "This API predicts possible cancer types based on the user's selected symptoms "
        "and biological sex. The prediction is powered by an XGBoost multi-class classifier model."
    ),
    version="1.0.0",
)

# --- CORS Configuration ---
# Allow requests from frontend frameworks (React, ASP.NET Core, Angular, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Root Route ---
@app.get("/")
def root():
    """
    Basic root route to confirm API is running.
    """
    return {
        "message": "Cancer Prediction API is running successfully!",
        "docs_url": "/docs",
        "example_endpoint": "/predict",
    }

# --- Health Check Route ---
@app.get("/health")
def health_check():
    """
    Simple route for server uptime/monitoring checks.
    """
    return {"status": "healthy"}

# --- Prediction Route ---
@app.post("/predict", response_model=PredictionOutput)
def get_prediction(input: PredictionInput):
    """
    Receives a list of symptoms and the user's sex.
    Returns the top predicted cancer types and their probabilities.
    """
    result = predict_cancer(input.symptoms, input.sex)
    return {"predictions": result}
