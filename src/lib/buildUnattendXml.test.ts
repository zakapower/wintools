import test from 'node:test'
import assert from 'node:assert/strict'
import { defaultConfig } from './defaults.ts'
import { buildUnattendXml, validateConfig } from './buildUnattendXml.ts'
import { buildPeInstallScript } from './peInstallScript.ts'

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
  assert.match(xml, /<Description>WinTools PE install<\/Description>/)
  assert.doesNotMatch(xml, /<ImageInstall>/)
  assert.match(xml, /<ProductKey>VK7JG-NPHTM-C97JM-9MPGT-3V66T<\/ProductKey>/)
  const disk = buildPeInstallScript({ ...sampleConfig, diskMode: 'wipe0' })
  assert.match(disk, /WINTOOLS_PE_INSTALL=1/)
  assert.match(disk, /WINTOOLS_VOLUMES=C\|Windows\|150;D\|Data\|/)
  assert.match(disk, /dism\.exe/)
  assert.match(disk, /bcdboot\.exe/)
  assert.match(disk, /Panther\\unattend\.xml/)
  assert.match(disk, /wpeutil\.exe/)
  assert.match(disk, /PeLetter/)
})

test('wipe disk targets first internal disk, not USB Disk 0', () => {
  const disk = buildPeInstallScript({ ...sampleConfig, diskMode: 'wipe0' })
  assert.doesNotMatch(disk, /select disk 0/)
  assert.match(disk, /InterfaceType/)
  assert.match(disk, /USB/)
  assert.match(disk, /PEFirmwareType/)
  assert.match(disk, /PeLetter/)
})

test('product key uses generic GVLK when none and custom key when set', () => {
  const none = buildUnattendXml({ ...sampleConfig, diskMode: 'interactive' })
  assert.match(
    none,
    /<ProductKey>\s*<Key>VK7JG-NPHTM-C97JM-9MPGT-3V66T<\/Key>\s*<WillShowUI>OnError<\/WillShowUI>\s*<\/ProductKey>/,
  )
  const wipe = buildUnattendXml({ ...sampleConfig, diskMode: 'wipe0' })
  assert.match(wipe, /<ProductKey>VK7JG-NPHTM-C97JM-9MPGT-3V66T<\/ProductKey>/)
  const custom = buildUnattendXml({
    ...sampleConfig,
    diskMode: 'interactive',
    productKeyMode: 'custom',
    productKeyCustom: 'AAAAA-BBBBB-CCCCC-DDDDD-EEEEE',
  })
  assert.match(
    custom,
    /<ProductKey>\s*<Key>AAAAA-BBBBB-CCCCC-DDDDD-EEEEE<\/Key>\s*<WillShowUI>Never<\/WillShowUI>\s*<\/ProductKey>/,
  )
})

test('interactive disk mode is rejected', () => {
  const errors = validateConfig({ ...sampleConfig, diskMode: 'interactive' })
  assert.ok(errors.some((e) => e.targetId === 'field-volumes'))
})

test('OOBE hides privacy when disable-all', () => {
  const xml = buildUnattendXml({ ...sampleConfig, expressPrivacy: 'disable-all' })
  assert.match(xml, /<HidePrivacyExperience>true<\/HidePrivacyExperience>/)
  assert.match(xml, /<ProtectYourPC>3<\/ProtectYourPC>/)
})

test('windowsPE disables DynamicUpdate and bypasses TPM checks', () => {
  const xml = buildUnattendXml({ ...sampleConfig, diskMode: 'interactive' })
  assert.match(xml, /<Enable>false<\/Enable>/)
  assert.match(xml, /<DynamicUpdate>/)
  assert.match(xml, /BypassTPMCheck/)
  assert.match(xml, /BypassSecureBootCheck/)
  const wipe = buildUnattendXml({ ...sampleConfig, diskMode: 'wipe0' })
  assert.match(wipe, /BypassTPMCheck/)
  assert.doesNotMatch(wipe, /<DynamicUpdate>/)
})

test('OOBE hides local account screen and skips deprecated flags', () => {
  const xml = buildUnattendXml(sampleConfig)
  assert.doesNotMatch(xml, /SkipMachineOOBE/)
  assert.doesNotMatch(xml, /SkipUserOOBE/)
  assert.match(xml, /<HideOnlineAccountScreens>true<\/HideOnlineAccountScreens>/)
  assert.match(xml, /<HideLocalAccountScreen>true<\/HideLocalAccountScreen>/)
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
  const xml = buildUnattendXml({ ...sampleConfig, diskMode: 'interactive' })
  assert.doesNotMatch(xml, /WillWipeDisk/)
  assert.doesNotMatch(xml, /<Description>WinTools PE install<\/Description>/)
  assert.doesNotMatch(xml, /InstallToAvailablePartition/)
  assert.match(xml, /<ImageInstall>/)
  assert.match(xml, /<WillShowUI>Never<\/WillShowUI>/)
})

test('wipe PE install RunSynchronous paths stay under Windows limit', () => {
  const xml = buildUnattendXml({ ...sampleConfig, diskMode: 'wipe0' })
  const paths = [...xml.matchAll(/<Path>([^<]*)<\/Path>/g)].map((m) =>
    m[1]
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>'),
  )
  assert.ok(paths.some((p) => p.includes('X:\\wt.ps1')))
  for (const path of paths) {
    assert.ok(
      path.length < 8000,
      `RunSynchronous Path is ${path.length} chars (limit ~8191)`,
    )
  }
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

test('Enterprise edition is rejected for standard ISO', () => {
  const errors = validateConfig({ ...sampleConfig, edition: 'Enterprise' })
  assert.ok(errors.some((e) => e.targetId === 'field-edition'))
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
  assert.match(script, /WinToolsApps/)
  assert.match(script, /Test-Connection/)
  assert.match(script, /Start-Process explorer\.exe/)
})
