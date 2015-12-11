const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const { sampleRate } = audioContext;

// delay is in seconds.
export function playSound( sound, delay ) {
  const source = audioContext.createBufferSource();
  source.buffer = sound;
  source.connect( audioContext.destination );
  source.start( delay ? audioContext.currentTime + delay : 0 );
}

// duration is in seconds.
export function generateAudioBuffer( freq, fn, duration, volume ) {
  const length = duration * sampleRate;

  const buffer = audioContext.createBuffer( 1, length, sampleRate );
  const channel = buffer.getChannelData(0);
  for ( let i = 0; i < length; i++ ) {
    channel[i] = fn( freq * i / sampleRate, i / length ) * volume;
  }

  return buffer;
}
