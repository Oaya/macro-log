FROM python:3.12-slim


# Where our code lives inside the container
WORKDIR /app


# Copy ONLY requirements first, then install.
# This is the caching trick: Docker caches this layer, so it
# only re-installs deps when requirements.txt changes. not on every code edit.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the rest of the app code
COPY . .

# Make the start script executable
RUN chmod +x start.sh

# Run the start script: migrations + seed + server (binds to $PORT on Render)
CMD ["bash", "start.sh"]