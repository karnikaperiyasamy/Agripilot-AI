from app.schemas.irrigation_schema import IrrigationRequest, IrrigationResponse

# FAO-56 dual crop coefficient Kc by growth stage
FAO_KC_TABLE = {
    "Rice": {"Initial": 1.05, "Vegetative": 1.15, "Tillering/Branching": 1.20, "Flowering": 1.35, "Fruiting/GrainFilling": 1.15, "Maturity": 0.90},
    "Wheat": {"Initial": 0.40, "Vegetative": 0.70, "Tillering/Branching": 0.90, "Flowering": 1.15, "Fruiting/GrainFilling": 1.05, "Maturity": 0.45},
    "Maize": {"Initial": 0.40, "Vegetative": 0.75, "Tillering/Branching": 0.95, "Flowering": 1.20, "Fruiting/GrainFilling": 1.15, "Maturity": 0.60},
    "Sugarcane": {"Initial": 0.40, "Vegetative": 0.90, "Tillering/Branching": 1.10, "Flowering": 1.25, "Fruiting/GrainFilling": 1.20, "Maturity": 0.75},
    "Tomato": {"Initial": 0.45, "Vegetative": 0.75, "Tillering/Branching": 0.90, "Flowering": 1.15, "Fruiting/GrainFilling": 1.10, "Maturity": 0.80},
    "Potato": {"Initial": 0.50, "Vegetative": 0.75, "Tillering/Branching": 0.90, "Flowering": 1.15, "Fruiting/GrainFilling": 1.05, "Maturity": 0.75}
}

# Soil Available Water Capacity (AWC in mm/meter) and Management Allowed Depletion (MAD)
SOIL_AWC = {
    "Alluvial": 160.0,
    "Loamy": 150.0,
    "Clayey": 180.0,
    "Black": 190.0,
    "Red": 120.0,
    "Sandy": 80.0
}

def calculate_irrigation_decision(req: IrrigationRequest) -> IrrigationResponse:
    clean_crop = req.crop.replace("Basmati ", "").strip()
    kc_crop = FAO_KC_TABLE.get(clean_crop, FAO_KC_TABLE["Wheat"])
    kc = kc_crop.get(req.growth_stage, 1.0)

    # Simplified Hargreaves reference evapotranspiration ET0 (mm/day) based on ambient temperature
    # Approx: ET0 ~ 0.0023 * (T + 17.8) * sqrt(delta_T) * Ra
    et0 = max(2.5, min(7.5, (req.temperature_c * 0.16)))

    # Crop water requirement ETc = Kc * ET0
    etc = round(kc * et0, 2)

    # Soil moisture threshold
    # Field capacity is 100%, permanent wilting is 0%
    # MAD (Management Allowed Depletion) is typically 45-55% for agronomic crops
    moisture = req.soil_moisture_percent
    effective_rain = req.recent_rainfall_mm * 0.8

    # Water deficit calculation
    deficit_mm = max(0.0, (55.0 - moisture) * 0.8 - effective_rain)

    # Decision threshold
    irrigate_today = (moisture < 45.0 and effective_rain < 5.0) or (req.growth_stage == "Flowering" and moisture < 50.0)

    if moisture < 30.0:
        urgency = "CRITICAL / SEVERE MOISTURE STRESS - Irrigate immediately to prevent floral abortion and yield penalty"
        depth_mm = max(25.0, deficit_mm + etc)
    elif irrigate_today:
        urgency = "HIGH - Schedule morning irrigation cycle"
        depth_mm = max(18.0, deficit_mm + etc)
    elif moisture < 60.0:
        urgency = "MODERATE - Soil moisture adequate for 2-3 days under present weather"
        depth_mm = 0.0
    else:
        urgency = "OPTIMAL - Soil profile at field capacity. Withhold irrigation to prevent root rot and nitrogen leaching"
        depth_mm = 0.0

    # 1 mm over 1 acre = 4046.86 Liters
    liters_per_acre = depth_mm * 4046.86
    total_liters = round(liters_per_acre * req.field_area_acres, 0)

    # Savings: Precision drip uses 40-50% less water than flood irrigation
    conventional_flood_liters = total_liters * 1.85 if total_liters > 0 else 0
    savings_liters = round(conventional_flood_liters - total_liters, 0)

    basis = (
        f"FAO-56 Dual Crop Coefficient (Kc={kc:.2f}) across {req.growth_stage} stage; "
        f"Daily ETc={etc} mm/day under {req.temperature_c}°C; Current Root-zone Soil Moisture={moisture}%"
    )

    return IrrigationResponse(
        crop=req.crop,
        irrigate_today=irrigate_today,
        urgency=urgency,
        crop_water_requirement_mm_day=etc,
        recommended_water_depth_mm=round(depth_mm, 1),
        recommended_total_liters=total_liters,
        estimated_water_savings_drip_liters=savings_liters,
        scientific_basis=basis,
        model_version="agritwin-irrigation-fao56-v1.0"
    )
