import joblib
from symptom_model import predict_cancer   #using central function

# -----------------------------
# Step 1: Interactive prompt
# -----------------------------
print("Welcome to the Cancer Prediction Tool!")
print("Please enter your symptoms separated by commas (e.g., Cough, Chest pain, Weight loss):")
user_input = input("Symptoms: ")
input_symptoms = [s.strip() for s in user_input.split(",")]

user_sex = input("Enter your sex (Male/Female): ").strip()

# -----------------------------
# Step 2: Call central prediction logic
# -----------------------------
results = predict_cancer(input_symptoms, user_sex)

# -----------------------------
# Step 3: Show results
# -----------------------------
print("\nPredicted cancer types with probabilities:")
for cancer, prob in results.items():
    print(f"{cancer}: {prob:.2f}")
