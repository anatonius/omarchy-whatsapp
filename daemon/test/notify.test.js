import assert from 'node:assert/strict'
import test from 'node:test'

import { buildNotifyArgs, Notifier } from '../lib/notify.js'

const JID = "5551234@s.whatsapp.net"

test('puts --exec last so the headline is never read in option position', () => {
  const args = buildNotifyArgs({ title: 'Ada', body: 'hi', jid: JID, useOmarchy: true })
  const exec = args.indexOf('--exec')
  assert.notEqual(exec, -1)
  assert.ok(exec > args.indexOf('Ada'), '--exec must follow the headline')
  assert.ok(exec > args.indexOf('hi'), '--exec must follow the description')
})

test('spells the click command as separate argv words', () => {
  const args = buildNotifyArgs({ title: 'Ada', body: 'hi', jid: JID, useOmarchy: true })
  assert.deepEqual(args.slice(args.indexOf('--exec') + 1), [
    'bash',
    args[args.indexOf('--exec') + 2],
    JID
  ])
})

test('a headline that looks like a flag stays a positional', () => {
  const args = buildNotifyArgs({ title: '--exec', body: 'hi', jid: null, useOmarchy: true })
  assert.equal(args.at(-2), '\u2060--exec')
  assert.equal(args.at(-1), 'hi')
})

test('a headline beginning with a dash cannot be parsed as a helper option', () => {
  const args = buildNotifyArgs({ title: '-x', body: 'hi', jid: JID, useOmarchy: false })
  assert.equal(args.at(-2), '\u2060-x')
})

test('hidden notification bodies are replaced before spawning the helper', () => {
  const notifier = new Notifier()
  notifier.enabled = true
  notifier.hideBodies = true
  let sent
  notifier.send = (...args) => { sent = args }
  notifier.playSound = () => {}

  notifier.queue({ jid: JID, title: 'Ada', body: 'private message', shouldNotify: () => true })
  notifier.flush(JID)

  assert.equal(sent[1], 'New message')
})

test('omits --exec entirely when there is no chat to open', () => {
  const args = buildNotifyArgs({ title: 'Ada', body: 'hi', jid: null, useOmarchy: true })
  assert.ok(!args.includes('--exec'))
})

test('falls back to the notify-send shape when omarchy is absent', () => {
  const args = buildNotifyArgs({ title: 'Ada', body: 'hi', jid: JID, useOmarchy: false })
  assert.equal(args[0], '-a')
  assert.equal(args[1], 'WhatsApp')
  assert.ok(!args.includes('--exec'))
})
