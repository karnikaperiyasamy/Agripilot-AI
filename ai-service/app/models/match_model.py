import math
from typing import List
from app.schemas.match_schema import MatchRequest, MatchResponse, MatchItem

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0 # Earth radius km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 1)

def match_farmers_to_buyer(req: MatchRequest) -> MatchResponse:
    scored_items = []

    for cand in req.candidates:
        # 1. Crop Match Score
        crop_match = 1.0 if cand.crop.lower() in req.target_crop.lower() or req.target_crop.lower() in cand.crop.lower() else 0.0
        if crop_match == 0.0:
            continue

        # 2. Distance Score (decay past 100km)
        dist_km = haversine_distance_km(req.buyer_latitude, req.buyer_longitude, cand.latitude, cand.longitude)
        dist_score = max(0.0, 1.0 - (dist_km / 250.0))

        # 3. Quantity Fulfillment Ratio
        q_ratio = min(1.0, cand.quantity / max(1.0, req.required_quantity))

        # 4. Price Variance Score
        # Target price vs asking price
        price_diff_pct = ((cand.unit_price - req.target_price) / req.target_price) * 100.0
        if price_diff_pct <= 0:
            price_score = 1.0 # Asking price is at or below buyer's budget
        elif price_diff_pct <= 10.0:
            price_score = 0.85
        elif price_diff_pct <= 25.0:
            price_score = 0.60
        else:
            price_score = 0.30

        # 5. Quality Compatibility
        quality_score = 1.0 if cand.quality_grade == req.minimum_quality else (0.8 if "B" in cand.quality_grade else 0.5)

        # Weighted aggregate
        total_score = (crop_match * 0.35) + (dist_score * 0.20) + (q_ratio * 0.20) + (price_score * 0.15) + (quality_score * 0.10)
        match_pct = round(total_score * 100.0, 1)

        factors = [
            f"Distance: {dist_km} km away ({int(dist_score * 100)}% proximity score)",
            f"Lot Quantity: {cand.quantity} MT fulfills {int(q_ratio * 100)}% of demand",
            f"Asking Price: Rs. {cand.unit_price}/unit vs Target Rs. {req.target_price}/unit ({price_diff_pct:+.1f}%)",
            f"Grade: {cand.quality_grade} verified"
        ]

        scored_items.append(MatchItem(
            candidate_id=cand.id,
            candidate_name=cand.name,
            match_score_percent=match_pct,
            distance_km=dist_km,
            quantity_fulfillment_percent=round(q_ratio * 100.0, 1),
            price_variance_percent=round(price_diff_pct, 1),
            quality_compatibility="Optimal" if quality_score >= 0.8 else "Acceptable",
            explainable_factors=factors
        ))

    scored_items.sort(key=lambda x: x.match_score_percent, reverse=True)

    return MatchResponse(
        query_crop=req.target_crop,
        total_candidates_analyzed=len(req.candidates),
        top_matches=scored_items[:10],
        model_version="agritwin-match-engine-v1.0"
    )
