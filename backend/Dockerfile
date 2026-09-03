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

# Run the server. --host 0.0.0.0 is REQUIRED inside a container:
# 'localhost' inside the container isn't reachable from your machine;
# 0.0.0.0 binds all interfaces so the port mapping works.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]