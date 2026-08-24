import type { UnattendConfig } from './types.ts'
import { BLOAT_PACKAGES } from './bloatPackages.ts'
import {
  INSTALL_APP_CATALOG,
  VCREDIST_X86_WINGET_ID,
} from './installApps.ts'
import {
  MIN_DATA_GB,
  MIN_VOLUMES,
  MAX_VOLUMES,
  MIN_WINDOWS_GB,
} from './diskVolumes.ts'
import { buildPeInstallRunCommands } from './peInstallScript.ts'

const EDITION_NAME: Record<UnattendConfig['edition'], string> = {
  Pro: 'Windows 11 Pro',
  Home: 'Windows 11 Home',
  Enterprise: 'Windows 11 Enterprise',
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function uiLanguage(cfg: UnattendConfig): string {
  return cfg.language
}

function inputLocale(cfg: UnattendConfig): string {
  const locales = cfg.keyboards.map((k) =>
    k === 'ru' ? '0419:00000419' : '0409:00000409',
  )
  return locales.join(';') || '0419:00000419'
}

function productKeyValue(cfg: UnattendConfig): string {
  if (cfg.productKeyMode !== 'custom') return ''
  return cfg.productKeyCustom.trim()
}

const GENERIC_PRODUCT_KEYS: Record<UnattendConfig['edition'], string> = {
  Pro: 'VK7JG-NPHTM-C97JM-9MPGT-3V66T',
  Home: 'YTMG3-N6DKC-DKB77-7M9GH-8HVX7',
  Enterprise: 'XGVPP-NMH47-7TTHJ-W3FW7-8HV2C',
}

function productKeyUserDataXml(cfg: UnattendConfig): string {
  if (cfg.productKeyMode === 'custom') {
    const key = productKeyValue(cfg)
    if (!key) return ''
    return `<ProductKey>
          <Key>${esc(key)}</Key>
          <WillShowUI>Never</WillShowUI>
        </ProductKey>`
  }
  const genericKey = GENERIC_PRODUCT_KEYS[cfg.edition]
  return `<ProductKey>
          <Key>${genericKey}</Key>
          <WillShowUI>OnError</WillShowUI>
        </ProductKey>`
}

function productKeySpecializeXml(cfg: UnattendConfig): string {
  if (cfg.productKeyMode === 'custom') {
    const key = productKeyValue(cfg)
    if (!key) return ''
    return `<ProductKey>${esc(key)}</ProductKey>`
  }
  return `<ProductKey>${GENERIC_PRODUCT_KEYS[cfg.edition]}</ProductKey>`
}

function imageInstallXml(_cfg: UnattendConfig): string {
  const from = `
            <InstallFrom>
              <MetaData wcm:action="add">
                <Key>/IMAGE/NAME</Key>
                <Value>${esc(EDITION_NAME[_cfg.edition])}</Value>
              </MetaData>
            </InstallFrom>`
  return `
      <ImageInstall>
        <OSImage>
          ${from}
          <WillShowUI>Never</WillShowUI>
        </OSImage>
      </ImageInstall>`
}

function windowsPeSetupBody(cfg: UnattendConfig, user: string): string {
  if (cfg.diskMode === 'wipe0') {
    return `${runSynchronousXml(cfg)}`
  }
  return `${imageInstallXml(cfg)}
      <DynamicUpdate>
        <Enable>false</Enable>
        <WillShowUI>Never</WillShowUI>
      </DynamicUpdate>
      ${runSynchronousXml(cfg)}
      <UserData>
        <AcceptEula>true</AcceptEula>
        <FullName>${user}</FullName>
        <Organization>WinTools</Organization>
        ${productKeyUserDataXml(cfg)}
      </UserData>`
}

function runSynchronousXml(cfg: UnattendConfig): string {
  const lab =
    'cmd.exe /c "reg.exe add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassTPMCheck /t REG_DWORD /d 1 /f & ' +
    'reg.exe add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassSecureBootCheck /t REG_DWORD /d 1 /f & ' +
    'reg.exe add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassRAMCheck /t REG_DWORD /d 1 /f & ' +
    'reg.exe add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassCPUCheck /t REG_DWORD /d 1 /f & ' +
    'reg.exe add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassStorageCheck /t REG_DWORD /d 1 /f & ' +
    'reg.exe add HKLM\\SYSTEM\\Setup\\LabConfig /v BypassDiskCheck /t REG_DWORD /d 1 /f & ' +
    'reg.exe add HKLM\\SYSTEM\\Setup\\MoSetup /v AllowUpgradesWithUnsupportedTPMOrCPU /t REG_DWORD /d 1 /f"'
  const cmds = [
    {
      desc: 'WinTools LabConfig',
      path: lab,
    },
  ]
  if (cfg.disableBitLocker) {
    cmds.push({
      desc: 'WinTools BitLocker',
      path: 'cmd.exe /c "reg.exe add HKLM\\SYSTEM\\CurrentControlSet\\Control\\BitLocker /v PreventDeviceEncryption /t REG_DWORD /d 1 /f"',
    })
  }
  if (cfg.diskMode === 'wipe0') {
    cmds.push(...buildPeInstallRunCommands(cfg))
  }
  return `
      <RunSynchronous>
        ${cmds
          .map(
            (c, i) => `<RunSynchronousCommand wcm:action="add">
          <Order>${i + 1}</Order>
          <Description>${esc(c.desc)}</Description>
          <Path>${esc(c.path)}</Path>
        </RunSynchronousCommand>`,
          )
          .join('\n        ')}
      </RunSynchronous>`
}

function bloatScript(cfg: UnattendConfig): string {
  const keep = new Set(cfg.keepApps)
  const remove = BLOAT_PACKAGES.filter((p) => !keep.has(p.removeUnless)).map(
    (p) => p.id,
  )

  const lines = [
    '$ErrorActionPreference = "SilentlyContinue"',
    ...remove.map(
      (id) =>
        `Get-AppxPackage -AllUsers "${id}" | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue; Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -eq "${id}" } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue`,
    ),
  ]

  if (!keep.has('edge')) {
    lines.push(
      'Get-AppxPackage -AllUsers *Edge* | Where-Object { $_.Name -notmatch "Dev|Beta|Canary" } | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue',
      'Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -like "*Edge*" } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue',
    )
  }

  if (cfg.disableWidgets) {
    lines.push(
      'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Dsh" /v AllowNewsAndInterests /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.disableConsumerFeatures) {
    lines.push(
      'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent" /v DisableWindowsConsumerFeatures /t REG_DWORD /d 1 /f',
    )
  }
  if (cfg.showFileExtensions) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v HideFileExt /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.showHiddenFiles) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Hidden /t REG_DWORD /d 1 /f',
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowSuperHidden /t REG_DWORD /d 1 /f',
    )
  }
  if (cfg.taskbarSearchHidden) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Search" /v SearchboxTaskbarMode /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.taskbarAlignLeft) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarAl /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.taskbarHideTaskView) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowTaskViewButton /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.taskbarHideChat) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarMn /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.taskbarHideWidgets) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v TaskbarDa /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.taskbarShowSeconds) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowSecondsInSystemClock /t REG_DWORD /d 1 /f',
    )
  }
  if (cfg.taskbarEndTask) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced\\TaskbarDeveloperSettings" /v TaskbarEndTask /t REG_DWORD /d 1 /f',
    )
  }
  if (cfg.disableGameDvr) {
    lines.push(
      'reg add "HKCU\\System\\GameConfigStore" /v GameDVR_Enabled /t REG_DWORD /d 0 /f',
      'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\GameDVR" /v AllowGameDVR /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.enableLongPaths) {
    lines.push(
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem" /v LongPathsEnabled /t REG_DWORD /d 1 /f',
    )
  }
  if (cfg.numLockOn) {
    lines.push(
      'reg add "HKU\\.DEFAULT\\Control Panel\\Keyboard" /v InitialKeyboardIndicators /t REG_SZ /d 2 /f',
    )
  }
  if (cfg.disableTelemetry) {
    lines.push(
      'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
      'reg add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.disableOneDrive) {
    lines.push(
      'Stop-Process -Name OneDrive -Force -ErrorAction SilentlyContinue',
      '@("$env:SystemRoot\\System32\\OneDriveSetup.exe","$env:SystemRoot\\SysWOW64\\OneDriveSetup.exe") | ForEach-Object { if (Test-Path $_) { Start-Process $_ -ArgumentList "/uninstall" -Wait -ErrorAction SilentlyContinue } }',
    )
  }
  if (cfg.disableHibernation) {
    lines.push('powercfg /h off')
  }
  if (cfg.darkTheme) {
    lines.push(
      'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v AppsUseLightTheme /t REG_DWORD /d 0 /f',
      'reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize" /v SystemUsesLightTheme /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.classicContextMenu) {
    lines.push(
      'reg add "HKCU\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32" /f /ve',
    )
  }
  if (cfg.disableCopilot) {
    lines.push(
      'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Copilot" /v TurnOffWindowsCopilot /t REG_DWORD /d 1 /f',
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v ShowCopilotButton /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.disableRecall) {
    lines.push(
      'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsAI" /v DisableAIDataAnalysis /t REG_DWORD /d 1 /f',
    )
  }
  if (cfg.disableStartAds) {
    lines.push(
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager" /v SystemPaneSuggestionsEnabled /t REG_DWORD /d 0 /f',
      'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v Start_IrisRecommendations /t REG_DWORD /d 0 /f',
    )
  }
  if (cfg.highPerformance) {
    lines.push('powercfg /setactive SCHEME_MAX')
  }
  if (cfg.disableBitLocker) {
    lines.push(
      'reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\BitLocker" /v PreventDeviceEncryption /t REG_DWORD /d 1 /f',
    )
  }

  const toInstall = INSTALL_APP_CATALOG.filter((a) =>
    cfg.installApps.includes(a.id),
  )
  const wingetIds: string[] = []
  for (const a of toInstall) {
    wingetIds.push(a.wingetId)
    if (a.id === 'vcredist') wingetIds.push(VCREDIST_X86_WINGET_ID)
  }
  if (wingetIds.length) {
    const drive = (cfg.installDrive || 'C').toUpperCase().slice(0, 1)
    const locationArg =
      drive && drive !== 'C' ? ` --location "${drive}:\\Apps"` : ''
    const wingetLines = [
      '$ErrorActionPreference = "SilentlyContinue"',
      '$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")',
      ...wingetIds.map(
        (id) =>
          `winget install -e --id ${id} --accept-package-agreements --accept-source-agreements --disable-interactivity${locationArg}`,
      ),
    ]
    const wingetLiteral = wingetLines
      .map((l) => `'${l.replace(/'/g, "''")}'`)
      .join(',')
    lines.push(
      `$wt=Join-Path $env:TEMP 'wintools-winget.ps1'; Set-Content -Path $wt -Encoding UTF8 -Value @(${wingetLiteral}); Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$wt)`,
    )
  }

  lines.push(
    'Get-Process explorer -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Start-Process explorer.exe',
  )

  // Escape for XML via EncodedCommand - UTF-16LE base64 (works in Node and browser)
  const ps = lines.join('; ')
  const b64 = utf16LeToBase64(ps)
  return `powershell.exe -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${b64}`
}

function localAccountXml(
  name: string,
  password: string,
  admin: boolean,
): string {
  const user = esc(name.trim())
  const pass = esc(password)
  const group = admin ? 'Administrators' : 'Users'
  return `<LocalAccount wcm:action="add">
            <Name>${user}</Name>
            <DisplayName>${user}</DisplayName>
            <Group>${group}</Group>
            <Password>
              <Value>${pass}</Value>
              <PlainText>true</PlainText>
            </Password>
          </LocalAccount>`
}

function utf16LeToBase64(text: string): string {
  const bytes = new Uint8Array(text.length * 2)
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    bytes[i * 2] = code & 0xff
    bytes[i * 2 + 1] = (code >> 8) & 0xff
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64')
  }
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function isValidUserName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length > 0 && trimmed.length <= 20 && !/[/\\[\]:;|=,+*?<>"]/.test(trimmed)
}

export type ConfigError = {
  message: string
  targetId: string
}

export function validateConfig(
  cfg: UnattendConfig,
  lang: 'ru' | 'en' = 'ru',
): ConfigError[] {
  const t = (ru: string, en: string) => (lang === 'ru' ? ru : en)
  const errors: ConfigError[] = []
  if (!cfg || typeof cfg !== 'object') {
    errors.push({
      message: t('Некорректная конфигурация', 'Invalid configuration'),
      targetId: 'download',
    })
    return errors
  }
  const computerName =
    typeof cfg.computerName === 'string' ? cfg.computerName : ''
  const userName = typeof cfg.userName === 'string' ? cfg.userName : ''
  if (
    !/^(?![0-9]+$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,13}[A-Za-z0-9])?$/.test(
      computerName,
    )
  ) {
    errors.push({
      message: t(
        'Имя ПК: 1-15 символов (латиница, цифры, дефис; не с дефиса и не из одних цифр)',
        'PC name: 1-15 chars (letters, digits, hyphen; not starting/ending with hyphen, not all digits)',
      ),
      targetId: 'field-computer-name',
    })
  }
  if (!userName.trim()) {
    errors.push({
      message: t('Укажите имя пользователя', 'Enter a user name'),
      targetId: 'field-user-name',
    })
  } else if (!isValidUserName(userName)) {
    errors.push({
      message: t(
        'Имя пользователя: до 20 символов, без / \\ [ ] : ; | = , + * ? < > "',
        'User name: up to 20 chars, no / \\ [ ] : ; | = , + * ? < > "',
      ),
      targetId: 'field-user-name',
    })
  }
  if (cfg.extraUserEnabled) {
    const extraName =
      typeof cfg.extraUserName === 'string' ? cfg.extraUserName : ''
    if (!extraName.trim()) {
      errors.push({
        message: t(
          'Укажите имя второго пользователя',
          'Enter a name for the second user',
        ),
        targetId: 'field-extra-user-name',
      })
    } else if (!isValidUserName(extraName)) {
      errors.push({
        message: t(
          'Имя второго пользователя: до 20 символов, без спецсимволов',
          'Second user name: up to 20 chars, no special characters',
        ),
        targetId: 'field-extra-user-name',
      })
    } else if (
      extraName.trim().toLowerCase() === userName.trim().toLowerCase()
    ) {
      errors.push({
        message: t(
          'Имена пользователей должны отличаться',
          'User names must be different',
        ),
        targetId: 'field-extra-user-name',
      })
    }
  }
  if (cfg.diskMode === 'wipe0') {
    // Do not fill missing sizes - empty fields must surface as errors.
    const volumes = Array.isArray(cfg.volumes)
      ? cfg.volumes.map((v) => ({
          letter: String(v?.letter ?? '')
            .toUpperCase()
            .slice(0, 1),
          label: typeof v?.label === 'string' ? v.label : '',
          sizeGb: v?.sizeGb,
        }))
      : []
    if (volumes.length < MIN_VOLUMES || volumes.length > MAX_VOLUMES) {
      errors.push({
        message: t(
          `Нужно от ${MIN_VOLUMES} до ${MAX_VOLUMES} разделов`,
          `Need ${MIN_VOLUMES}-${MAX_VOLUMES} volumes`,
        ),
        targetId: 'field-volumes',
      })
    }
    if (volumes[0]?.letter !== 'C') {
      errors.push({
        message: t(
          'Первый раздел должен быть C: (Windows)',
          'First volume must be C: (Windows)',
        ),
        targetId: 'field-volumes',
      })
    }
    if (volumes.length && volumes[volumes.length - 1].sizeGb != null) {
      errors.push({
        message: t(
          'Последний раздел должен быть «остаток»',
          'Last volume must be the remainder',
        ),
        targetId: 'field-volumes',
      })
    }
    const letters = new Set<string>()
    for (let i = 0; i < volumes.length; i++) {
      const v = volumes[i]
      const L = v.letter.toUpperCase()
      if (!/^[A-Z]$/.test(L)) {
        errors.push({
          message: t('Некорректная буква диска', 'Invalid drive letter'),
          targetId: 'field-volumes',
        })
        break
      }
      if (letters.has(L)) {
        errors.push({
          message: t(
            'Буквы разделов должны быть разными',
            'Volume letters must be unique',
          ),
          targetId: 'field-volumes',
        })
        break
      }
      letters.add(L)
      if (!v.label.trim()) {
        errors.push({
          message: t(
            `Укажите метку для ${L}:`,
            `Enter a label for ${L}:`,
          ),
          targetId: 'field-volumes',
        })
      }
      if (i < volumes.length - 1) {
        if (v.sizeGb == null || !Number.isFinite(v.sizeGb)) {
          errors.push({
            message: t(
              `Укажите размер для ${L}: (ГБ)`,
              `Enter size for ${L}: (GB)`,
            ),
            targetId: 'field-volumes',
          })
        } else if (i === 0 && (v.sizeGb < MIN_WINDOWS_GB || v.sizeGb > 2000)) {
          errors.push({
            message: t(
              `Размер C: от ${MIN_WINDOWS_GB} до 2000 ГБ`,
              `C: size must be ${MIN_WINDOWS_GB}-2000 GB`,
            ),
            targetId: 'field-volumes',
          })
        } else if (i > 0 && v.sizeGb < MIN_DATA_GB) {
          errors.push({
            message: t(
              `Размер ${L}: минимум ${MIN_DATA_GB} ГБ`,
              `${L}: size at least ${MIN_DATA_GB} GB`,
            ),
            targetId: 'field-volumes',
          })
        }
      }
    }
  }
  if (cfg.installApps.length > 0) {
    const drive = (cfg.installDrive || 'C').toUpperCase()
    if (!/^[A-Z]$/.test(drive)) {
      errors.push({
        message: t(
          'Укажите букву диска для программ',
          'Pick a drive letter for apps',
        ),
        targetId: 'field-install-drive',
      })
    } else if (cfg.diskMode === 'wipe0') {
      const letters = new Set(
        cfg.volumes.map((v) => v.letter.toUpperCase().slice(0, 1)),
      )
      if (!letters.has(drive)) {
        errors.push({
          message: t(
            'Диск для программ должен совпадать с одним из разделов',
            'App install drive must match one of the volumes',
          ),
          targetId: 'field-install-drive',
        })
      }
    }
  }
  if (cfg.productKeyMode === 'custom' && cfg.productKeyCustom.trim().length < 5) {
    errors.push({
      message: t(
        'Укажите ключ продукта или выберите другой режим',
        'Enter a product key or pick another mode',
      ),
      targetId: 'field-product-key',
    })
  }
  if (cfg.edition === 'Enterprise') {
    errors.push({
      message: t(
        'Enterprise нет в обычном ISO Windows 11. Выберите Pro или Home, либо используйте ISO Enterprise.',
        'Enterprise is not in a standard Windows 11 ISO. Pick Pro or Home, or use an Enterprise ISO.',
      ),
      targetId: 'field-edition',
    })
  }
  if (!cfg.keyboards.length) {
    errors.push({
      message: t('Нужна хотя бы одна раскладка', 'At least one keyboard layout'),
      targetId: 'field-keyboards',
    })
  }
  return errors
}

export function buildUnattendXml(cfg: UnattendConfig): string {
  const lang = uiLanguage(cfg)
  const locale = inputLocale(cfg)
  const pass = esc(cfg.password)
  const user = esc(cfg.userName.trim())
  const protect =
    cfg.expressPrivacy === 'disable-all'
      ? '<ProtectYourPC>3</ProtectYourPC>'
      : '<ProtectYourPC>1</ProtectYourPC>'

  const autoLogon =
    cfg.autoLogon !== false
      ? `
      <AutoLogon>
        <Enabled>true</Enabled>
        <Username>${user}</Username>
        <Password>
          <Value>${pass}</Value>
          <PlainText>true</PlainText>
        </Password>
        <LogonCount>1</LogonCount>
      </AutoLogon>`
      : ''

  const firstLogon = `
      <FirstLogonCommands>
        <SynchronousCommand wcm:action="add">
          <Order>1</Order>
          <Description>WinTools debloat</Description>
          <CommandLine>${esc(bloatScript(cfg))}</CommandLine>
        </SynchronousCommand>
      </FirstLogonCommands>`

  const oobeShell = (arch: 'amd64' | 'wow64') => `
    <component name="Microsoft-Windows-International-Core" processorArchitecture="${arch}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <InputLocale>${locale}</InputLocale>
      <SystemLocale>${lang}</SystemLocale>
      <UILanguage>${lang}</UILanguage>
      <UserLocale>${lang}</UserLocale>
    </component>
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="${arch}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <OOBE>
        <HideEULAPage>true</HideEULAPage>
        <HideOEMRegistrationScreen>true</HideOEMRegistrationScreen>
        <HideOnlineAccountScreens>true</HideOnlineAccountScreens>
        <HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>
        <HideLocalAccountScreen>true</HideLocalAccountScreen>
        ${protect}
      </OOBE>
      <UserAccounts>
        <AdministratorPassword>
          <Value>${pass}</Value>
          <PlainText>true</PlainText>
        </AdministratorPassword>
        <LocalAccounts>
          ${localAccountXml(cfg.userName, cfg.password, cfg.primaryUserAdmin !== false)}
          ${
            cfg.extraUserEnabled
              ? localAccountXml(
                  cfg.extraUserName,
                  cfg.extraUserPassword ?? '',
                  Boolean(cfg.extraUserAdmin),
                )
              : ''
          }
        </LocalAccounts>
      </UserAccounts>
      ${autoLogon}
      ${firstLogon}
    </component>`

  return `<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State">
  <settings pass="windowsPE">
    <component name="Microsoft-Windows-International-Core-WinPE" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <SetupUILanguage>
        <UILanguage>${lang}</UILanguage>
      </SetupUILanguage>
      <InputLocale>${locale}</InputLocale>
      <SystemLocale>${lang}</SystemLocale>
      <UILanguage>${lang}</UILanguage>
      <UserLocale>${lang}</UserLocale>
    </component>
    <component name="Microsoft-Windows-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      ${windowsPeSetupBody(cfg, user)}
    </component>
  </settings>
  <settings pass="specialize">
    <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <ComputerName>${esc(cfg.computerName)}</ComputerName>
      <TimeZone>${esc(cfg.timezone)}</TimeZone>
      <NetworkLocation>Home</NetworkLocation>
      ${productKeySpecializeXml(cfg)}
    </component>
    <component name="Microsoft-Windows-Deployment" processorArchitecture="amd64" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS">
      <RunSynchronous>
        <RunSynchronousCommand wcm:action="add">
          <Order>1</Order>
          <Description>WinTools BypassNRO</Description>
          <Path>reg.exe add "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\OOBE" /v BypassNRO /t REG_DWORD /d 1 /f</Path>
        </RunSynchronousCommand>
      </RunSynchronous>
    </component>
  </settings>
  <settings pass="oobeSystem">
    ${oobeShell('amd64')}
    ${oobeShell('wow64')}
  </settings>
</unattend>
`
}
