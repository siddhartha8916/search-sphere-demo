# Use Python 3.11 Alpine image (much smaller than slim)
FROM python:3.11-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies in a single layer
RUN apk add --no-cache --virtual .build-deps \
    gcc \
    musl-dev \
    postgresql-dev \
    python3-dev \
    libffi-dev

# Copy only requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies and remove cache in same layer
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    rm -rf ~/.cache/pip

# Final runtime stage
FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Install only runtime dependencies
RUN apk add --no-cache \
    libpq \
    libffi

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code only (exclude venv, cache, etc via .dockerignore)
COPY . .

# Create non-root user
RUN adduser -D -u 1001 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check (simplified - no requests library needed)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]