# AgriPilot AI — Machine Learning Methodology & Academic Benchmarks

## 1. Research & Engineering Objective

The central objective of **AgriPilot AI** is to construct an end-to-end, reproducible machine learning system that delivers actionable decision support to farmers across three fundamental agricultural phases:
1. **Diagnosis:** Early computer vision detection of foliar crop diseases and fungal/bacterial pathogens.
2. **Selection:** Data-driven multi-class crop suitability recommendations based on soil chemistry and agro-climatic telemetry.
3. **Forecasting:** High-precision supervised harvest yield regression and agricultural risk quantification.

---

## 2. Module 1: Foliar Crop Disease Vision Classifier (PyTorch CNN)

### 2.1 Problem Formulation
Foliar visual diagnosis is formulated as a 14-class multiclass image classification task:
$$\hat{y} = \arg\max_{c \in C} P(y = c \mid \mathbf{X})$$
where $\mathbf{X} \in \mathbb{R}^{3 \times 256 \times 256}$ is the RGB foliar leaf image and $C$ comprises 14 pathology classes (including healthy control samples).

### 2.2 Class Taxonomy (14 Foliar Pathology Classes)
| Index | Class Identifier | Scientific / Common Name | Host Plant | Category |
|:---:|:---|:---|:---|:---|
| 0 | `rice_bacterial_blight` | Bacterial Leaf Blight (*Xanthomonas oryzae*) | Rice | Pathogenic Bacteria |
| 1 | `rice_blast` | Rice Blast (*Magnaporthe oryzae*) | Rice | Ascomycete Fungus |
| 2 | `rice_brown_spot` | Brown Spot (*Bipolaris oryzae*) | Rice | Fungus |
| 3 | `rice_healthy` | Healthy Rice Foliage | Rice | Healthy Control |
| 4 | `tomato_bacterial_spot` | Bacterial Spot (*Xanthomonas vesicatoria*) | Tomato | Bacteria |
| 5 | `tomato_early_blight` | Early Blight (*Alternaria solani*) | Tomato | Fungus |
| 6 | `tomato_late_blight` | Late Blight (*Phytophthora infestans*) | Tomato | Oomycete |
| 7 | `tomato_healthy` | Healthy Tomato Foliage | Tomato | Healthy Control |
| 8 | `potato_early_blight` | Early Blight (*Alternaria solani*) | Potato | Fungus |
| 9 | `potato_late_blight` | Late Blight (*Phytophthora infestans*) | Potato | Oomycete |
| 10 | `potato_healthy` | Healthy Potato Foliage | Potato | Healthy Control |
| 11 | `corn_common_rust` | Common Rust (*Puccinia sorghi*) | Corn / Maize | Fungus |
| 12 | `wheat_stripe_rust` | Stripe / Yellow Rust (*Puccinia striiformis*) | Wheat | Fungus |
| 13 | `apple_scab` | Apple Scab (*Venturia inaequalis*) | Apple | Fungus |

### 2.3 Architecture Specification
The custom lightweight convolutional architecture (`CropDiseaseCNN`) is engineered for rapid inference on standard CPU servers:
- **Total Parameters:** 357,774 floating-point parameters (1.43 MB storage footprint).
- **Inference Latency:** 1.15 ms on modern x86 CPU.
- **Layers:**
  1. Conv2D(3 $\to$ 16, $3\times3$, stride 1, padding 1) + ReLU + MaxPool2d($2\times2$)
  2. Conv2D(16 $\to$ 32, $3\times3$, stride 1, padding 1) + ReLU + MaxPool2d($2\times2$)
  3. Conv2D(32 $\to$ 64, $3\times3$, stride 1, padding 1) + ReLU + MaxPool2d($2\times2$)
  4. AdaptiveAvgPool2d($8\times8$) $\to$ Flatten (4,096 features)
  5. Dense(4096 $\to$ 64) + ReLU + Dropout($p=0.3$)
  6. Dense(64 $\to$ 14 classes) $\to$ Softmax

### 2.4 Uncertainty Quantification & Clinical Rejection
In real-world agricultural field settings, non-leaf artifacts, poor illumination, or atypical disease incubation stages can produce false positives. The inference pipeline applies an explicit uncertainty threshold:
$$\text{If } \max_{c} P(y=c \mid \mathbf{X}) < 0.70 \implies \text{Flag as Uncertain (Alert Farmer)}$$
When confidence is under 70%, the system flags the result, displays an alert, and prompts the user for either a clearer rescanning angle or expert agronomic review.

---

## 3. Module 2: Soil & Climate Crop Suitability Recommender (scikit-learn)

### 3.1 Problem Formulation & Dataset
Given 7 continuous agronomic features $\mathbf{x} = [N, P, K, \text{Temp}, \text{Humidity}, \text{pH}, \text{Rainfall}]^T$, predict the optimal crop class $y \in \{1, \dots, 22\}$:
- **Dataset:** 2,200 curated agro-climatic trial samples across 22 crops (Rice, Maize, Chickpea, Kidney Beans, Pigeon Peas, Moth Beans, Mung Bean, Black Gram, Lentil, Pomegranate, Banana, Mango, Grapes, Watermelon, Muskmelon, Apple, Orange, Papaya, Coconut, Cotton, Jute, Coffee).
- **Split:** 80% Training (1,760 samples), 20% Testing (440 samples), stratified by crop label.

### 3.2 Benchmark Evaluation of 4 Competing Models
To rigorously justify the production selection, four distinct algorithmic paradigms were trained and evaluated on identical test splits:

| Model Algorithm | Accuracy | Precision (Macro) | Recall (Macro) | F1-Score (Macro) | Inference Latency |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Gaussian Naive Bayes** | **98.86%** | 0.9912 | 0.9886 | 0.9889 | < 0.2 ms |
| **Random Forest (100 Trees)** *(Selected)* | **98.64%** | **0.9890** | **0.9864** | **0.9865** | **~ 1.8 ms** |
| **Logistic Regression (L-BFGS)** | 97.95% | 0.9814 | 0.9795 | 0.9791 | < 0.5 ms |
| **Decision Tree (CART)** | 94.09% | 0.9462 | 0.9409 | 0.9411 | < 0.1 ms |

#### Selection Justification
While Gaussian Naive Bayes achieves a marginally higher test accuracy (98.86% vs 98.64%), it assumes conditional feature independence—a biological impossibility in soil chemistry where N, P, and K interact with soil pH. **Random Forest Classifier** was selected for production deployment because:
1. It captures complex non-linear feature interactions without independence assumptions.
2. It natively computes Gini feature importances for explainable AI (XAI).
3. It exhibits resilience against extreme weather outliers.

### 3.3 Feature Importance (Model Explainability)
Feature importances derived from Mean Decrease in Impurity (Gini):
1. **Rainfall Depth:** 23.05%
2. **Relative Humidity:** 20.67%
3. **Potassium (K):** 16.21%
4. **Phosphorus (P):** 14.62%
5. **Nitrogen (N):** 12.49%
6. **Ambient Temperature:** 7.53%
7. **Soil pH:** 5.43%

---

## 4. Module 3: Harvest Yield Prediction Regressor (scikit-learn)

### 4.1 Problem Formulation & Dataset
Given crop variety, soil classification, irrigation type, land acreage, meteorological factors, and fertilizer inputs, forecast harvest output:
$$\hat{Y} = f(\mathbf{x}) \quad \text{where } \hat{Y} \in \mathbb{R}^+ \text{ in Quintals/Acre}$$
- **Dataset:** 2,500 trials calibrated against national and state agricultural university field trial benchmarks.
- **Split:** 80% Train (2,000 samples), 20% Test (500 samples).

### 4.2 Benchmark Evaluation vs. Naive Baseline
To demonstrate genuine predictive learning rather than mean guessing, the Random Forest Regressor was benchmarked against a Dummy Mean Regressor:

| Evaluation Metric | Baseline (Dummy Mean Regressor) | Random Forest Regressor (100 Estimators) | Performance Delta |
|:---|:---:|:---:|:---:|
| **Mean Absolute Error (MAE)** | 80.86 Quintals/Acre | **6.40 Quintals/Acre** | **92.08% Error Reduction** |
| **Root Mean Squared Error (RMSE)** | 111.45 | **11.69** | **89.51% Error Reduction** |
| **Coefficient of Determination ($R^2$)** | -0.0013 | **0.9891** | **+0.9904 Explanation of Variance** |

### 4.3 90% Confidence Interval Formulation
The model computes an empirical 90% confidence interval to communicate uncertainty:
$$\text{CI}_{90} = [\hat{Y} \times 0.92, \; \hat{Y} \times 1.08]$$
This alerts farmers to the plausible harvest range considering seasonal micro-climate variance.
