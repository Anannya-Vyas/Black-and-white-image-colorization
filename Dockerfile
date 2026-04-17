# Use Python 3.11 as the base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 10000

# Install system dependencies for OpenCV and curl for downloading model
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create Model directory
RUN mkdir -p Model

# PRE-DOWNLOAD THE MODEL (This makes startup instant on Render!)
# We download during build so the app is ready immediately
RUN curl -L -o Model/colorization_deploy_v2.prototxt https://storage.openvinotoolkit.org/repositories/datumaro/models/colorization/colorization_deploy_v2.prototxt && \
    curl -L -o Model/colorization_release_v2.caffemodel https://storage.openvinotoolkit.org/repositories/datumaro/models/colorization/colorization_release_v2.caffemodel && \
    curl -L -o Model/pts_in_hull.npy https://storage.openvinotoolkit.org/repositories/datumaro/models/colorization/pts_in_hull.npy

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 10000

# Start the application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app", "--timeout", "120"]
