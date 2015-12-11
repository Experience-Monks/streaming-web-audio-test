var AudioStream = require('./stream')
var simpleGet = require('simple-get')

module.exports = audioStream
function audioStream (src, opt) {
  opt = opt || {}
  var context = opt.context || new (window.AudioContext || window.webkitAudioContext)()
  var sampleRate = opt.sampleRate
  var channels = opt.channels
  var bitDepth = opt.bitDepth

  var _prevTime = 0
  var audioStream = new AudioStream(context, sampleRate, channels, bitDepth)
  simpleGet(src, function (err, res) {
    if (err) throw err
    res
      .pipe(audioStream)
      .on('data', function (audioBuffer) {
        console.log('Received', audioBuffer.duration, 'second chunk')
        var bufferNode = context.createBufferSource()
        bufferNode.connect(context.destination)
        bufferNode.buffer = audioBuffer
        bufferNode.start(_prevTime)
        _prevTime += audioBuffer.duration
      })
      .on('end', function () {
        console.log('Done')
      })
  })
}
