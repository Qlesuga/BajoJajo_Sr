import os
from sys import exception
from urllib.parse import unquote

import yt_dlp
from fastapi import FastAPI, Response
from pydantic import BaseModel

app = FastAPI()

ydl_opts = {
    "noplaylist": True,
    "nodownload": True,
    "nodownload": True,
    "skip_download": True,
    "skipdownload": True,
    "cookiefile": "cookies.txt",
}


def get_video_info(url: str, ydl: yt_dlp.YoutubeDL):
    try:
        info = ydl.extract_info(url, download=False)
    except:
        return False
    return info


@app.get("/")
def endpoint_home():
    return {"Hello": ":3"}


class Video(BaseModel):
    url: str


@app.post("/info", status_code=200)
def endpoint_video_info(video: Video, response: Response):
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = get_video_info(unquote(video.url), ydl)

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
