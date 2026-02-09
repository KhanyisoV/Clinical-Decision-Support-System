"""
filters.py
This module contains functions to apply medical constraints and filters
to cancer prediction probabilities based on patient sex.
"""

# Dictionaries for sex-specific cancers
male_only_cancers = {
    "Prostate Cancer": [
        "No symptoms (early stage)", "Erectile dysfunction", "Blood in urine", "Blood in semen",
        "Trouble urinating", "Frequent urination", "Weak urine stream / slow flow", "Fatigue",
        "Unexplained weight loss", "Back pain", "Bone pain (pelvis, hips, ribs, spine, head, neck)",
        "Bone fracture (from metastasis)", "Leg weakness", "Foot weakness", "Paralysis (from spinal cord compression)"
    ]
}

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
        "Itching on vulva", "Burning sensation on vulva", "Vulvar bleeding", "Vulvar skin color changes",
        "Vulvar rash", "Vulvar warts", "Vulvar sores", "Vulvar lumps", "Vulvar ulcers", "Vulvar discharge",
        "Pelvic pain", "Pain during urination", "Pain during sex", "Lump on labia majora",
        "Irritation of vulva", "Bartholin gland painful lump"
    ]
}

def apply_sex_constraints(prob_dict, sex, male_symptom_dict, female_symptom_dict):
    """
    Filters a probability dictionary to remove cancers impossible for the patient's sex.

    Args:
        prob_dict (dict): {CancerType: probability}
        sex (str): "male" or "female"
        male_symptom_dict (dict): dict of male + both-sex cancers
        female_symptom_dict (dict): dict of female + both-sex cancers

    Returns:
        dict: filtered and renormalized probabilities
    """
    sex = sex.lower()
    if sex == "male":
        filtered = {k: v for k, v in prob_dict.items() if k in male_symptom_dict}
    else:
        filtered = {k: v for k, v in prob_dict.items() if k in female_symptom_dict}

    # Renormalize probabilities so they sum to 1
    total = sum(filtered.values())
    if total > 0:
        filtered = {k: v / total for k, v in filtered.items()}

    return filtered
