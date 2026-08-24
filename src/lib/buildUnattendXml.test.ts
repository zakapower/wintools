import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultConfig } from './defaults.ts'
import { buildUnattendXml, validateConfig } from './buildUnattendXml.ts'

const sampleConfig = {
  ...defaultConfig,
  computerName: 'DESKTOP-PC',
  userName: 'User',
}

test('default config requires account fields', () => {
  const errors = validateConfig(defaultConfig)
  assert.ok(errors.some((e) => /ПК|PC name/i.test(e.message)))
  assert.ok(errors.some((e) => /пользовател|user name/i.test(e.message)))
  assert.equal(
    errors.find((e) => /ПК|PC name/i.test(e.message))?.targetId,
    'field-computer-name',
  )
  assert.equal(
    errors.find((e) => /пользовател|user name/i.test(e.message))?.targetId,
    'field-user-name',
  )
})

test('sample config validates', () => {
  assert.deepEqual(validateConfig(sampleConfig), [])
})

test('computer name rejects hyphen edges and all digits', () => {
  const hyphen = validateConfig({ ...sampleConfig, computerName: '-PC' })
  const trailing = validateConfig({ ...sampleConfig, computerName: 'PC-' })
  const digits = validateConfig({ ...sampleConfig, computerName: '123' })
  assert.ok(hyphen.some((e) => e.targetId === 'field-computer-name'))
  assert.ok(trailing.some((e) => e.targetId === 'field-computer-name'))
  assert.ok(digits.some((e) => e.targetId === 'field-computer-name'))
})

test('user name rejects Windows-forbidden characters', () => {
  const errors = validateConfig({ ...sampleConfig, userName: 'User:Admin' })
  assert.ok(errors.some((e) => e.targetId === 'field-user-name'))
})

function decodeEncodedCommands(xml: string): string[] {
  const out: string[] = []
  const re = /-EncodedCommand\s+([A-Za-z0-9+/=]+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(xml))) {
    out.push(Buffer.from(m[1], 'base64').toString('utf16le'))
  }
  return out
}

test('buildUnattendXml includes computer name and wipe disk', () => {
  const xml = buildUnattendXml({ ...sampleConfig, diskMode: 'wipe0' })
  assert.match(xml, /<ComputerName>DESKTOP-PC<\/ComputerName>/)
  assert.match(xml, /<Name>User<\/Name>/)
  assert.match(xml, /Windows 11 Pro/)
  assert.match(xml, /<Description>WinTools disk<\/Description>/)
  const disk = decodeEncodedCommands(xml).find((s) =>
    s.includes('WINTOOLS_VOLUMES'),
  )
  assert.ok(disk, 'expected PE disk script')
  assert.match(disk, /WINTOOLS_VOLUMES=C\|Windows\|150;D\|Data\|/)
  assert.match(disk, /\[int\]\$size \* 1024/)
  assert.match(disk, /diskpart/i)
})

test('wipe disk targets first internal disk, not USB Disk 0', () => {
  const xml = buildUnattendXml({ ...sampleConfig, diskMode: 'wipe0' })
  assert.doesNotMatch(xml, /<DiskID>0<\/DiskID>/)
  assert.doesNotMatch(xml, /<WillWipeDisk>/)
  assert.match(xml, /<InstallToAvailablePartition>true<\/InstallToAvailablePartition>/)
  const disk = decodeEncodedCommands(xml).find((s) =>
    s.includes('WINTOOLS_VOLUMES'),
  )
  assert.ok(disk)
  assert.match(disk, /InterfaceType/)
  assert.match(disk, /USB/)
  assert.match(disk, /PEFirmwareType/)
})

test('product key is omitted when none and never shows UI when custom', () => {
  const none = buildUnattendXml(sampleConfig)
  assert.doesNotMatch(none, /<ProductKey>/)
  assert.doesNotMatch(none, /<Key>\s*<\/Key>/)
  const custom = buildUnattendXml({
    ...sampleConfig,
    productKeyMode: 'custom',
    productKeyCustom: 'AAAAA-BBBBB-CCCCC-DDDDD-EEEEE',
  })
  assert.match(
    custom,
    /<ProductKey>\s*<Key>AAAAA-BBBBB-CCCCC-DDDDD-EEEEE<\/Key>\s*<WillShowUI>Never<\/WillShowUI>\s*<\/ProductKey>/,
  )
  assert.doesNotMatch(custom, /VK7JG-NPHTM-C97JM-9MPGT-3V66T/)
})

test('windowsPE disables DynamicUpdate and bypasses TPM checks', () => {
  const xml = buildUnattendXml(sampleConfig)
  assert.match(xml, /<Enable>false<\/Enable>/)
  assert.match(xml, /<DynamicUpdate>/)
  assert.match(xml, /BypassTPMCheck/)
  assert.match(xml, /BypassSecureBootCheck/)
})

test('OOBE does not use deprecated SkipMachineOOBE', () => {
  const xml = buildUnattendXml(sampleConfig)
  assert.doesNotMatch(xml, /SkipMachineOOBE/)
  assert.doesNotMatch(xml, /SkipUserOOBE/)
  assert.match(xml, /<HideOnlineAccountScreens>true<\/HideOnlineAccountScreens>/)
})

test('wipe disk validates empty volume size', () => {
  const emptySize = validateConfig({
    ...sampleConfig,
    diskMode: 'wipe0',
    volumes: [
      { letter: 'C', label: 'Windows', sizeGb: null },
      { letter: 'D', label: 'Data', sizeGb: null },
    ],
  })
  assert.ok(emptySize.some((e) => /размер|size/i.test(e.message)))
})

test('interactive disk omits DiskConfiguration', () => {
  const xml = buildUnattendXml(sampleConfig)
  assert.doesNotMatch(xml, /WillWipeDisk/)
  assert.doesNotMatch(xml, /<Description>WinTools disk<\/Description>/)
  assert.doesNotMatch(xml, /InstallToAvailablePartition/)
  assert.match(xml, /<WillShowUI>Always<\/WillShowUI>/)
})

test('wipe PE disk command stays under Windows Path limit', () => {
  const xml = buildUnattendXml({ ...sampleConfig, diskMode: 'wipe0' })
  const m =
    /<Description>WinTools disk<\/Description>\s*<Path>([^<]*)<\/Path>/.exec(
      xml,
    )
  assert.ok(m, 'expected WinTools disk Path')
  const path = m[1]
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  assert.ok(
    path.length < 8000,
    `RunSynchronous Path is ${path.length} chars (limit ~8191)`,
  )
})

test('extra user and Users group land in XML', () => {
  const xml = buildUnattendXml({
    ...sampleConfig,
    primaryUserAdmin: false,
    extraUserEnabled: true,
    extraUserName: 'Kids',
    extraUserPassword: 'play',
    extraUserAdmin: false,
  })
  assert.match(xml, /<Name>User<\/Name>/)
  assert.match(xml, /<Name>Kids<\/Name>/)
  assert.match(xml, /<Group>Users<\/Group>/)
  const errors = validateConfig({
    ...sampleConfig,
    extraUserEnabled: true,
    extraUserName: 'User',
  })
  assert.ok(errors.some((e) => e.targetId === 'field-extra-user-name'))
})

test('tweaks and vcredist appear in FirstLogon script', () => {
  const xml = buildUnattendXml({
    ...sampleConfig,
    darkTheme: true,
    classicContextMenu: true,
    disableCopilot: true,
    disableRecall: true,
    disableStartAds: true,
    highPerformance: true,
    disableBitLocker: true,
    installApps: ['vcredist'],
  })
  assert.match(xml, /<Description>WinTools BitLocker<\/Description>/)
  const script = decodeEncodedCommands(xml).find((s) =>
    s.includes('Get-AppxPackage'),
  )
  assert.ok(script)
  assert.match(script, /AppsUseLightTheme/)
  assert.match(script, /86ca1aa0-34aa-4e8b-a509-50c905bae2a2/)
  assert.match(script, /TurnOffWindowsCopilot/)
  assert.match(script, /DisableAIDataAnalysis/)
  assert.match(script, /Start_IrisRecommendations/)
  assert.match(script, /SCHEME_MAX/)
  assert.match(script, /PreventDeviceEncryption/)
  assert.match(script, /Microsoft\.VCRedist\.2015\+\.x64/)
  assert.match(script, /Microsoft\.VCRedist\.2015\+\.x86/)
})
