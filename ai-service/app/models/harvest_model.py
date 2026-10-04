from datetime import datetime, timedelta
from app.schemas.harvest_schema import HarvestWindowRequest, HarvestWindowResponse

# Agronomic maturation duration (days from sowing) and base shelf life
CROP_PHENOLOGY = {
    "Rice": {"duration_days": 135, "shelf_ambient": 180, "shelf_cold": 365, "type": "grain"},
    "Wheat": {"duration_days": 125, "shelf_ambient": 210, "shelf_cold": 365, "type": "grain"},
    "Maize": {"duration_days": 110, "shelf_ambient": 120, "shelf_cold": 270, "type": "grain"},
    "Sugarcane": {"duration_days": 330, "shelf_ambient": 7, "shelf_cold": 14, "type": "perishable_stalk"},
    "Cotton": {"duration_days": 160, "shelf_ambient": 240, "shelf_cold": 365, "type": "fiber"},
    "Tomato": {"duration_days": 90, "shelf_ambient": 6, "shelf_cold": 21, "type": "perishable_fruit"},
    "Potato": {"duration_days": 100, "shelf_ambient": 45, "shelf_cold": 180, "type": "tuber"}
}

def estimate_harvest_window(req: HarvestWindowRequest) -> HarvestWindowResponse:
    clean_crop = req.crop.replace("Basmati ", "").strip()
    pheno = CROP_PHENOLOGY.get(clean_crop, {"duration_days": 120, "shelf_ambient": 90, "shelf_cold": 180, "type": "grain"})

    try:
        sow_dt = datetime.strptime(req.sowing_date, "%Y-%m-%d")
    except ValueError:
        sow_dt = datetime.now() - timedelta(days=60)

    now = datetime.now()
    days_elapsed = max(0, (now - sow_dt).days)
    total_days = pheno["duration_days"]

    # Thermal adjustment: temperatures > 32 accelerate ripening by 5-10%
    if req.avg_temperature_c > 32.0:
        total_days = int(total_days * 0.93)

    maturity_pct = min(100.0, round((days_elapsed / total_days) * 100.0, 1))

    optimal_harvest_dt = sow_dt + timedelta(days=total_days)
    earliest_harvest_dt = optimal_harvest_dt - timedelta(days=7)
    latest_harvest_dt = optimal_harvest_dt + timedelta(days=10)

    # Post-harvest shelf life & spoilage risk
    is_perishable = pheno["type"] in ["perishable_fruit", "perishable_stalk"]
    if is_perishable and maturity_pct >= 90.0:
        spoilage_tier = "High Alert - Perishable Window"
    elif maturity_pct >= 95.0:
        spoilage_tier = "Moderate - Approaching Optimum"
    else:
        spoilage_tier = "Low - Growth Phase"

    protocols = []
    if pheno["type"] == "grain":
        protocols = [
            "Monitor grain moisture content: Harvest when grain moisture falls to 18-20% to minimize shatter loss.",
            "Sun-dry harvested paddy/grain down to 12-14% moisture before bagging to inhibit aflatoxin and grain weevils.",
            "Utilize hermetic grain bags (e.g. SuperGrain Bags) to prevent storage pest infestation without chemical fumigants."
        ]
    elif pheno["type"] == "perishable_fruit":
        protocols = [
            "Harvest during cool early morning hours to preserve pulp firmness and field turgidity.",
            "Grade fruits into Breaker / Turning / Pink stages according to target buyer transit distance.",
            "Pre-cool at 10-12°C within 4 hours of picking to curtail respiration and fungal mold proliferation."
        ]
    elif pheno["type"] == "tuber":
        protocols = [
            "Dehaulm (cut foliage) 10-12 days before digging to harden tuber periderm (skin curing).",
            "Store in well-ventilated dark diffused lighting curing sheds at 15-20°C with 85% RH for 10 days before cold storage."
        ]
    else:
        protocols = [
            "Dry produce under shaded cover on clean tarpaulins.",
            "Stack storage gunny bags on wooden pallets 30cm off the floor and away from walls."
        ]

    return HarvestWindowResponse(
        crop=req.crop,
        sowing_date=req.sowing_date,
        days_since_sowing=days_elapsed,
        estimated_maturity_days=total_days,
        maturity_percentage=maturity_pct,
        optimal_harvest_start=earliest_harvest_dt.strftime("%Y-%m-%d"),
        optimal_harvest_end=latest_harvest_dt.strftime("%Y-%m-%d"),
        shelf_life_ambient_days=pheno["shelf_ambient"],
        shelf_life_cold_storage_days=pheno["shelf_cold"],
        spoilage_risk_tier=spoilage_tier,
        post_harvest_protocols=protocols,
        model_version="agritwin-harvest-phenology-v1.0"
    )
