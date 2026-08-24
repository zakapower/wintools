import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultConfig } from './defaults.ts'
import { BLOAT_PACKAGES, buildDebloatLines } from './debloatScript.ts'

test('buildDebloatLines includes Remove-WtApp helper and triple pass', () => {
  const lines = buildDebloatLines(defaultConfig)
  const script = lines.join('\n')
  assert.match(script, /function Remove-WtApp/)
  assert.equal((script.match(/Remove-WtApp @/g) ?? []).length, 2)
  assert.match(script, /Get-AppxProvisionedPackage -Online \| Where-Object/)
})

test('buildDebloatLines skips packages marked as keep', () => {
  const lines = buildDebloatLines({
    ...defaultConfig,
    keepApps: [...defaultConfig.keepApps, 'todos'],
  })
  const script = lines.join('\n')
  assert.doesNotMatch(script, /'Microsoft\.Todos'/)
})

test('buildDebloatLines removes Teams aliases when unchecked', () => {
  const keep = defaultConfig.keepApps.filter(
    (id) => id !== 'microsoftTeams' && id !== 'mSTeams',
  )
  const lines = buildDebloatLines({ ...defaultConfig, keepApps: keep })
  const script = lines.join('\n')
  assert.match(script, /'MSTeams'/)
  assert.match(script, /'MicrosoftTeams'/)
})

test('buildDebloatLines keeps Edge when edge is in keepApps', () => {
  const lines = buildDebloatLines({
    ...defaultConfig,
    keepApps: [...defaultConfig.keepApps, 'edge'],
  })
  const script = lines.join('\n')
  assert.doesNotMatch(script, /\*Edge\*/)
})

test('buildDebloatLines removes Edge when edge is unchecked', () => {
  const keep = defaultConfig.keepApps.filter((id) => id !== 'edge')
  const lines = buildDebloatLines({ ...defaultConfig, keepApps: keep })
  const script = lines.join('\n')
  assert.match(script, /\*Edge\*/)
})

test('BLOAT_PACKAGES uses ids arrays with aliases', () => {
  const teams = BLOAT_PACKAGES.find((p) => p.removeUnless === 'microsoftTeams')
  assert.ok(teams)
  assert.ok(teams!.ids.includes('MSTeams'))
  assert.ok(teams!.ids.includes('MicrosoftTeams'))
})
