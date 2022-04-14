[![](https://data.jsdelivr.com/v1/package/gh/paltis5212/lite-youtube/badge)](https://www.jsdelivr.com/package/gh/paltis5212/lite-youtube)

# lite-youtube
> The fastest little YouTube web component on this side of the internet. The shadow dom web component version of justinribeiro's [lite-youtube](https://github.com/justinribeiro/lite-youtube).

## Features

- No dependencies; it's just a vanilla web component.
- It's fast yo.
- It's Shadow Dom encapsulated!
- It's responsive 16:9
- It's accessible via keyboard and will set ARIA via the `videotitle` attribute
- It's locale ready; you can set the `videoplay` to have a properly locale based label
- Set the `start` attribute to start at a particular place in a video
- You can set `autoload` to use Intersection Observer to load the iframe when scrolled into view.
- Loads placeholder image as WebP with a Jpeg fallback
- _new in v1.1_: Adds `nocookie` attr for use with use youtube-nocookie.com as iframe embed uri
- _new in v1.2_: Adds `playlistid` for playlist loading interface support
- _new in v1.3_: Adds `loading=lazy` to image placeholder for more perf with `posterloading` attr if you'd like to use eager

<!-- ## Install

This web component is built with ES modules in mind and is
available on NPM:

Install code-block:

```sh
npm i @paltis/lite-youtube
```

After install, import into your project:

```js
import '@paltis/lite-youtube';
``` -->

## Install with CDN

If you want the paste-and-go version, you can simply load it via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/paltis5212/lite-youtube/lite-youtube.js"></script>
```

## Basic Usage

```html
<lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
```

## Add Video Title

```html
<lite-youtube
  videoid="guJLfqTFfIw"
  videotitle="This is a video title"
></lite-youtube>
```

## Change "Play" for Locale</h3>

```html
<lite-youtube
  videoid="guJLfqTFfIw"
  videoplay="Mirar"
  videotitle="Mis hijos se burlan de mi español"
>
</lite-youtube>
```

## Style It

Height and Width are responsive in the component.

```html
<style>
  .styleIt {
    width: 400px;
    margin: auto;
  }
</style>
<div class="styleIt">
  <lite-youtube videoid="guJLfqTFfIw"></lite-youtube>
</div>
```

## Set a video start time

```html
<!-- Start at 5 seconds -->
<lite-youtube videoid="guJLfqTFfIw" videoStartAt="5"></lite-youtube>
```

## AutoLoad with IntersectionObserver

Uses Intersection Observer if available to automatically load the YouTube iframe when scrolled into view.

```html
<lite-youtube videoid="guJLfqTFfIw" autoload> </lite-youtube>
```

## YouTube QueryParams

Use any [YouTube Embedded Players and Player Parameters](https://developers.google.com/youtube/player_parameters) you like

```html
<lite-youtube videoid="guJLfqTFfIw" params="controls=0&enablejsapi=1">
</lite-youtube>
```

## Attributes

The web component allows certain attributes to be give a little additional
flexibility.

| Name           | Description                                                      | Default |
| -------------- | ---------------------------------------------------------------- | ------- |
| `videoid`      | The YouTube videoid                                              | ``      |
| `playlistid`   | The YouTube playlistid; requires a videoid for thumbnail         | ``      |
| `videotitle`   | The title of the video                                           | `Video` |
| `videoplay`    | The title of the play button (for translation)                   | `Play`  |
| `videoStartAt` | Set the point at which the video should start, in seconds        | `0`     |
| `posterquality`| Set thumbnail poster quality (maxresdefault, sddefault, mqdefault, hqdefault) | `hqdefault`  |
| `posterloading`| Set img lazy load attr `loading` for poster image | `lazy`  |
| `nocookie`     | Use youtube-nocookie.com as iframe embed uri | `false` |
| `autoload`     | Use Intersection Observer to load iframe when scrolled into view | `false` |
| `params`       | Set YouTube query parameters                                     | ``      |

## Events

The web component fires events to give the ability understand important lifecycle.

| Event Name     | Description                                                      | Returns |
| -------------- | ---------------------------------------------------------------- | ------- |
| `liteYoutubeIframeLoaded` | When the iframe is loaded, allowing us of JS API  | `detail: { videoId: this.videoId }` |
