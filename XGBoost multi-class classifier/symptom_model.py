import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
import joblib
import os
from filters import apply_sex_constraints


# -----------------------------
# Step 1: Define symptom dictionaries by sex
# -----------------------------
# Male-only cancers
male_only_cancers = {
    "Prostate Cancer": [
        "No symptoms (early stage)", "Erectile dysfunction", "Blood in urine", "Blood in semen",
        "Trouble urinating", "Frequent urination", "Weak urine stream / slow flow", "Fatigue",
        "Unexplained weight loss", "Back pain", "Bone pain (pelvis, hips, ribs, spine, head, neck)",
        "Bone fracture (from metastasis)", "Leg weakness", "Foot weakness", "Paralysis (from spinal cord compression)"
    ]
}

# Female-only cancers
female_only_cancers = {
    "Cervical Cancer": [
        "No early symptoms (often)", "Vaginal bleeding", "Bleeding after sex", "Vaginal mass",
        "Pain during sex", "Vaginal discharge", "Bleeding after douching", "Bleeding after pelvic exam",
        "Loss of appetite", "Weight loss", "Fatigue", "Pelvic pain", "Back pain", "Leg pain", "Swollen legs",
        "Heavy vaginal bleeding", "Bone fractures", "Urine leakage from vagina", "Feces leakage from vagina",
        "Flank pain (kidney blockage)", "Blood clots in legs", "Rectal bleeding", "Blood in urine"
    ],
    "Uterine Cancer": [
        "Abnormal vaginal bleeding", "Abnormal vaginal discharge", "Heavy menstrual bleeding",
        "Bleeding between periods", "Bleeding after menopause", "Pelvic pain", "Pelvic pressure"
    ],
    "Vulvar Cancer": [
        "Itching on vulva", "Burning sensation on vulva", "Vulvar bleeding", "Vulvar skin color changes (redder or whiter)",
        "Vulvar rash", "Vulvar warts", "Vulvar sores", "Vulvar lumps", "Vulvar ulcers", "Vulvar discharge",
        "Pelvic pain", "Pain during urination", "Pain during sex", "Lump on labia majora",
        "Irritation of vulva", "Bartholin gland painful lump"
    ]
}

# Both-sex cancers
both_sex_cancers = {
    "Breast Cancer": [
        "Lump in breast", "Breast swelling", "Breast pain", "Skin dimpling", "Skin thickening",
        "Skin redness", "Skin dryness", "Nipple pain", "Nipple inversion", "Nipple discharge",
        "Swelling of lymph nodes (underarm, collarbone)", "Inflammatory swelling and redness of breast",
        "Nipple/areola irritation (red, scaly)", "Bone pain (if spread)", "Bone fractures",
        "Abdominal pain (if spread to liver)", "Nausea/vomiting (liver/brain spread)", "Jaundice (yellow skin)",
        "Chest pain (lung spread)", "Shortness of breath", "Persistent cough", "Headache (brain spread)",
        "Seizures", "Vision problems", "Speech problems", "Memory changes", "Behavior changes"
    ],
    "Basal Cell Carcinoma (BCC)": [
        "Skin lesion", "Sore that doesn't heal", "Red patch", "Itching",
        "Shiny pearly skin nodule", "Red skin patch", "Skin thickening", "Scar-like skin changes"
    ],
    "Squamous Cell Carcinoma (SCC)": [
        "Skin lesion", "Crusty patch", "Ulcer", "Red bump", "Skin changes not healing", "Skin ulcer", "Discolored skin",
        "Mole changes (jagged edges, bigger size, color change, bleeding, texture change)",
        "Painful lesion", "Itchy lesion", "Burning lesion", "Large brown spot with darker speckles"
    ],
    "Colorectal Cancer": [
        "Blood in stool", "Change in bowel habits", "Abdominal pain", "Weight loss",
        "Constipation (worsening)", "Thin stool (narrow caliber)", "Loss of appetite",
        "Nausea", "Vomiting", "Rectal bleeding", "Anemia", "Bowel habit change"
    ],
    "Primary site unknown": [
        "Unexplained symptoms", "Weight loss", "Fatigue", "Pain", "Masses or lumps in body",
        "Swelling in body", "Rapid tumor growth", "Unusual metastasis sites",
        "Enlarged lymph nodes (armpit, chest, abdomen, pelvis)"
    ],
    "Melanoma": [
        "Dark mole", "Skin lesion", "Itching", "Change in mole size/color",
        "Multicolored mole (brown to black)", "Pink/red/fleshy mole (amelanotic)",
        "Mole changes (size, shape, color, elevation)", "New mole in adulthood", "Pain at mole site",
        "Itchy mole", "Ulcerated mole", "Redness around mole", "Bleeding mole", "Asymmetrical mole",
        "Irregular borders", "Large mole (>6mm)", "Mole evolving over time", "Elevated lump",
        "Firm lump", "Growing lump", "Loss of appetite (if spread)", "Nausea (if spread)",
        "Vomiting (if spread)", "Fatigue", "Brain metastases (headache, seizures, confusion)",
        "Other metastases: liver, intestines, bone, lungs, lymph nodes"
    ],
    "Non-Hodgkin lymphoma": [
        "Swollen lymph nodes", "Fever", "Night sweats", "Weight loss", "Fatigue",
        "Bone pain", "Chest pain", "Itchy skin", "Skin lumps (itchy, red, purple)",
        "Brain involvement: weakness, seizures, confusion, personality change", "Enlarged lymph nodes",
        "Lumps under skin"
    ],
    "Lung Cancer": [
        "Cough", "Chest pain", "Shortness of breath", "Weight loss", "Early: no symptoms",
        "Persistent cough (new or worsening)", "Coughing blood (streaks or large amounts)",
        "Loss of appetite", "Fatigue", "Fever", "Night sweats", "Difficulty swallowing",
        "Hoarseness (voice change)", "Shoulder pain (radiating down arm – Pancoast tumor)",
        "Swollen lymph nodes (above collarbone)", "Swelling of face/upper body (superior vena cava syndrome)",
        "Fluid around heart (arrhythmia, heart failure)",
        "Brain metastasis: headache, nausea, vomiting, seizures, confusion",
        "Bone metastasis: bone pain, fractures, spinal cord compression",
        "Liver metastasis: enlarged liver, abdominal pain, fever, jaundice",
        "Hormone syndromes: Hypercalcemia → nausea, constipation, thirst, confusion",
        "Hormone syndromes: Hyponatremia (low sodium)", "Hypokalemia (low potassium)",
        "Nail clubbing", "Joint pain, bone thickening (hypertrophic osteoarthropathy)",
        "Blood clots (migratory thrombophlebitis, heart clots, DIC)",
        "Autoimmune effects: muscle weakness, neuropathy, brain inflammation"
    ],
    "Oesophagus Cancer": [
        "Difficulty swallowing (solids → liquids)", "Pain when swallowing", "Weight loss", "Loss of appetite",
        "Pain behind breastbone", "Severe heartburn-like pain", "Hoarse/raspy cough",
        "Regurgitation of food", "Nausea", "Vomiting", "Coughing when eating/drinking", "Vomiting blood",
        "Aspiration pneumonia", "Airway obstruction", "Superior vena cava syndrome",
        "Hypercalcemia (high calcium)",
        "Metastasis: Liver → jaundice, abdominal swelling",
        "Metastasis: Lungs → breathing difficulty, pleural effusion",
        "Metastasis: Bone → pain, fractures"
    ],
    "Bladder Cancer": [
        "Blood in urine", "Frequent urination", "Painful urination", "Back pain",
        "Visible blood in urine (painless)", "Microscopic blood in urine (only in tests)",
        "No symptoms (detected by scan)", "Blocked urine flow → swollen kidneys, flank pain",
        "Bone metastasis: bone pain, fractures", "Lung metastasis: cough, coughing blood, breathlessness",
        "Liver metastasis: abdominal pain, swelling, jaundice, itching, weight loss",
        "Swollen lymph nodes in abdomen/groin → pain, swelling"
    ]
}

# -----------------------------
# Build final dictionaries by sex
# -----------------------------
male_symptom_dict = {**male_only_cancers, **both_sex_cancers}
female_symptom_dict = {**female_only_cancers, **both_sex_cancers}

# -----------------------------
# Step 2: Combine for full symptom list
# -----------------------------
all_symptoms = sorted({
    symptom
    for symptom_list in list(male_symptom_dict.values()) + list(female_symptom_dict.values())
    for symptom in symptom_list
})

# -----------------------------
# Step 3: Generate synthetic dataset by sex
# -----------------------------
num_samples = 1000
data = []

np.random.seed(42)

for _ in range(num_samples):
    sex = np.random.choice(["Male", "Female"])
    if sex == "Male":
        cancer_types = list(male_symptom_dict.keys())
        symptom_dict = male_symptom_dict
    else:
        cancer_types = list(female_symptom_dict.keys())
        symptom_dict = female_symptom_dict

    cancer = np.random.choice(cancer_types)
    features = {symptom: 0 for symptom in all_symptoms}
    present_symptoms = np.random.choice(
        symptom_dict[cancer],
        size=np.random.randint(1, len(symptom_dict[cancer]) + 1),
        replace=False
    )
    for s in present_symptoms:
        features[s] = 1
    features['Sex'] = sex
    features['CancerType'] = cancer
    data.append(features)

df = pd.DataFrame(data)

# -----------------------------
# Step 4: Prepare features and labels
# -----------------------------
X = df[all_symptoms + ['Sex']].copy()
X['Sex'] = X['Sex'].map({'Male': 0, 'Female': 1})

y = df['CancerType']
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# -----------------------------
# Step 5: Train or load XGBoost model + save all artifacts
# -----------------------------
model_file = "cancer_model.pkl"
le_file = "label_encoder.pkl"
feat_file = "feature_columns.pkl"

if os.path.exists(model_file) and os.path.exists(le_file) and os.path.exists(feat_file):
    model = joblib.load(model_file)
    le = joblib.load(le_file)
    feature_columns = joblib.load(feat_file)
else:
    model = XGBClassifier(
        objective='multi:softprob',
        num_class=len(le.classes_),
        eval_metric='mlogloss',
    )
    model.fit(X, y_encoded)

    # Save everything
    joblib.dump(model, model_file)
    joblib.dump(le, le_file)
    joblib.dump(list(X.columns), feat_file)

feature_columns = joblib.load(feat_file)

# -----------------------------
# Step 6: Predict function considering sex (with filtering)
# -----------------------------
def predict_cancer(input_symptoms, sex):
    features = {symptom: 0 for symptom in all_symptoms}
    for s in input_symptoms:
        if s in features:
            features[s] = 1
    features['Sex'] = 0 if sex.lower() == "male" else 1

    X_input = pd.DataFrame([features])
    X_input = X_input[feature_columns]  # ensure same column order

    probs = model.predict_proba(X_input)[0]
    prob_dict = {le.classes_[i]: float(probs[i]) for i in range(len(le.classes_))}

    # Apply sex-based medical constraints
    prob_dict = apply_sex_constraints(prob_dict, sex, male_symptom_dict, female_symptom_dict)

    sorted_probs = dict(sorted(prob_dict.items(), key=lambda x: x[1], reverse=True))
    return sorted_probs

# -----------------------------
# Step 7: Example usage
# -----------------------------
if __name__ == "__main__":
    user_symptoms = ["Cough", "Chest pain", "Weight loss"]
    user_sex = "Male"

    top_predictions = predict_cancer(user_symptoms, user_sex)

    print(f"Input symptoms: {user_symptoms} | Sex: {user_sex}")
    print("Predicted top cancer types with probabilities:")
    for cancer, prob in top_predictions.items():
        print(f"{cancer}: {prob:.2f}") 
