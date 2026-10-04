import pandas as pd
from typing import Dict, Any, List
from app.models.loader import registry
from app.schemas.pest_schema import PestRiskRequest, PestRiskResponse

PEST_MANAGEMENT_KB = {
    "Rice": {
        "threats": ["Yellow Stem Borer (Scirpophaga incertulas)", "Brown Planthopper (Nilaparvata lugens)", "Bacterial Leaf Blight (Xanthomonas oryzae)"],
        "advice": [
            "Install pheromone traps @ 8 traps/acre for stem borer monitoring.",
            "Avoid excessive urea/nitrogen application which exacerbates planthopper multiplication.",
            "Alternate wetting and drying (AWD) to disrupt brown planthopper microhabitat."
        ],
        "inspections": ["Inspect tillers for dead hearts or white ears.", "Examine leaf margins for water-soaked yellowing stripes."]
    },
    "Wheat": {
        "threats": ["Wheat Aphid (Sitobion avenae)", "Yellow / Stripe Rust (Puccinia striiformis)", "Termites"],
        "advice": [
            "Conserve natural predators such as ladybird beetles and hoverfly larvae.",
            "Apply neem seed kernel extract (NSKE 5%) during initial aphid colonies.",
            "Spray Propiconazole 25% EC @ 0.1% if yellow rust pustules appear on flag leaves."
        ],
        "inspections": ["Check upper foliage for linear yellow powdery pustules.", "Inspect earheads and underside of leaves for aphid clusters."]
    },
    "Maize": {
        "threats": ["Fall Armyworm (Spodoptera frugiperda)", "Stem Borer (Chilo partellus)", "Turcicum Leaf Blight"],
        "advice": [
            "Whorl application of sand + lime mixture (9:1) or Bacillus thuringiensis @ 2g/L.",
            "Maintain clean field borders and destroy alternative grass weed hosts.",
            "Intercrop with cowpea or pulses to increase predatory wasp activity."
        ],
        "inspections": ["Check central leaf whorls for pinholes, ragged margins, and sawdust-like frass."]
    },
    "Tomato": {
        "threats": ["Tomato Fruit Borer (Helicoverpa armigera)", "Whitefly (Bemisia tabaci)", "Early Blight (Alternaria solani)"],
        "advice": [
            "Install yellow sticky traps @ 15 traps/acre for whitefly vector suppression.",
            "Spray Trichoderma viride @ 5g/L or copper oxychloride 50% WP @ 2.5g/L for blight.",
            "Handpick infested bore fruits and destroy deeply to prevent pupation."
        ],
        "inspections": ["Inspect fruit calyx for entry boreholes.", "Inspect lower leaves for concentric target-board dark brown lesions."]
    }
}

DEFAULT_KB = {
    "threats": ["Sucking Pests (Thrips, Aphids)", "Fungal Leaf Spot", "Drought / Thermal Stress"],
    "advice": [
        "Maintain optimal soil moisture and avoid water stagnation.",
        "Apply organic bio-pesticides (Neem oil 1500 ppm @ 3-5 ml/L).",
        "Practice rogueing (prompt removal of symptomatic diseased plants)."
    ],
    "inspections": ["Daily perimeter scout for early foliar discolorations and insect egg masses."]
}

def evaluate_pest_risk(req: PestRiskRequest) -> PestRiskResponse:
    clean_crop = req.crop.replace("Basmati ", "").strip()
    
    # 1. Pipeline classification
    if registry.pest_model is not None:
        try:
            input_df = pd.DataFrame([{
                "crop": clean_crop if clean_crop in ["Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Tomato", "Potato"] else "Rice",
                "growth_stage": req.growth_stage,
                "temperature_c": req.temperature_c,
                "humidity_percent": req.humidity_percent,
                "rainfall_7d_mm": req.rainfall_7d_mm,
                "soil_moisture_percent": req.soil_moisture_percent,
                "leaf_wetness_hours": req.leaf_wetness_hours
            }])
            tier = str(registry.pest_model.predict(input_df)[0])
        except Exception:
            tier = "Moderate"
    else:
        tier = "Moderate"

    # 2. Risk score derivation
    base_score = 25.0
    if req.humidity_percent > 80.0:
        base_score += 25.0
    if req.leaf_wetness_hours > 6.0:
        base_score += 20.0
    if req.rainfall_7d_mm > 75.0:
        base_score += 15.0
    if req.soil_moisture_percent < 30.0 and req.temperature_c > 33.0:
        base_score += 20.0 # Heat/moisture stress
    
    risk_score = round(min(96.0, max(12.0, base_score)), 1)
    
    # Ensure tier aligns with score
    if risk_score >= 75.0:
        risk_tier = "Severe"
    elif risk_score >= 55.0:
        risk_tier = "High"
    elif risk_score >= 35.0:
        risk_tier = "Moderate"
    else:
        risk_tier = "Low"

    kb = PEST_MANAGEMENT_KB.get(clean_crop, DEFAULT_KB)

    return PestRiskResponse(
        crop=req.crop,
        growth_stage=req.growth_stage,
        risk_tier=risk_tier,
        risk_score=risk_score,
        likely_stress=kb["threats"][0] if risk_tier in ["High", "Severe"] else ("Mild Aphid/Vector Pressure" if risk_tier == "Moderate" else "Optimal Plant Vigor"),
        primary_threats=kb["threats"],
        management_advice=kb["advice"],
        recommended_inspections=kb["inspections"],
        model_version="agritwin-pest-gbc-v1.0"
    )
