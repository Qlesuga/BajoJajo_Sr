FROM python:3.13

WORKDIR /app

ARG TARGETARCH
RUN echo "$TARGETARCH"

RUN curl -fsSL https://deno.land/install.sh | sh

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install fastapi[standard]
RUN pip install -U yt-dlp
COPY . .

EXPOSE 8000 
CMD if [ "$ENVIRONMENT" = "development" ]; then \
      uvicorn main:app --host 0.0.0.0 --port 8000 --reload; \
    elif [ "$ENVIRONMENT" = "production" ]; then \
      fastapi run; \
    else \
      echo "No valid environment specified"; \
    fi
