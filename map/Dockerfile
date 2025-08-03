# Use an official Python runtime
FROM python:3.11-slim

# Set working directory
WORKDIR /map

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source files
COPY . .

# Run the script (adjust to your main script name)
CMD ["python", "app.py"]
