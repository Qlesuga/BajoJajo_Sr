import os

import yt_dlp
from fastapi import FastAPI

app = FastAPI()

ydl_opts = {
    "username": os.getenv("YT_USERNAME"),
    "password": os.getenv("YT_PASSWORD"),
    "format": "bestaudio/best",
    "postprocessors": [
        {
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }
    ],
    "outtmpl": "/music/%(id)s.%(ext)s",
}


def download_video(url: str, ydl: yt_dlp.YoutubeDL) -> bool:
    try:
        ydl.download([url])
    except:
        return False
    return True


def get_video_info(url: str, ydl: yt_dlp.YoutubeDL):
    info = ydl.extract_info(url, download=False)
    return info


@app.get("/")
def endpoint_home():
    return {"Hello": ":3"}


URL = "FJZIl0JPmgs"


@app.get("/info/{video_id}")
def endpoint_video_info(video_id: str):
    info = {}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = get_video_info(video_id, ydl)

    return {
        "id": info["id"],
        "title": info["title"],
        "videoLength": info["duration"],
        "videosViews": info["view_count"],
        "isAgeRestricted": bool(info["age_limit"]),
    }


@app.get("/download/{video_id}")
def endpoint_download_video():
    status: bool = False
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        status = download_video(video_id, ydl)

    return {status: status}
