import {
  APP_CATALOG,
  type KeepAppId,
  type UnattendConfig,
} from './types.ts'
import { DEFAULT_VOLUMES } from './diskVolumes.ts'

export const ALL_KEEP_APPS: KeepAppId[] = APP_CATALOG.map((a) => a.id)

/** Same set as the “Базовый набор” button / initial defaults. */
export const DEFAULT_KEEP_APPS: KeepAppId[] = APP_CATALOG.filter(
  (a) => a.defaultKeep || a.locked,
).map((a) => a.id)

export const defaultConfig: UnattendConfig = {
  language: 'ru-RU',
  keyboards: ['ru', 'en'],
  timezone: 'Russian Standard Time',
  edition: 'Pro',
  productKeyMode: 'none',
  productKeyCustom: '',
  diskMode: 'interactive',
  volumes: DEFAULT_VOLUMES.map((v) => ({ ...v })),
  installDrive: 'C',
  computerName: '',
  userName: '',
  password: '',
  autoLogon: true,
  primaryUserAdmin: true,
  extraUserEnabled: false,
  extraUserName: '',
  extraUserPassword: '',
  extraUserAdmin: false,
  keepApps: [...DEFAULT_KEEP_APPS],
  installApps: [],
  disableWidgets: false,
  disableConsumerFeatures: false,
  expressPrivacy: 'default',
  showFileExtensions: false,
  showHiddenFiles: false,
  taskbarSearchHidden: false,
  taskbarAlignLeft: false,
  taskbarHideTaskView: false,
  taskbarHideChat: false,
  taskbarHideWidgets: false,
  taskbarShowSeconds: false,
  taskbarEndTask: false,
  disableOneDrive: false,
  disableHibernation: false,
  disableGameDvr: false,
  enableLongPaths: false,
  numLockOn: false,
  disableTelemetry: false,
  darkTheme: false,
  classicContextMenu: false,
  disableCopilot: false,
  disableRecall: false,
  disableStartAds: false,
  highPerformance: false,
  disableBitLocker: false,
}
