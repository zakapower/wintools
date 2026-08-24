import type { InstallAppId } from './installApps.ts'

export type { InstallAppId } from './installApps.ts'

export type ImageLanguage = 'ru-RU' | 'en-US'
export type Edition = 'Pro' | 'Home' | 'Enterprise'
export type DiskMode = 'interactive' | 'wipe0'
export type ExpressPrivacy = 'disable-all' | 'default'

/** Data volume on the wiped internal disk (after EFI/MSR). Last must have sizeGb: null (remainder). */
export type DiskVolume = {
  letter: string
  label: string
  /** Size in GB; null = take remaining space (only last volume). */
  sizeGb: number | null
}

export type UnattendConfig = {
  language: ImageLanguage
  keyboards: Array<'ru' | 'en'>
  timezone: string
  edition: Edition
  productKeyMode: 'none' | 'custom'
  productKeyCustom: string
  diskMode: DiskMode
  volumes: DiskVolume[]
  /** Drive letter for winget installs (C = default path). */
  installDrive: string
  computerName: string
  userName: string
  password: string
  autoLogon: boolean
  primaryUserAdmin: boolean
  extraUserEnabled: boolean
  extraUserName: string
  extraUserPassword: string
  extraUserAdmin: boolean
  keepApps: KeepAppId[]
  installApps: InstallAppId[]
  disableWidgets: boolean
  disableConsumerFeatures: boolean
  expressPrivacy: ExpressPrivacy
  showFileExtensions: boolean
  showHiddenFiles: boolean
  taskbarSearchHidden: boolean
  taskbarAlignLeft: boolean
  taskbarHideTaskView: boolean
  taskbarHideChat: boolean
  taskbarHideWidgets: boolean
  taskbarShowSeconds: boolean
  taskbarEndTask: boolean
  disableOneDrive: boolean
  disableHibernation: boolean
  disableGameDvr: boolean
  enableLongPaths: boolean
  numLockOn: boolean
  disableTelemetry: boolean
  darkTheme: boolean
  classicContextMenu: boolean
  disableCopilot: boolean
  disableRecall: boolean
  disableStartAds: boolean
  highPerformance: boolean
  disableBitLocker: boolean
}

/** Whitelist ids: checked = keep, unchecked = remove on first logon. */
export type KeepAppId =
  | 'edge'
  | 'clipchamp'
  | 'x3DBuilder'
  | 'x549981C3F5F10'
  | 'bingFinance'
  | 'bingFoodAndDrink'
  | 'bingHealthAndFitness'
  | 'bingNews'
  | 'bingSports'
  | 'bingTranslator'
  | 'bingTravel'
  | 'bingWeather'
  | 'aIHub'
  | 'pCManager'
  | 'getstarted'
  | 'messaging'
  | 'microsoft3DViewer'
  | 'microsoftJournal'
  | 'microsoftOfficeHub'
  | 'microsoftPowerBIForWindows'
  | 'microsoftSolitaireCollection'
  | 'microsoftStickyNotes'
  | 'portal'
  | 'networkSpeedTest'
  | 'news'
  | 'oneNote'
  | 'sway'
  | 'oneConnect'
  | 'print3D'
  | 'powerAutomateDesktop'
  | 'skypeApp'
  | 'todos'
  | 'devHome'
  | 'windowsAlarms'
  | 'windowsFeedbackHub'
  | 'windowsMaps'
  | 'windowsSoundRecorder'
  | 'xboxApp'
  | 'zuneVideo'
  | 'microsoftFamily'
  | 'quickAssist'
  | 'microsoftTeams'
  | 'mSTeams'
  | 'bingSearch'
  | 'gamingApp'
  | 'getHelp'
  | 'm365Companions'
  | 'mSPaint'
  | 'outlookForWindows'
  | 'paint'
  | 'people'
  | 'remoteDesktop'
  | 'screenSketch'
  | 'startExperiencesApp'
  | 'whiteboard'
  | 'photos'
  | 'windowsCalculator'
  | 'windowsCamera'
  | 'windowscommunicationsapps'
  | 'windowsNotepad'
  | 'windowsStore'
  | 'windowsTerminal'
  | 'powerShell'
  | 'tCUI'
  | 'xboxGameOverlay'
  | 'xboxGamingOverlay'
  | 'xboxIdentityProvider'
  | 'xboxSpeechToTextOverlay'
  | 'yourPhone'
  | 'zuneMusic'
  | 'crossDevice'
  | 'webExperience'
  | 'widgetsPlatformRuntime'
  | 'lGMonitorApp'
  | 'hPAIExperienceCenter'
  | 'hPConnectedMusic'
  | 'hPConnectedPhotopoweredbySna'
  | 'hPDesktopSupportUtilities'
  | 'hPEasyClean'
  | 'hPFileViewer'
  | 'hPJumpStarts'
  | 'hPPCHardwareDiagnosticsWindo'
  | 'hPPowerManager'
  | 'hPPrinterControl'
  | 'hPPrivacySettings'
  | 'hPQuickDrop'
  | 'hPQuickTouch'
  | 'hPRegistration'
  | 'hPSupportAssistant'
  | 'hPSureShieldAI'
  | 'hPSystemInformation'
  | 'hPWelcome'
  | 'hPWorkWell'
  | 'myHP'
  | 'lenovoCompanion'
  | 'lenovoVantageService'
  | 'dellSupportAssistforPCs'
  | 'dellDigitalDelivery'
  | 'dellMobileConnect'
  | 'copilot'

export type AppCatalogEntry = {
  id: KeepAppId
  labelRu: string
  labelEn: string
  locked?: boolean
  defaultKeep?: boolean
}

/** Microsoft / Windows inbox + OEM AppX (без сторонних Store-приложений). */
export const APP_CATALOG: AppCatalogEntry[] = [
  { id: 'edge', labelRu: 'Microsoft Edge', labelEn: 'Microsoft Edge', defaultKeep: true },
  { id: 'clipchamp', labelRu: 'Clipchamp', labelEn: 'Clipchamp' },
  { id: 'x3DBuilder', labelRu: '3D Builder', labelEn: '3D Builder' },
  { id: 'x549981C3F5F10', labelRu: 'Cortana', labelEn: 'Cortana' },
  { id: 'bingFinance', labelRu: 'Bing Финансы', labelEn: 'Bing Finance' },
  { id: 'bingFoodAndDrink', labelRu: 'Bing Еда и напитки', labelEn: 'Bing Food And Drink' },
  { id: 'bingHealthAndFitness', labelRu: 'Bing Здоровье', labelEn: 'Bing Health And Fitness' },
  { id: 'bingNews', labelRu: 'Bing Новости', labelEn: 'Bing News' },
  { id: 'bingSports', labelRu: 'Bing Спорт', labelEn: 'Bing Sports' },
  { id: 'bingTranslator', labelRu: 'Bing Переводчик', labelEn: 'Bing Translator' },
  { id: 'bingTravel', labelRu: 'Bing Путешествия', labelEn: 'Bing Travel' },
  { id: 'bingWeather', labelRu: 'Погода', labelEn: 'Bing Weather' },
  { id: 'aIHub', labelRu: 'Copilot+ AI Hub', labelEn: 'Copilot+ AI Hub' },
  { id: 'pCManager', labelRu: 'Microsoft PC Manager', labelEn: 'Microsoft PC Manager' },
  { id: 'getstarted', labelRu: 'Советы / Get Started', labelEn: 'Get Started' },
  { id: 'messaging', labelRu: 'Сообщения', labelEn: 'Messaging' },
  { id: 'microsoft3DViewer', labelRu: '3D Viewer', labelEn: '3D Viewer' },
  { id: 'microsoftJournal', labelRu: 'Microsoft Journal', labelEn: 'Microsoft Journal' },
  { id: 'microsoftOfficeHub', labelRu: 'Microsoft 365 (Office Hub)', labelEn: 'Office Hub' },
  { id: 'microsoftPowerBIForWindows', labelRu: 'Power BI', labelEn: 'Power BI' },
  { id: 'microsoftSolitaireCollection', labelRu: 'Косынка (Solitaire)', labelEn: 'Solitaire Collection' },
  { id: 'microsoftStickyNotes', labelRu: 'Записки', labelEn: 'Sticky Notes' },
  { id: 'portal', labelRu: 'Mixed Reality Portal', labelEn: 'Mixed Reality Portal' },
  { id: 'networkSpeedTest', labelRu: 'Проверка скорости сети', labelEn: 'Network Speed Test' },
  { id: 'news', labelRu: 'Microsoft News / Start', labelEn: 'Microsoft News' },
  { id: 'oneNote', labelRu: 'OneNote (UWP)', labelEn: 'OneNote' },
  { id: 'sway', labelRu: 'Sway', labelEn: 'Sway' },
  { id: 'oneConnect', labelRu: 'One Connect / Mobile Plans', labelEn: 'One Connect' },
  { id: 'print3D', labelRu: 'Print 3D', labelEn: 'Print 3D' },
  { id: 'powerAutomateDesktop', labelRu: 'Power Automate', labelEn: 'Power Automate' },
  { id: 'skypeApp', labelRu: 'Skype', labelEn: 'Skype (UWP)' },
  { id: 'todos', labelRu: 'Microsoft To Do', labelEn: 'Microsoft To Do' },
  { id: 'devHome', labelRu: 'Dev Home', labelEn: 'Dev Home' },
  { id: 'windowsAlarms', labelRu: 'Часы и будильники', labelEn: 'Alarms & Clock' },
  { id: 'windowsFeedbackHub', labelRu: 'Feedback Hub', labelEn: 'Feedback Hub' },
  { id: 'windowsMaps', labelRu: 'Карты', labelEn: 'Windows Maps' },
  { id: 'windowsSoundRecorder', labelRu: 'Диктофон', labelEn: 'Sound Recorder' },
  { id: 'xboxApp', labelRu: 'Xbox Console Companion', labelEn: 'Xbox Console Companion' },
  { id: 'zuneVideo', labelRu: 'Кино и ТВ', labelEn: 'Movies & TV' },
  { id: 'microsoftFamily', labelRu: 'Family Safety', labelEn: 'Family Safety' },
  { id: 'quickAssist', labelRu: 'Быстрая помощь', labelEn: 'Quick Assist' },
  { id: 'microsoftTeams', labelRu: 'Microsoft Teams (старый)', labelEn: 'Microsoft Teams (Old)' },
  { id: 'mSTeams', labelRu: 'Microsoft Teams', labelEn: 'Microsoft Teams (New)' },
  { id: 'bingSearch', labelRu: 'Bing Search', labelEn: 'Bing Search' },
  { id: 'gamingApp', labelRu: 'Xbox Game Bar / Gaming App', labelEn: 'Xbox Gaming App' },
  { id: 'getHelp', labelRu: 'Получить помощь', labelEn: 'Get Help' },
  { id: 'm365Companions', labelRu: 'Microsoft 365 Companions', labelEn: 'Microsoft 365 Companions' },
  { id: 'mSPaint', labelRu: 'Paint 3D', labelEn: 'Paint 3D' },
  { id: 'outlookForWindows', labelRu: 'Outlook (new)', labelEn: 'Outlook for Windows' },
  { id: 'paint', labelRu: 'Paint', labelEn: 'Paint' },
  { id: 'people', labelRu: 'Люди', labelEn: 'People' },
  { id: 'remoteDesktop', labelRu: 'Удалённый рабочий стол', labelEn: 'Remote Desktop' },
  { id: 'screenSketch', labelRu: 'Ножницы (Snipping Tool)', labelEn: 'Snipping Tool', defaultKeep: true },
  { id: 'startExperiencesApp', labelRu: 'Виджеты (Start Experiences)', labelEn: 'Widgets Experience' },
  { id: 'whiteboard', labelRu: 'Whiteboard', labelEn: 'Whiteboard' },
  { id: 'photos', labelRu: 'Фотографии', labelEn: 'Photos', defaultKeep: true },
  { id: 'windowsCalculator', labelRu: 'Калькулятор', labelEn: 'Calculator', defaultKeep: true },
  { id: 'windowsCamera', labelRu: 'Камера', labelEn: 'Camera' },
  { id: 'windowscommunicationsapps', labelRu: 'Почта и Календарь', labelEn: 'Mail & Calendar' },
  { id: 'windowsNotepad', labelRu: 'Блокнот', labelEn: 'Notepad', defaultKeep: true },
  { id: 'windowsStore', labelRu: 'Microsoft Store', labelEn: 'Microsoft Store', defaultKeep: true },
  { id: 'windowsTerminal', labelRu: 'Windows Terminal', labelEn: 'Windows Terminal', defaultKeep: true },
  { id: 'powerShell', labelRu: 'PowerShell', labelEn: 'PowerShell', defaultKeep: true },
  { id: 'tCUI', labelRu: 'Xbox TCUI', labelEn: 'Xbox TCUI Framework' },
  { id: 'xboxGameOverlay', labelRu: 'Xbox Game Overlay', labelEn: 'Xbox Game Overlay' },
  { id: 'xboxGamingOverlay', labelRu: 'Xbox Gaming Overlay / Game Bar', labelEn: 'Xbox Gaming Overlay' },
  { id: 'xboxIdentityProvider', labelRu: 'Xbox Identity Provider', labelEn: 'Xbox Identity Provider' },
  { id: 'xboxSpeechToTextOverlay', labelRu: 'Xbox Speech to Text', labelEn: 'Xbox Speech To Text' },
  { id: 'yourPhone', labelRu: 'Связь с телефоном', labelEn: 'Phone Link' },
  { id: 'zuneMusic', labelRu: 'Media Player', labelEn: 'Media Player', defaultKeep: true },
  { id: 'crossDevice', labelRu: 'Cross Device', labelEn: 'Cross Device Experience' },
  { id: 'webExperience', labelRu: 'Web Experience Pack (виджеты)', labelEn: 'Windows Web Experience Pack' },
  { id: 'widgetsPlatformRuntime', labelRu: 'Widgets Platform Runtime', labelEn: 'Widgets Platform Runtime' },
  { id: 'lGMonitorApp', labelRu: 'LG Monitor App', labelEn: 'LG Monitor App' },
  { id: 'hPAIExperienceCenter', labelRu: 'HP AI Experience Center', labelEn: 'HP AI Experience Center' },
  { id: 'hPConnectedMusic', labelRu: 'HP Connected Music', labelEn: 'HP Connected Music' },
  { id: 'hPConnectedPhotopoweredbySna', labelRu: 'HP Connected Photo', labelEn: 'HP Connected Photo' },
  { id: 'hPDesktopSupportUtilities', labelRu: 'HP Desktop Support Utilities', labelEn: 'HP Desktop Support Utilities' },
  { id: 'hPEasyClean', labelRu: 'HP Easy Clean', labelEn: 'HP Easy Clean' },
  { id: 'hPFileViewer', labelRu: 'HP File Viewer', labelEn: 'HP File Viewer' },
  { id: 'hPJumpStarts', labelRu: 'HP JumpStarts', labelEn: 'HP JumpStarts' },
  { id: 'hPPCHardwareDiagnosticsWindo', labelRu: 'HP PC Hardware Diagnostics', labelEn: 'HP PC Hardware Diagnostics' },
  { id: 'hPPowerManager', labelRu: 'HP Power Manager', labelEn: 'HP Power Manager' },
  { id: 'hPPrinterControl', labelRu: 'HP Printer Control', labelEn: 'HP Printer Control' },
  { id: 'hPPrivacySettings', labelRu: 'HP Privacy Settings', labelEn: 'HP Privacy Settings' },
  { id: 'hPQuickDrop', labelRu: 'HP QuickDrop', labelEn: 'HP QuickDrop' },
  { id: 'hPQuickTouch', labelRu: 'HP QuickTouch', labelEn: 'HP QuickTouch' },
  { id: 'hPRegistration', labelRu: 'HP Registration', labelEn: 'HP Registration' },
  { id: 'hPSupportAssistant', labelRu: 'HP Support Assistant', labelEn: 'HP Support Assistant' },
  { id: 'hPSureShieldAI', labelRu: 'HP Sure Shield AI', labelEn: 'HP Sure Shield AI' },
  { id: 'hPSystemInformation', labelRu: 'HP System Information', labelEn: 'HP System Information' },
  { id: 'hPWelcome', labelRu: 'HP Welcome', labelEn: 'HP Welcome' },
  { id: 'hPWorkWell', labelRu: 'HP WorkWell', labelEn: 'HP WorkWell' },
  { id: 'myHP', labelRu: 'myHP', labelEn: 'myHP' },
  { id: 'lenovoCompanion', labelRu: 'Lenovo Vantage', labelEn: 'Lenovo Vantage' },
  { id: 'lenovoVantageService', labelRu: 'Lenovo Vantage Service', labelEn: 'Lenovo Vantage Service' },
  { id: 'dellSupportAssistforPCs', labelRu: 'Dell SupportAssist', labelEn: 'Dell SupportAssist' },
  { id: 'dellDigitalDelivery', labelRu: 'Dell Digital Delivery Services', labelEn: 'Dell Digital Delivery Services' },
  { id: 'dellMobileConnect', labelRu: 'Dell Mobile Connect', labelEn: 'Dell Mobile Connect' },
  { id: 'copilot', labelRu: 'Copilot (AppX)', labelEn: 'Copilot (AppX)' },
]

export const NAV_SECTIONS = [
  { id: 'language', ru: 'Язык и регион', en: 'Language & region' },
  { id: 'edition', ru: 'Редакция и ключ', en: 'Edition & key' },
  { id: 'disk', ru: 'Диск', en: 'Disk' },
  { id: 'account', ru: 'Компьютер и пользователь', en: 'Computer & user' },
  { id: 'system-apps', ru: 'Системные приложения', en: 'System apps' },
  { id: 'apps', ru: 'Приложения', en: 'Apps' },
  { id: 'tweaks', ru: 'Твики', en: 'Tweaks' },
  { id: 'download', ru: 'Обзор и скачивание', en: 'Review & download' },
] as const
