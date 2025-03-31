FROM python:3

WORKDIR /app


COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install fastapi[standard]
COPY . .

EXPOSE 8000 
CMD if [ "$ENVIRONMENT" = "development" ]; then \
      sh -c "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"; \
    elif [ "$ENVIRONMENT" = "production" ]; then \
      sh -c "fastapi run"; \
    else \
      echo "No valid environment specified"; \
    fi
