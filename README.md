# streaming-web-audio-test

This is an experiment, attempting to bring streaming WebAudio playback to mobile. This brings together the following:

- `fetch` API to stream a large file in chunks (Chrome/FF only)
- Node.js streams (via browserify) to throttle the data
- WebAudio to decode chunks of audio and play them back

The goal is streaming (and immediate) WebAudio playback on mobile, which is currently not possible. As of Dec 2015, you need to decode the whole track for mobile, which can take 20+ seconds for a typical song.

This experiment is not yet working; I'm not sure if it will ever work but hopefully somebody can build off it.

Problems:

- There are "clicks" where the chunks meet
- Only works on MP3 right now
- Your sample rate, bit depth etc must be known beforehand

Please post in the issue tracker or tweet me at [@mattdesl](https://twitter.com/i/notifications) if you have suggestions or ideas. :) 

## Running & Testing


```sh
git clone https://github.com/Jam3/streaming-web-audio-test.git

cd streaming-web-audio-test

npm install
```

Now to dev:

```sh
npm start
```

And open [http://localhost:9966/](http://localhost:9966).

To build:

```sh
npm run build
```

## License

MIT, see [LICENSE.md](http://github.com/Jam3/streaming-web-audio-test/blob/master/LICENSE.md) for details.
