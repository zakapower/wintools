import type { KeepAppId, UnattendConfig } from './types.ts'

/** Package ids / name prefixes removed when the linked keep-id is unchecked. */
export const BLOAT_PACKAGES: { ids: string[]; removeUnless: KeepAppId }[] = [
  { ids: ['Clipchamp.Clipchamp'], removeUnless: 'clipchamp' },
  { ids: ['Microsoft.3DBuilder'], removeUnless: 'x3DBuilder' },
  { ids: ['Microsoft.549981C3F5F10'], removeUnless: 'x549981C3F5F10' },
  { ids: ['Microsoft.BingFinance'], removeUnless: 'bingFinance' },
  { ids: ['Microsoft.BingFoodAndDrink'], removeUnless: 'bingFoodAndDrink' },
  { ids: ['Microsoft.BingHealthAndFitness'], removeUnless: 'bingHealthAndFitness' },
  { ids: ['Microsoft.BingNews', 'Microsoft.News'], removeUnless: 'bingNews' },
  { ids: ['Microsoft.BingSports'], removeUnless: 'bingSports' },
  { ids: ['Microsoft.BingTranslator'], removeUnless: 'bingTranslator' },
  { ids: ['Microsoft.BingTravel'], removeUnless: 'bingTravel' },
  { ids: ['Microsoft.BingWeather'], removeUnless: 'bingWeather' },
  { ids: ['Microsoft.Windows.AIHub'], removeUnless: 'aIHub' },
  { ids: ['Microsoft.PCManager'], removeUnless: 'pCManager' },
  { ids: ['Microsoft.Getstarted', 'Microsoft.GetStarted'], removeUnless: 'getstarted' },
  { ids: ['Microsoft.Messaging'], removeUnless: 'messaging' },
  { ids: ['Microsoft.Microsoft3DViewer'], removeUnless: 'microsoft3DViewer' },
  { ids: ['Microsoft.MicrosoftJournal'], removeUnless: 'microsoftJournal' },
  { ids: ['Microsoft.MicrosoftOfficeHub'], removeUnless: 'microsoftOfficeHub' },
  { ids: ['Microsoft.MicrosoftPowerBIForWindows'], removeUnless: 'microsoftPowerBIForWindows' },
  { ids: ['Microsoft.MicrosoftSolitaireCollection'], removeUnless: 'microsoftSolitaireCollection' },
  { ids: ['Microsoft.MicrosoftStickyNotes'], removeUnless: 'microsoftStickyNotes' },
  { ids: ['Microsoft.MixedReality.Portal'], removeUnless: 'portal' },
  { ids: ['Microsoft.NetworkSpeedTest'], removeUnless: 'networkSpeedTest' },
  { ids: ['Microsoft.News'], removeUnless: 'news' },
  { ids: ['Microsoft.Office.OneNote'], removeUnless: 'oneNote' },
  { ids: ['Microsoft.Office.Sway'], removeUnless: 'sway' },
  { ids: ['Microsoft.OneConnect'], removeUnless: 'oneConnect' },
  { ids: ['Microsoft.Print3D'], removeUnless: 'print3D' },
  { ids: ['Microsoft.PowerAutomateDesktop'], removeUnless: 'powerAutomateDesktop' },
  { ids: ['Microsoft.SkypeApp'], removeUnless: 'skypeApp' },
  { ids: ['Microsoft.Todos'], removeUnless: 'todos' },
  { ids: ['Microsoft.Windows.DevHome'], removeUnless: 'devHome' },
  { ids: ['Microsoft.WindowsAlarms'], removeUnless: 'windowsAlarms' },
  { ids: ['Microsoft.WindowsFeedbackHub'], removeUnless: 'windowsFeedbackHub' },
  { ids: ['Microsoft.WindowsMaps'], removeUnless: 'windowsMaps' },
  { ids: ['Microsoft.WindowsSoundRecorder'], removeUnless: 'windowsSoundRecorder' },
  { ids: ['Microsoft.XboxApp'], removeUnless: 'xboxApp' },
  { ids: ['Microsoft.ZuneVideo'], removeUnless: 'zuneVideo' },
  { ids: ['MicrosoftCorporationII.MicrosoftFamily'], removeUnless: 'microsoftFamily' },
  { ids: ['MicrosoftCorporationII.QuickAssist'], removeUnless: 'quickAssist' },
  { ids: ['MicrosoftTeams', 'MSTeams'], removeUnless: 'microsoftTeams' },
  { ids: ['MSTeams', 'MicrosoftTeams'], removeUnless: 'mSTeams' },
  { ids: ['Microsoft.BingSearch'], removeUnless: 'bingSearch' },
  { ids: ['Microsoft.GamingApp'], removeUnless: 'gamingApp' },
  { ids: ['Microsoft.GetHelp'], removeUnless: 'getHelp' },
  { ids: ['Microsoft.M365Companions'], removeUnless: 'm365Companions' },
  { ids: ['Microsoft.MSPaint'], removeUnless: 'mSPaint' },
  { ids: ['Microsoft.OutlookForWindows'], removeUnless: 'outlookForWindows' },
  { ids: ['Microsoft.Paint'], removeUnless: 'paint' },
  { ids: ['Microsoft.People'], removeUnless: 'people' },
  { ids: ['Microsoft.RemoteDesktop'], removeUnless: 'remoteDesktop' },
  { ids: ['Microsoft.ScreenSketch'], removeUnless: 'screenSketch' },
  { ids: ['Microsoft.StartExperiencesApp'], removeUnless: 'startExperiencesApp' },
  { ids: ['Microsoft.Whiteboard'], removeUnless: 'whiteboard' },
  { ids: ['Microsoft.Windows.Photos'], removeUnless: 'photos' },
  { ids: ['Microsoft.WindowsCalculator'], removeUnless: 'windowsCalculator' },
  { ids: ['Microsoft.WindowsCamera'], removeUnless: 'windowsCamera' },
  { ids: ['Microsoft.windowscommunicationsapps'], removeUnless: 'windowscommunicationsapps' },
  { ids: ['Microsoft.WindowsNotepad'], removeUnless: 'windowsNotepad' },
  { ids: ['Microsoft.WindowsStore'], removeUnless: 'windowsStore' },
  { ids: ['Microsoft.WindowsTerminal'], removeUnless: 'windowsTerminal' },
  { ids: ['Microsoft.Xbox.TCUI'], removeUnless: 'tCUI' },
  { ids: ['Microsoft.XboxGameOverlay'], removeUnless: 'xboxGameOverlay' },
  { ids: ['Microsoft.XboxGamingOverlay'], removeUnless: 'xboxGamingOverlay' },
  { ids: ['Microsoft.XboxIdentityProvider'], removeUnless: 'xboxIdentityProvider' },
  { ids: ['Microsoft.XboxSpeechToTextOverlay'], removeUnless: 'xboxSpeechToTextOverlay' },
  { ids: ['Microsoft.YourPhone'], removeUnless: 'yourPhone' },
  { ids: ['Microsoft.ZuneMusic'], removeUnless: 'zuneMusic' },
  { ids: ['MicrosoftWindows.CrossDevice'], removeUnless: 'crossDevice' },
  { ids: ['MicrosoftWindows.Client.WebExperience'], removeUnless: 'webExperience' },
  { ids: ['Microsoft.WidgetsPlatformRuntime'], removeUnless: 'widgetsPlatformRuntime' },
  { ids: ['LGElectronics.LGMonitorApp'], removeUnless: 'lGMonitorApp' },
  { ids: ['AD2F1837.HPAIExperienceCenter'], removeUnless: 'hPAIExperienceCenter' },
  { ids: ['AD2F1837.HPConnectedMusic'], removeUnless: 'hPConnectedMusic' },
  {
    ids: ['AD2F1837.HPConnectedPhotopoweredbySnapfish'],
    removeUnless: 'hPConnectedPhotopoweredbySna',
  },
  { ids: ['AD2F1837.HPDesktopSupportUtilities'], removeUnless: 'hPDesktopSupportUtilities' },
  { ids: ['AD2F1837.HPEasyClean'], removeUnless: 'hPEasyClean' },
  { ids: ['AD2F1837.HPFileViewer'], removeUnless: 'hPFileViewer' },
  { ids: ['AD2F1837.HPJumpStarts'], removeUnless: 'hPJumpStarts' },
  {
    ids: ['AD2F1837.HPPCHardwareDiagnosticsWindows'],
    removeUnless: 'hPPCHardwareDiagnosticsWindo',
  },
  { ids: ['AD2F1837.HPPowerManager'], removeUnless: 'hPPowerManager' },
  { ids: ['AD2F1837.HPPrinterControl'], removeUnless: 'hPPrinterControl' },
  { ids: ['AD2F1837.HPPrivacySettings'], removeUnless: 'hPPrivacySettings' },
  { ids: ['AD2F1837.HPQuickDrop'], removeUnless: 'hPQuickDrop' },
  { ids: ['AD2F1837.HPQuickTouch'], removeUnless: 'hPQuickTouch' },
  { ids: ['AD2F1837.HPRegistration'], removeUnless: 'hPRegistration' },
  { ids: ['AD2F1837.HPSupportAssistant'], removeUnless: 'hPSupportAssistant' },
  { ids: ['AD2F1837.HPSureShieldAI'], removeUnless: 'hPSureShieldAI' },
  { ids: ['AD2F1837.HPSystemInformation'], removeUnless: 'hPSystemInformation' },
  { ids: ['AD2F1837.HPWelcome'], removeUnless: 'hPWelcome' },
  { ids: ['AD2F1837.HPWorkWell'], removeUnless: 'hPWorkWell' },
  { ids: ['AD2F1837.myHP'], removeUnless: 'myHP' },
  { ids: ['E046963F.LenovoCompanion'], removeUnless: 'lenovoCompanion' },
  { ids: ['LenovoCompanyLimited.LenovoVantageService'], removeUnless: 'lenovoVantageService' },
  { ids: ['DellInc.DellSupportAssistforPCs'], removeUnless: 'dellSupportAssistforPCs' },
  { ids: ['DellInc.DellDigitalDelivery'], removeUnless: 'dellDigitalDelivery' },
  { ids: ['DellInc.DellMobileConnect'], removeUnless: 'dellMobileConnect' },
  { ids: ['Microsoft.Copilot'], removeUnless: 'copilot' },
]

function psQuoteList(values: string[]): string {
  return values.map((v) => `'${v.replace(/'/g, "''")}'`).join(',')
}

/** PowerShell debloat helper + removal calls for FirstLogon. */
export function buildDebloatLines(cfg: UnattendConfig): string[] {
  const keep = new Set(cfg.keepApps)
  const removeIds = [
    ...new Set(
      BLOAT_PACKAGES.filter((p) => !keep.has(p.removeUnless)).flatMap((p) => p.ids),
    ),
  ]

  const lines = [
    '$ErrorActionPreference = "SilentlyContinue"',
    `function Remove-WtApp([string[]]$Names){ foreach($n in $Names){ Get-AppxPackage -AllUsers $n -ErrorAction SilentlyContinue | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue; Get-AppxPackage -AllUsers | Where-Object { $_.Name -like ($n + "*") } | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue; Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -eq $n -or $_.DisplayName -like ($n + "*") -or $_.PackageName -like ("*" + $n + "*") } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue } }`,
  ]

  if (removeIds.length) {
    lines.push(`Remove-WtApp @(${psQuoteList(removeIds)})`)
    lines.push(`Remove-WtApp @(${psQuoteList(removeIds)})`)
    lines.push(
      `$wt=@(${psQuoteList(removeIds)}); Get-AppxProvisionedPackage -Online | Where-Object { $n=$_.DisplayName; $wt | Where-Object { $n -like ($_ + "*") } } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue`,
    )
  }

  if (!keep.has('edge')) {
    lines.push(
      'Get-AppxPackage -AllUsers *Edge* | Where-Object { $_.Name -notmatch "Dev|Beta|Canary" } | Remove-AppxPackage -AllUsers -ErrorAction SilentlyContinue',
      'Get-AppxProvisionedPackage -Online | Where-Object { $_.DisplayName -like "*Edge*" } | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue',
    )
  }

  return lines
}
