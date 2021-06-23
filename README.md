# Noviggo Muziko - React Native Open Source Audio Player

<p align="center">
  <img src="https://cdn.noviggo.com/demo/noviggo-music-album-1623680667.png" height="500">
  <img src="https://cdn.noviggo.com/demo/noviggo-music-now-playing-1623680667.png" height="500">  
  <img src="https://cdn.noviggo.com/demo/noviggo-music-artists-1623680667.png" height="500">
</p>

## Purpose

The Noviggo Muziko open-source audio player is intended to be a starting point for building an offline audio player leveraging React Native.  It was created to explore the following use cases.

* Integrating with the native device's media library to build an local metadata database to catalog an audio library and keep a player queue.

* Reading local file information to extract music metadata to create a catalog.

* Augmenting metadata about an artist, album, or track leveraging Spotify's web APIs.

* Integrating with the native devices audio playback abilities.

## Key Dependencies

* [Expo](https://github.com/expo/expo)
* [Redux Toolkit](https://github.com/reduxjs/redux-toolkit)
* [React Native Track Player](https://github.com/DoubleSymmetry/react-native-track-player)
* [Spotify Web Api js](https://github.com/JMPerez/spotify-web-api-js)
* [Typeorm](https://github.com/typeorm/typeorm)
* [Music Metadata](https://github.com/Borewit/music-metadata)
* [Axios](https://github.com/axios/axios)
* [Font-Awesome](https://github.com/FortAwesome/Font-Awesome)

## Helpful Articles

* [Expo SQLite + TypeORM by José Gabriel M. Bezerra](https://dev.to/jgabriel1/expo-sqlite-typeorm-4mn8)
* [Example implementation of React Native Player](https://github.com/DoubleSymmetry/react-native-track-player/tree/main/example)
* [Expo Bare Workflow Walkthrough](https://docs.expo.io/bare/exploring-bare-workflow/)
* [Redux Toolkit Typescript Quick Start](https://redux-toolkit.js.org/tutorials/typescript)

## Getting Started

Ensure [Expo CLI](https://docs.expo.io/workflow/expo-cli/) is installed globally prior to starting, and a emulator/local device is setup for development, project has only been tested on Android for now, IOS testing will begin in the near future.

### Installation

```bash
npm install
```

### Build and start

```bash
npm run android
```

## Database schema
<img src="https://cdn.noviggo.com/demo/noviggo-music-db-1623680667.JPG" width="500">

## Known limitations

* Library sync scanning is slow to process information (.5 seconds per file).
* Library sync UX is a work in progress.
* Library scanning is depending on the local devices media library being up to date, on Android the native library scan can be triggered by a device restart.
* Queue functionality is limited, more use cases will be built in the future.
* Only supports .ogg, .mp3, .flac files initially for scanning tag metadata, updates will be included in the future to support more audio types.
* If the systems color mode is changed while the app is running, the updated color scheme will only be applied after the app is restarted.