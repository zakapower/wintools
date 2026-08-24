import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPeDiskScript,
  parseVolumesMarker,
  volumesMarker,
} from './peDiskScript.ts'
import { defaultConfig } from './defaults.ts'

test('volumesMarker round-trips C and remainder D', () => {
  const marker = volumesMarker([
    { letter: 'C', label: 'Windows', sizeGb: 150 },
    { letter: 'D', label: 'Data', sizeGb: null },
  ])
  assert.equal(marker, 'C|Windows|150;D|Data|')
  const parsed = parseVolumesMarker(marker)
  assert.deepEqual(parsed, [
    { letter: 'C', label: 'Windows', sizeGb: 150 },
    { letter: 'D', label: 'Data', sizeGb: null },
  ])
})

test('buildPeDiskScript selects a non-USB disk and runs diskpart', () => {
  const script = buildPeDiskScript({
    ...defaultConfig,
    diskMode: 'wipe0',
    volumes: [
      { letter: 'C', label: 'Windows', sizeGb: 80 },
      { letter: 'D', label: 'Data', sizeGb: null },
    ],
  })
  assert.match(script, /WINTOOLS_VOLUMES=C\|Windows\|80;D\|Data\|/)
  assert.match(script, /InterfaceType/)
  assert.match(script, /USB/)
  assert.match(script, /PEFirmwareType/)
  assert.match(script, /diskpart/)
  assert.match(script, /assign letter=\$L/)
  assert.match(script, /\[int\]\$size \* 1024/)
  assert.doesNotMatch(script, /select disk 0/)
})
