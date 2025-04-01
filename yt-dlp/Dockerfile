FROM python:3

WORKDIR /app

RUN wget https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz -O ffmpeg.tar.xz
RUN tar -xf ffmpeg.tar.xz
RUN mv ffmpeg-* ffmpeg
RUN mv ./ffmpeg/bin/* /usr/bin/
RUN rm -r ffmpeg

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
