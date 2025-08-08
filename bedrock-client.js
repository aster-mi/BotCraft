import { createClient } from 'bedrock-protocol'

const client = createClient({
  host: '127.0.0.1',
  port: 19131,
  username: 'LoggerBot',
  offline: false,
  version: '1.21.100'
})

client.on('start_game', (packet) => {
  console.log('--- START_GAME Packet ---')
  console.dir(packet, { depth: null })
})