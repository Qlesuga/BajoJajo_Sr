FROM python:3.13

WORKDIR /app

ARG TARGETARCH
RUN echo "$TARGETARCH"

RUN if [ "$TARGETARCH" = "amd64" ]; then \
      wget https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz -O ffmpeg.tar.xz;  \
    elif [ "$TARGETARCH" = "arm64" ]; then \
      wget https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linuxarm64-gpl.tar.xz -O ffmpeg.tar.xz; \
    else \
      echo "Unknown architecture: $TARGETARCH"; \
    fi

RUN tar -xf ffmpeg.tar.xz
RUN mv ffmpeg-* ffmpeg
RUN mv ./ffmpeg/bin/* /usr/bin/
RUN rm -r ffmpeg

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
