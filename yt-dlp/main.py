import os
from sys import exception

import yt_dlp
from fastapi import FastAPI, Response

app = FastAPI()

ydl_opts = {
    "cookiefile": "cookies.txt",
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
    try:
        info = ydl.extract_info(url, download=False)
    except:
        return False
    return info


@app.get("/")
def endpoint_home():
    return {"Hello": ":3"}


@app.get("/info/{video_id}", status_code=200)
def endpoint_video_info(video_id: str, response: Response):
    info = {}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = get_video_info(video_id, ydl)

    if info is False:
        response.status_code = 400
        return {}

    try:
        return {
            "id": info["id"],
            "title": info["title"],
            "videoLength": info["duration"],
            "videosViews": info["view_count"],
            "isAgeRestricted": bool(info["age_limit"]),
            "channel": info["channel"],
            "thumbnail": info["thumbnail"],
        }
    except:
        response.status_code = 500
        return {}


@app.get("/download/{video_id}")
def endpoint_download_video(video_id: str):
    status: bool = False
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        status = download_video(video_id, ydl)

    return {status: status}
