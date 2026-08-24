import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultConfig } from './defaults.ts'
import { buildPeInstallScript, buildPeInstallRunCommands } from './peInstallScript.ts'

test('buildPeInstallScript finds image, applies to W:, copies unattend', () => {
  const script = buildPeInstallScript({
    ...defaultConfig,
    edition: 'Pro',
    volumes: [
      { letter: 'C', label: 'Windows', sizeGb: 80 },
      { letter: 'D', label: 'Data', sizeGb: null },
    ],
  })
  assert.match(script, /WINTOOLS_PE_INSTALL=1/)
  assert.match(script, /install\.wim/)
  assert.match(script, /autounattend\.xml/)
  assert.match(script, /\$ename='Windows 11 Pro'/)
  assert.match(script, /\/Apply-Image/)
  assert.match(script, /\/ApplyDir:W:\\/)
  assert.match(script, /bcdboot\.exe/)
  assert.match(script, /assign letter=S/)
  assert.match(script, /PeLetter/)
  assert.match(script, /assign letter=R/)
  assert.match(script, /Panther\\unattend\.xml/)
  assert.match(script, /wpeutil\.exe/)
  assert.doesNotMatch(script, /select disk 0/)
})

test('buildPeInstallRunCommands keeps each RunSynchronous path short', () => {
  const cmds = buildPeInstallRunCommands({
    ...defaultConfig,
    volumes: [
      { letter: 'C', label: 'Windows', sizeGb: 80 },
      { letter: 'D', label: 'Data', sizeGb: null },
    ],
  })
  assert.ok(cmds.length > 4)
  assert.equal(cmds[cmds.length - 1]?.desc, 'WinTools PE install')
  for (const cmd of cmds) {
    assert.ok(cmd.path.length < 8000, `${cmd.desc}: ${cmd.path.length} chars`)
  }
})
