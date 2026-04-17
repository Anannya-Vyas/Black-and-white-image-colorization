---
title: Chrome Neural Colorizer
emoji: 🎨
colorFrom: blue
colorTo: indigo
sdk: docker
pinned: false
---

<div align="center">

# 🎨 Chrome Neural Colorizer
### Bring Black & White History Back to Life with Neural Networks

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![OpenCV](https://img.shields.io/badge/OpenCV-DNN-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white)](https://opencv.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **Upload a black & white photograph → Watch Neural Networks breathe color into it in seconds.**

</div>

---

## ✨ What Is This?

**Chrome Neural Colorizer** is a full-stack Deep Learning web application that uses a pre-trained convolutional neural network to automatically add realistic color to grayscale images.

- Drop a vintage photograph, an old newspaper clipping, or any B&W image.
- The Machine Learning model (trained on millions of images by researchers at UC Berkeley) detects objects and infers their most likely colors.
- An interactive **before/after comparison slider** lets you experience the transformation.

> 📖 **Want to understand every line of code?** Read the [Comprehensive Guide](COMPREHENSIVE_GUIDE.md) — a 1,400+ line beginner-friendly book that teaches you how to build this from absolute zero.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                      │
│                                                         │
│   ┌──────────────────────────────────────────────────┐  │
│   │          React Frontend  (Port 5173)             │  │
│   │   Drag & Drop ──► Before/After Slider ──► Save  │  │
│   └────────────────────────┬─────────────────────────┘  │
│                            │ HTTP POST /api/colorize     │
└────────────────────────────┼────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────┐
│                            ▼                            │
│   ┌──────────────────────────────────────────────────┐  │
│   │          Flask Backend  (Port 5000)              │  │
│   │   Receive image bytes ──► colorizer.py           │  │
│   └────────────────────────┬─────────────────────────┘  │
│                            │                            │
│   ┌────────────────────────▼─────────────────────────┐  │
│   │          OpenCV DNN + Caffe Model               │  │
│   │   BGR→Lab ──► Predict ab ──► Reconstruct ──► JPEG│  │
│   └──────────────────────────────────────────────────┘  │
│                     PYTHON SERVER                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 The Science Behind It

This app uses a technique from a landmark 2016 research paper:

> **"Colorful Image Colorization"** — Richard Zhang, Phillip Isola, Alexei Efros  
> European Conference on Computer Vision (ECCV), 2016  
> https://arxiv.org/abs/1603.08511

### How It Works in 3 Steps

**1. Color Space Conversion (BGR → Lab)**

The image is converted from standard BGR to the **Lab color space**, which separates lightness (L) from color information (a = green-red axis, b = blue-yellow axis). A grayscale image IS the L channel — so we already have it.

**2. Neural Network Inference**

The model (a Convolutional Neural Network trained on millions of color photos) takes the L channel and predicts a probability distribution across **313 quantized color bins** for every pixel in the image. This approach produces more vibrant, realistic results than predicting a single value.

**3. Reconstruction**

The predicted `ab` channels are combined with the original `L` channel, then converted back to BGR for display. The result: a full-color image.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Neural Model** | Caffe DNN (pre-trained) | State-of-the-art colorization model |
| **Image Processing** | OpenCV 4.x | Industry-standard computer vision |
| **Math** | NumPy | Fast array operations on pixel data |
| **Backend** | Flask 3.x | Lightweight Python web framework |
| **CORS** | flask-cors | Allows frontend-backend communication |
| **Frontend** | React 18 + Vite | Fast, modern component-based UI |
| **Styling** | Vanilla CSS | Glassmorphism dark-mode design |
| **Version Control** | Git + Git LFS | Large model files tracked via LFS |

---

## ⚡ Quick Start

### Prerequisites

Make sure these are installed:

- [Python 3.11+](https://python.org/downloads/)
- [Node.js LTS](https://nodejs.org/)

### 1. Clone & Setup

```bash
pip install opencv-python numpy flask flask-cors
python app.py
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🤝 How to Contribute

Contributions are welcome! Please open a Pull Request on GitHub.

---

## 📖 Learn How It Was Built

📚 **[Read the Complete Guide →](COMPREHENSIVE_GUIDE.md)**

---

<div align="center">

**Made with ❤️ by [Anannya Vyas](https://github.com/Anannya-Vyas)**

⭐ If this project helped you, please give it a star!

</div>
