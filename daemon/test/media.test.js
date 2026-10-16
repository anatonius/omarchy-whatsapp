import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const cacheHome = mkdtempSync(join(tmpdir(), 'omarchy-whatsapp-media-test-'))
process.env.XDG_CACHE_HOME = cacheHome
process.env.OMARCHY_WHATSAPP_LOG_LEVEL = 'silent'

const { mediaDir } = await import('../lib/paths.js')
const { pruneMediaCache } = await import('../lib/media.js')
mkdirSync(mediaDir, { recursive: true })

test.after(() => rmSync(cacheHome, { recursive: true, force: true }))

test('prunes media older than its configured retention period', () => {
  const oldFile = join(mediaDir, 'old.jpg')
  const recentFile = join(mediaDir, 'recent.jpg')
  const now = Date.now()
  writeFileSync(oldFile, 'old')
  writeFileSync(recentFile, 'recent')
  utimesSync(oldFile, new Date(now - 20 * 86400000), new Date(now - 20 * 86400000))

  assert.equal(pruneMediaCache(10, now), 1)
  assert.equal(existsSync(oldFile), false)
  assert.equal(existsSync(recentFile), true)
})

test('zero days disables media cache expiry', () => {
  const file = join(mediaDir, 'retained.jpg')
  writeFileSync(file, 'retained')

  assert.equal(pruneMediaCache(0), 0)
  assert.equal(existsSync(file), true)
})
