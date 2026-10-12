# AgriPilot AI — Limitations, Field Constraints & Future Roadmap

## 1. Current Limitations & Real-World Field Challenges

While AgriPilot AI achieves high benchmark accuracies under controlled evaluation datasets, real-world agricultural environments present several physical and operational constraints:

### 1.1 Computer Vision & Foliar Imaging Constraints
1. **Ambient Lighting Variance:** Direct midday sunlight creates high-specularity reflections on waxy leaf surfaces, while heavy evening shadows can obscure early fungal lesions.
2. **Dew & Moisture Droplets:** Morning dew drops can be misclassified as early water-soaked bacterial spots by standard RGB convolutions without specialized polarized filters.
3. **Compound & Secondary Infections:** In subtropical Indian climates, crops frequently suffer simultaneous co-infections (e.g., Rice Blast combined with Bacterial Blight). While our top-3 probability distribution surfaces multi-pathogen possibilities, single-label softmax models assume mutually exclusive classes per image frame.

### 1.2 Soil Chemistry Telemetry
1. **Laboratory Soil Testing Latency:** Manual wet-chemistry soil testing (Kjeldahl digestion for Nitrogen, Bray/Olsen for Phosphorus) requires 3–7 business days. Farmers often input seasonal approximations rather than real-time daily readings.
2. **Soil Heterogeneity:** Nitrogen and moisture levels can vary significantly across a single 5-acre field depending on slope, drainage, and previous manure patches.

---

## 2. Future Engineering Roadmap

### 2.1 Edge Device Optimization (ONNX Runtime & TensorFlow Lite)
To eliminate cloud dependency in remote rural areas with intermittent cellular connectivity (2G/3G):
- **Model Quantization:** Convert the PyTorch CNN model (`crop_disease_cnn_v1.pth`) into INT8 quantized ONNX and TensorFlow Lite (`.tflite`) formats.
- **Client-Side Inference:** Execute inference directly inside the browser using WebAssembly (Wasm) or on Android devices via native CameraX integration, achieving zero latency and offline capability.

### 2.2 Physical IoT Telemetry Integration
- **Sensor Hardware:** Deploy ESP32 microcontrollers interfaced with RS485 Modbus soil sensors (NPK, soil moisture, electrical conductivity, soil temperature) transmitting over LoRaWAN (868/865 MHz Indian ISM band).
- **Automated Ingestion:** Stream telemetry directly into the AgriPilot Digital Twin engine via MQTT brokers, eliminating manual data entry.

### 2.3 Satellite Remote Sensing (Sentinel-2 NDVI Integration)
- **Spectral Indices:** Ingest European Space Agency (ESA) Sentinel-2 multispectral imagery (10m spatial resolution, 5-day revisit cycle).
- **Vegetation Health:** Compute Normalized Difference Vegetation Index (NDVI) and Normalized Difference Red Edge (NDRE) to detect canopy water stress and nitrogen deficiency at whole-farm scale before visible foliar lesions appear.

### 2.4 Multimodal Vision-Language Agronomic Models (VLM)
- Integrate fine-tuned Vision-Language Models (e.g., PaliGemma / LLaVA-Med-Agri) to enable farmers to ask follow-up spoken questions in Tamil, Hindi, or Punjabi while pointing the camera at affected plants.
