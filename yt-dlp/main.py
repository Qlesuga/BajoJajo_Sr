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
}


def get_video(url: str, ydl: yt_dlp.YoutubeDL):
    info = ydl.extract_info(url, download=True)
    with open("info.txt", "w") as f:
        f.write(str(info))
    return info


@app.get("/")
def root():
    url = "FJZIl0JPmgs"
    info = {}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = get_video(url, ydl)

    return {
        "title": info["title"],
        "videoLength": info["duration"],
        "videosViews": info["view_count"],
        "isAgeRestricted": bool(info["age_limit"]),
    }
