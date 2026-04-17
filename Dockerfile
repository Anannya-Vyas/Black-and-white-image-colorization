# Use Python 3.11 as the base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 10000

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create and set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Build the frontend (if not already built)
# Note: For production, we usually copy a pre-built frontend or build it here.
# Since we already have the frontend/dist folder locally, we can just copy it.

# Expose the port
EXPOSE 10000

# Start the application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
