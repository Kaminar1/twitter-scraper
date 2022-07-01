# twitter-scraper

[ ] Go through all videos in the database  
[x] Fetch tweets (for this time period?) on a 'timeline'  
[ ] Group tweets with videos that are posted in a set timeframe?  
[x] filter out tweets based on filter config:

- has image
- has at least one from a set of hastags

* has at least one from a set of words/terms
* a "reply" has link to the twitch?
* has an exact matching phrase from a Set

As this might take a while to make 100% correct guesses linked to a `vod_id` in the database, make a backup solution in React to manually link with "best guesses".

## ![toodank](https://cdn.betterttv.net/emote/5ad22a7096065b6c6bddf7f3/1x) → ![dankies](https://cdn.betterttv.net/emote/5f92938a710f8302f0c8ee82/1x)

Split into two parts:

- Find tweets based on a filter, and save them to the database.
- Go through the database and find matches from vod coll and tweets coll

---

Example of 2 _tweet-objects_ where the first is the reply to the second, only containing link to twitch (in `text` field).

```json
 {
    "referenced_tweets": [
        {
            "type": "replied_to",
            "id": "1529542882897575939"
        }
    ],
    "text": "https://t.co/Qjcj7IoKeU",
    "created_at": "2022-05-25T19:20:22.000Z",
    "author_id": "1288894693527498754",
    "id": "1529542912761012224",
    "entities": {
        "urls": [
            {
                "start": 0,
                "end": 23,
                "url": "https://t.co/Qjcj7IoKeU",
                "expanded_url": "https://www.twitch.tv/sagisawaria",
                "display_url": "twitch.tv/sagisawaria"
            }
        ]
    },
    "conversation_id": "1529542882897575939",
    "lang": "und",
    "source": "Twitter Web App",
    "possibly_sensitive": false
},

```

```json
{
  "referenced_tweets": [
    {
      "type": "quoted",
      "id": "1529528152711634945"
    }
  ],
  "text": "yeyeyyy we chillin today! I just want to talk to you guys about whatever c: and play games? ☺️💕\n\nStarting in 10 mins at 3:30 pm edt! ⏲️\nLink to stream below! 👇\n\n#chimeRIA #ENVtuber #VTuberEN https://t.co/3Ltw8kVAPj https://t.co/Cwmgk3hjRc",
  "created_at": "2022-05-25T19:20:15.000Z",
  "author_id": "1288894693527498754",
  "id": "1529542882897575939",
  "entities": {
    "urls": [
      {
        "start": 191,
        "end": 214,
        "url": "https://t.co/3Ltw8kVAPj",
        "expanded_url": "https://twitter.com/sagisawaria/status/1529542882897575939/photo/1",
        "display_url": "pic.twitter.com/3Ltw8kVAPj",
        "media_key": "3_1529542845039886340"
      },
      {
        "start": 215,
        "end": 238,
        "url": "https://t.co/Cwmgk3hjRc",
        "expanded_url": "https://twitter.com/sagisawaria/status/1529528152711634945",
        "display_url": "twitter.com/sagisawaria/st…"
      }
    ],
    "hashtags": [
      {
        "start": 161,
        "end": 170,
        "tag": "chimeRIA"
      },
      {
        "start": 171,
        "end": 180,
        "tag": "ENVtuber"
      },
      {
        "start": 181,
        "end": 190,
        "tag": "VTuberEN"
      }
    ]
  },
  "conversation_id": "1529542882897575939",
  "lang": "en",
  "source": "Twitter Web App",
  "possibly_sensitive": false,
  "attachments": {
    "media_keys": ["3_1529542845039886340"]
  }
}
```

media objects (timeline.includes.media)

```json
{
  "media": [
    {
      "type": "video",
      "duration_ms": 60001,
      "preview_image_url": "https://pbs.twimg.com/ext_tw_video_thumb/1541896013732057088/pu/img/Cq1vdwd1_nz6mslc.jpg",
      "media_key": "7_1541896013732057088",
      "height": 1080,
      "width": 1920
    },
    {
      "type": "photo",
      "url": "https://pbs.twimg.com/media/FWXbe4mWQAI21lc.jpg",
      "media_key": "3_1541879771080048642",
      "height": 2100,
      "width": 2100
    },
    {
      "type": "photo",
      "url": "https://pbs.twimg.com/media/FWXIOH4WYAEzqk7.jpg",
      "media_key": "3_1541858592403382273",
      "height": 1080,
      "width": 1920
    }
  ]
}
```

`replied_to` objects

```json
{
  "possibly_sensitive": false,
  "author_id": "1288894693527498754",
  "source": "Twitter Web App",
  "text": "https://t.co/Qjcj7IoKeU",
  "lang": "zxx",
  "id": "1541859038966816769",
  "conversation_id": "1541858844481146881",
  "entities": {
    "urls": [
      {
        "start": 0,
        "end": 23,
        "url": "https://t.co/Qjcj7IoKeU",
        "expanded_url": "https://www.twitch.tv/sagisawaria",
        "display_url": "twitch.tv/sagisawaria"
      }
    ]
  },
  "created_at": "2022-06-28T19:00:15.000Z",
  "referenced_tweets": [
    {
      "type": "replied_to",
      "id": "1541858844481146881"
    }
  ]
}
```
