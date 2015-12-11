var Transform = require('readable-stream').Transform
var inherits = require('inherits')
var bufferToArrayBuffer = require('buffer-to-arraybuffer')

module.exports = AudioBufferStream
function AudioBufferStream (audioContext, sampleRate, channels, bitDepth) {
  Transform.call(this)
  this._readableState.objectMode = true
  this._writableState.objectMode = true
  this._finished = false
  this.audioContext = audioContext
  this.sampleRate = typeof sampleRate === 'number' ? sampleRate : 44100
  this.channels = typeof channels === 'number' ? channels : 2
  this.bitDepth = typeof bitDepth === 'number' ? bitDepth : 16
  this.blockAlign = this.channels * (this.bitDepth / 8)

  this.bufferSizeInSampleFrames = 4096 * 8
  this.bufferSizeInBytes = this.bufferSizeInSampleFrames * this.blockAlign
  this.intervalTime = 1000 * this.bufferSizeInSampleFrames / (this.sampleRate * this.channels) * (this.bitDepth / 8)

  this._bytes = 0
  this._data = new Buffer(0)
  this._prevTime = 0
}

inherits(AudioBufferStream, Transform)

AudioBufferStream.prototype._transform = function (buf, enc, next) {
  if (buf.length === 0) return next()
  this._advance(buf, enc, next)
}

AudioBufferStream.prototype._advance = function (buf, enc, next) {
  if (this._destroyed) return

  if (this._data.length > 0) {
    buf = Buffer.concat([ this._data, buf ])
  }

  var index = 0
  var curBuf, interval
  var self = this

  // we have buffered enough to write 1 or more chunks
  var count = buf.length
  if (count >= this.bufferSizeInBytes) {
    interval = setInterval(pushNext, this.intervalTime)

    // start pushing immediately
    pushNext()
  } else {
    // we don't have enough data for one chunk yet...
    // keep reading
    this._data = buf
    next()
  }

  function pushNext () {
    // finish our interval
    if (count <= self.bufferSizeInBytes) {
      clearInterval(interval)
      // our remaining bytes for the next time around
      var remainingBytes = count
      self._data = buf.slice(index, index + remainingBytes)

      // all done, ready for next read
      next()
      return
    }

    // push next chunk
    curBuf = buf.slice(index, index + self.bufferSizeInBytes)
    self._decode(curBuf)
    count -= self.bufferSizeInBytes
    index += self.bufferSizeInBytes
  }
}

AudioBufferStream.prototype._decode = function (buffer, done) {
  // the stream calls this every X seconds
  // with N bytes in buffer
  var arrayBuf = bufferToArrayBuffer(buffer)
  var context = this.audioContext
  var self = this

  context.decodeAudioData(arrayBuf, function (audioBuffer) {
    self.push(audioBuffer)
    if (done) done()
  }, function () {
    console.error('error decoding')
  })
}

AudioBufferStream.prototype._flush = function (next) {
  var self = this
  if (this._data.length > 0) {
    var data = this._data
    this._data = new Buffer(0)
    this._decode(data, function () {
      self.push(null)
      next()
    })
  } else {
    this.push(null)
    next()
  }
}

AudioBufferStream.prototype.destroy = function () {
  this._destroyed = true
}
