<p align="center">
  <img src="./public/smoleg.webp" width="112" alt="smoleg" />
</p>

<h1 align="center">BajoJajo sr</h1>
<p align="center">Simple open-source twitch song request</p>

## Bot Commands

| Command      | Param                  | Description                                                  |
| :----------- | :--------------------- | :----------------------------------------------------------- |
| `!sr`        | `video id or url`      | add song to song queue                                       |
| `!voteskip`  | None                   | vote on skiping current song                                 |
| `!skip`      | None                   | same as `!voteskip`                                          |
| `!current`   | None                   | write name of current song on chat                           |
| `!queue`     | None                   | send link to sogn queue                                      |
| `!whenmysr`  | None                   | response with time in which song added by you will be played |
| `!forceskip` | None                   | **moderator only**, skips current song                       |
| `!play`      | None                   | **moderator only**,starts player                             |
| `!stop`      | None                   | **moderator only**,stop player                               |
| `!volume`    | `volume in percentage` | **moderator only**, changes volume of player                 |
| `!clear`     | None                   | **broadcaster only**, clears song queue                      |
| `!sron`      | None                   | **broadcaster only**, turns on song request (every command)  |
| `!sroff`     | None                   | **broadcaster only**, turns off song request (every command) |
| `!srping`    | None                   | checks if bot is working                                     |

## Tech Stack

**Client:** React, TailwindCSS, Shadcn

**Server:** Nextjs, Python, Redis, PosgreSQL, Cloudflare Tunnel, yt-dlp

## Run Locally

Clone the project

```bash
  git clone https://github.com/Qlesuga/bajojajo-sr
```

Go to the project directory

```bash
  cd bajojajo-sr
```

Set environment varable found in `.env.example` and save it as `.env`

Start the project

```bash
  docker compose up
```
