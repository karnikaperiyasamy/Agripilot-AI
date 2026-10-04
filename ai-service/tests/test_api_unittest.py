import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAgriTwinAIService(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_root_and_health(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "HEALTHY")

    def test_model_status_and_registry(self):
        res = self.client.get("/api/ml/models/status")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "HEALTHY")

        res_reg = self.client.get("/api/ml/models/registry")
        self.assertEqual(res_reg.status_code, 200)
        self.assertIn("models", res_reg.json())

    def test_crop_yield_prediction(self):
        payload = {
            "crop": "Basmati Rice",
            "soil_type": "Alluvial",
            "irrigation_type": "Drip",
            "area_acres": 5.0,
            "rainfall_mm": 800.0,
            "temperature_c": 28.5,
            "nitrogen_kg": 120.0,
            "phosphorus_kg": 50.0,
            "potassium_kg": 50.0
        }
        res = self.client.post("/api/ml/predict-yield", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["estimated_yield_per_acre"], 0)
        self.assertGreater(data["total_estimated_yield"], 0)
        self.assertIn("key_factors", data)

    def test_pest_risk_prediction(self):
        payload = {
            "crop": "Rice",
            "growth_stage": "Tillering/Branching",
            "temperature_c": 29.0,
            "humidity_percent": 84.0,
            "rainfall_7d_mm": 50.0,
            "soil_moisture_percent": 70.0,
            "leaf_wetness_hours": 7.0
        }
        res = self.client.post("/api/ml/pest-risk", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn(data["risk_tier"], ["Low", "Moderate", "High", "Severe"])
        self.assertGreater(len(data["management_advice"]), 0)

    def test_price_forecasting(self):
        payload = {
            "crop": "Wheat",
            "mandi": "Khanna (Punjab)",
            "current_price": 2500.0,
            "lag_7d_price": 2480.0,
            "arrival_volume_quintals": 3200.0
        }
        res = self.client.post("/api/ml/price-forecast", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["forecast_7d"], 0)
        self.assertGreater(data["forecast_14d"], 0)
        self.assertIn("sell_now_vs_wait_recommendation", data)

    def test_harvest_window(self):
        payload = {
            "crop": "Basmati Rice",
            "sowing_date": "2026-06-01",
            "growth_stage": "Fruiting/GrainFilling",
            "field_area_acres": 5.0,
            "avg_temperature_c": 28.0
        }
        res = self.client.post("/api/ml/harvest-window", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["estimated_maturity_days"], 0)
        self.assertGreater(len(data["optimal_harvest_start"]), 0)

    def test_matching_engine(self):
        payload = {
            "target_crop": "Wheat",
            "required_quantity": 50.0,
            "target_price": 2500.0,
            "buyer_latitude": 28.7041,
            "buyer_longitude": 77.1025,
            "minimum_quality": "Grade A",
            "candidates": [
                {
                    "id": "c1",
                    "name": "Punjab Farm A",
                    "crop": "Wheat",
                    "quantity": 60.0,
                    "unit_price": 2480.0,
                    "latitude": 28.9000,
                    "longitude": 77.2000,
                    "quality_grade": "Grade A"
                }
            ]
        }
        res = self.client.post("/api/ml/match-buyer-farmer", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(len(data["top_matches"]), 1)
        self.assertGreater(data["top_matches"][0]["match_score_percent"], 50)

    def test_irrigation_decision(self):
        payload = {
            "crop": "Wheat",
            "growth_stage": "Flowering",
            "soil_type": "Alluvial",
            "field_area_acres": 3.0,
            "temperature_c": 26.0,
            "soil_moisture_percent": 32.0,
            "recent_rainfall_mm": 0.0
        }
        res = self.client.post("/api/ml/irrigation-decision", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["irrigate_today"])
        self.assertGreater(data["recommended_total_liters"], 0)

    def test_what_if_simulation(self):
        payload = {
            "baseline": {
                "scenario_name": "Conventional Flood",
                "crop": "Basmati Rice",
                "area_acres": 5.0,
                "irrigation_method": "Flood",
                "fertilizer_intensity": "Conventional",
                "expected_mandi_price": 4000.0,
                "selling_timing": "Immediate"
            },
            "alternatives": [
                {
                    "scenario_name": "Precision Drip + Storage",
                    "crop": "Basmati Rice",
                    "area_acres": 5.0,
                    "irrigation_method": "Drip",
                    "fertilizer_intensity": "Optimized",
                    "expected_mandi_price": 4000.0,
                    "selling_timing": "Post-Harvest Storage (+30d)"
                }
            ]
        }
        res = self.client.post("/api/ml/simulate-decision", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["recommended_scenario"], "Precision Drip + Storage")
        self.assertGreater(data["expected_profit_gain"], 0)

if __name__ == "__main__":
    unittest.main()
