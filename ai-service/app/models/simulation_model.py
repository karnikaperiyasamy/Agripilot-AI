from typing import List
from app.schemas.simulation_schema import (
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
    SimulationScenarioInput,
    SimulationScenarioResult
)

def evaluate_scenario(inp: SimulationScenarioInput) -> SimulationScenarioResult:
    clean_crop = inp.crop.replace("Basmati ", "").strip()
    
    # Base yield per acre (quintals)
    base_yields = {"Rice": 26.0, "Wheat": 21.0, "Maize": 24.0, "Sugarcane": 370.0, "Tomato": 115.0, "Potato": 125.0}
    base_y = base_yields.get(clean_crop, 22.0)

    # Cost breakdown per acre based on fertilizer & irrigation
    # Conventional baseline costs (INR/acre):
    # Seeds: 2500, Fert: 4500, Labor: 6000, Irrigation: 2500, Machinery/Fuel: 3500 -> Total ~ 19,000 / acre
    fert_cost_per_acre = 3200.0 if inp.fertilizer_intensity == "Low" else (4800.0 if inp.fertilizer_intensity == "Conventional" else 5600.0)
    irr_cost_per_acre = 1400.0 if inp.irrigation_method == "Drip" else (2200.0 if inp.irrigation_method == "Sprinkler" else 3000.0)
    other_costs_per_acre = 11500.0 # Seeds, labor, tilling, harvest

    total_cost_per_acre = fert_cost_per_acre + irr_cost_per_acre + other_costs_per_acre
    total_costs = round(total_cost_per_acre * inp.area_acres, 2)

    # Yield modifiers
    irr_mult = 1.14 if inp.irrigation_method == "Drip" else (1.06 if inp.irrigation_method == "Sprinkler" else 1.00)
    fert_mult = 0.88 if inp.fertilizer_intensity == "Low" else (1.00 if inp.fertilizer_intensity == "Conventional" else 1.10)

    est_yield_per_acre = base_y * irr_mult * fert_mult
    total_yield = round(est_yield_per_acre * inp.area_acres, 2)

    # Price timing effect: Selling post-harvest (+30d) usually captures +6-12% price gain minus warehouse cost (Rs. 80/quintal)
    if "Storage" in inp.selling_timing:
        realized_price = inp.expected_mandi_price * 1.085 - 80.0
    else:
        realized_price = inp.expected_mandi_price

    total_revenue = round(total_yield * realized_price, 2)
    net_profit = round(total_revenue - total_costs, 2)
    margin = round((net_profit / total_revenue) * 100.0, 1) if total_revenue > 0 else 0.0

    # Water consumption (liters/acre)
    water_liters_per_acre = 1800000.0 if inp.irrigation_method == "Drip" else (2400000.0 if inp.irrigation_method == "Sprinkler" else 3600000.0)
    total_water = round(water_liters_per_acre * inp.area_acres, 0)

    # Risk level & advantages
    advantages = []
    tradeoffs = []

    if inp.irrigation_method == "Drip":
        advantages.append("45% lower water and power consumption; uniform fertigation root uptake")
    else:
        tradeoffs.append("Elevated pumping electricity/diesel costs and increased weed proliferation")

    if inp.fertilizer_intensity == "Optimized":
        advantages.append("Soil-test-tailored split application maximizes nutrient assimilation without runoff")
    elif inp.fertilizer_intensity == "Low":
        tradeoffs.append("Nutrient starvation during grain-fill can reduce test weight")

    if "Storage" in inp.selling_timing:
        advantages.append(f"Captures estimated post-harvest price recovery of Rs. {round(inp.expected_mandi_price * 0.085, 0)}/quintal")
        tradeoffs.append("Requires verified moisture curing and hermetic or cold-storage holding fees")
    else:
        advantages.append("Immediate cash flow liquidity without storage handling fees")
        tradeoffs.append("Vulnerable to peak-harvest market price depression")

    risk_level = "Low" if (inp.irrigation_method == "Drip" and inp.fertilizer_intensity != "Low") else ("Moderate" if inp.irrigation_method == "Sprinkler" else "Elevated")

    return SimulationScenarioResult(
        scenario_name=inp.scenario_name,
        estimated_yield_total=total_yield,
        unit="Quintals",
        total_revenue=total_revenue,
        total_costs=total_costs,
        net_profit=net_profit,
        profit_margin_percent=margin,
        water_consumption_liters=total_water,
        risk_level=risk_level,
        key_advantages=advantages,
        tradeoffs=tradeoffs
    )

def simulate_what_if_scenarios(req: WhatIfSimulationRequest) -> WhatIfSimulationResponse:
    baseline_res = evaluate_scenario(req.baseline)
    alt_results = [evaluate_scenario(alt) for alt in req.alternatives]

    # Find highest net profit
    all_scenarios = [baseline_res] + alt_results
    best_scenario = max(all_scenarios, key=lambda s: s.net_profit)

    profit_gain = round(best_scenario.net_profit - baseline_res.net_profit, 2)

    if best_scenario.scenario_name == baseline_res.scenario_name:
        explanation = "The baseline configuration is already economically optimal under current input costs and market expectations."
    else:
        explanation = (
            f"Switching to '{best_scenario.scenario_name}' yields an estimated net gain of Rs. {profit_gain:,.2f} "
            f"(Profit Margin expands from {baseline_res.profit_margin_percent}% to {best_scenario.profit_margin_percent}%). "
            f"This is driven by superior input efficiency and strategic price realization."
        )

    return WhatIfSimulationResponse(
        baseline_result=baseline_res,
        alternative_results=alt_results,
        recommended_scenario=best_scenario.scenario_name,
        expected_profit_gain=profit_gain,
        explanation=explanation
    )
