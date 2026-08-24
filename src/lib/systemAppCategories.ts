import type { KeepAppId } from './types.ts'

export type SystemAppCategoryId =
  | 'all'
  | 'windows'
  | 'microsoft'
  | 'bing'
  | 'xbox'
  | 'oem'
  | 'other'

export const SYSTEM_APP_CATEGORIES: Array<{
  id: SystemAppCategoryId
  ru: string
  en: string
}> = [
  { id: 'all', ru: 'Все', en: 'All' },
  { id: 'windows', ru: 'Windows', en: 'Windows' },
  { id: 'microsoft', ru: 'Microsoft', en: 'Microsoft' },
  { id: 'bing', ru: 'Bing и новости', en: 'Bing & news' },
  { id: 'xbox', ru: 'Xbox', en: 'Xbox' },
  { id: 'oem', ru: 'OEM', en: 'OEM' },
  { id: 'other', ru: 'Прочее', en: 'Other' },
]

const WINDOWS: KeepAppId[] = [
  'screenSketch',
  'photos',
  'windowsCalculator',
  'windowsCamera',
  'windowscommunicationsapps',
  'windowsNotepad',
  'windowsStore',
  'windowsTerminal',
  'powerShell',
  'paint',
  'zuneMusic',
  'zuneVideo',
  'windowsAlarms',
  'windowsMaps',
  'windowsSoundRecorder',
  'windowsFeedbackHub',
  'getHelp',
  'quickAssist',
  'remoteDesktop',
  'people',
  'yourPhone',
  'crossDevice',
]

const MICROSOFT: KeepAppId[] = [
  'edge',
  'clipchamp',
  'microsoftOfficeHub',
  'oneNote',
  'todos',
  'microsoftTeams',
  'mSTeams',
  'outlookForWindows',
  'm365Companions',
  'microsoftStickyNotes',
  'microsoftJournal',
  'microsoftSolitaireCollection',
  'microsoftPowerBIForWindows',
  'powerAutomateDesktop',
  'skypeApp',
  'whiteboard',
  'microsoftFamily',
  'pCManager',
  'getstarted',
  'messaging',
  'microsoft3DViewer',
  'print3D',
  'mSPaint',
  'x3DBuilder',
  'portal',
  'networkSpeedTest',
  'oneConnect',
  'sway',
  'devHome',
]

const BING: KeepAppId[] = [
  'x549981C3F5F10',
  'bingFinance',
  'bingFoodAndDrink',
  'bingHealthAndFitness',
  'bingNews',
  'bingSports',
  'bingTranslator',
  'bingTravel',
  'bingWeather',
  'bingSearch',
  'news',
]

const XBOX: KeepAppId[] = [
  'xboxApp',
  'gamingApp',
  'tCUI',
  'xboxGameOverlay',
  'xboxGamingOverlay',
  'xboxIdentityProvider',
  'xboxSpeechToTextOverlay',
]

const OEM: KeepAppId[] = [
  'lGMonitorApp',
  'hPAIExperienceCenter',
  'hPConnectedMusic',
  'hPConnectedPhotopoweredbySna',
  'hPDesktopSupportUtilities',
  'hPEasyClean',
  'hPFileViewer',
  'hPJumpStarts',
  'hPPCHardwareDiagnosticsWindo',
  'hPPowerManager',
  'hPPrinterControl',
  'hPPrivacySettings',
  'hPQuickDrop',
  'hPQuickTouch',
  'hPRegistration',
  'hPSupportAssistant',
  'hPSureShieldAI',
  'hPSystemInformation',
  'hPWelcome',
  'hPWorkWell',
  'myHP',
  'lenovoCompanion',
  'lenovoVantageService',
  'dellSupportAssistforPCs',
  'dellDigitalDelivery',
  'dellMobileConnect',
]

const OTHER: KeepAppId[] = [
  'aIHub',
  'startExperiencesApp',
  'webExperience',
  'widgetsPlatformRuntime',
  'copilot',
]

const BY_ID = new Map<KeepAppId, SystemAppCategoryId>([
  ...WINDOWS.map((id): [KeepAppId, SystemAppCategoryId] => [id, 'windows']),
  ...MICROSOFT.map((id): [KeepAppId, SystemAppCategoryId] => [id, 'microsoft']),
  ...BING.map((id): [KeepAppId, SystemAppCategoryId] => [id, 'bing']),
  ...XBOX.map((id): [KeepAppId, SystemAppCategoryId] => [id, 'xbox']),
  ...OEM.map((id): [KeepAppId, SystemAppCategoryId] => [id, 'oem']),
  ...OTHER.map((id): [KeepAppId, SystemAppCategoryId] => [id, 'other']),
])

export function systemAppCategory(id: KeepAppId): SystemAppCategoryId {
  return BY_ID.get(id) ?? 'other'
}
