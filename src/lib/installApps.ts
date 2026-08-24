/** Third-party apps installed via winget on first logon. */
export type InstallAppId =
  | 'chrome'
  | 'firefox'
  | 'brave'
  | 'yandex'
  | '7zip'
  | 'winrar'
  | 'notepadpp'
  | 'vscode'
  | 'cursor'
  | 'git'
  | 'powertoys'
  | 'everything'
  | 'geek'
  | 'revo'
  | 'v2raytun'
  | 'discord'
  | 'telegram'
  | 'steam'
  | 'epic'
  | 'battlenet'
  | 'ubisoft'
  | 'ea'
  | 'vlc'
  | 'spotify'
  | 'obsidian'
  | 'notion'
  | 'sharex'
  | 'qbittorrent'
  | 'anydesk'
  | 'cloudflare'
  | 'windhawk'
  | 'office'
  | 'dotnet8'
  | 'vcredist'

export type InstallAppEntry = {
  id: InstallAppId
  labelRu: string
  labelEn: string
  wingetId: string
}

export const INSTALL_APP_CATALOG: InstallAppEntry[] = [
  { id: 'chrome', labelRu: 'Google Chrome', labelEn: 'Google Chrome', wingetId: 'Google.Chrome' },
  { id: 'firefox', labelRu: 'Mozilla Firefox', labelEn: 'Mozilla Firefox', wingetId: 'Mozilla.Firefox' },
  { id: 'brave', labelRu: 'Brave', labelEn: 'Brave', wingetId: 'Brave.Brave' },
  { id: 'yandex', labelRu: 'Яндекс Браузер', labelEn: 'Yandex Browser', wingetId: 'Yandex.Browser' },
  { id: '7zip', labelRu: '7-Zip', labelEn: '7-Zip', wingetId: '7zip.7zip' },
  { id: 'winrar', labelRu: 'WinRAR', labelEn: 'WinRAR', wingetId: 'RARLab.WinRAR' },
  { id: 'notepadpp', labelRu: 'Notepad++', labelEn: 'Notepad++', wingetId: 'Notepad++.Notepad++' },
  { id: 'vscode', labelRu: 'Visual Studio Code', labelEn: 'Visual Studio Code', wingetId: 'Microsoft.VisualStudioCode' },
  { id: 'cursor', labelRu: 'Cursor', labelEn: 'Cursor', wingetId: 'Anysphere.Cursor' },
  { id: 'git', labelRu: 'Git', labelEn: 'Git', wingetId: 'Git.Git' },
  { id: 'powertoys', labelRu: 'PowerToys', labelEn: 'PowerToys', wingetId: 'Microsoft.PowerToys' },
  { id: 'everything', labelRu: 'Everything', labelEn: 'Everything', wingetId: 'voidtools.Everything' },
  { id: 'geek', labelRu: 'Geek Uninstaller', labelEn: 'Geek Uninstaller', wingetId: 'GeekUninstaller.GeekUninstaller' },
  { id: 'revo', labelRu: 'Revo Uninstaller', labelEn: 'Revo Uninstaller', wingetId: 'RevoUninstaller.RevoUninstaller' },
  { id: 'v2raytun', labelRu: 'V2RayTun', labelEn: 'V2RayTun', wingetId: 'v2RayTun.Windows' },
  { id: 'cloudflare', labelRu: 'Cloudflare WARP', labelEn: 'Cloudflare WARP', wingetId: 'Cloudflare.Warp' },
  { id: 'anydesk', labelRu: 'AnyDesk', labelEn: 'AnyDesk', wingetId: 'AnyDeskSoftwareGmbH.AnyDesk' },
  { id: 'discord', labelRu: 'Discord', labelEn: 'Discord', wingetId: 'Discord.Discord' },
  { id: 'telegram', labelRu: 'Telegram', labelEn: 'Telegram', wingetId: 'Telegram.TelegramDesktop' },
  { id: 'steam', labelRu: 'Steam', labelEn: 'Steam', wingetId: 'Valve.Steam' },
  { id: 'epic', labelRu: 'Epic Games Launcher', labelEn: 'Epic Games Launcher', wingetId: 'EpicGames.EpicGamesLauncher' },
  { id: 'battlenet', labelRu: 'Battle.net', labelEn: 'Battle.net', wingetId: 'Blizzard.BattleNet' },
  { id: 'ubisoft', labelRu: 'Ubisoft Connect', labelEn: 'Ubisoft Connect', wingetId: 'Ubisoft.Connect' },
  { id: 'ea', labelRu: 'EA App', labelEn: 'EA App', wingetId: 'ElectronicArts.EADesktop' },
  { id: 'vlc', labelRu: 'VLC', labelEn: 'VLC', wingetId: 'VideoLAN.VLC' },
  { id: 'qbittorrent', labelRu: 'qBittorrent', labelEn: 'qBittorrent', wingetId: 'qBittorrent.qBittorrent' },
  { id: 'spotify', labelRu: 'Spotify', labelEn: 'Spotify', wingetId: 'Spotify.Spotify' },
  { id: 'obsidian', labelRu: 'Obsidian', labelEn: 'Obsidian', wingetId: 'Obsidian.Obsidian' },
  { id: 'notion', labelRu: 'Notion', labelEn: 'Notion', wingetId: 'Notion.Notion' },
  { id: 'sharex', labelRu: 'ShareX', labelEn: 'ShareX', wingetId: 'ShareX.ShareX' },
  { id: 'windhawk', labelRu: 'Windhawk', labelEn: 'Windhawk', wingetId: 'RamenSoftware.Windhawk' },
  { id: 'office', labelRu: 'Microsoft 365 / Office', labelEn: 'Microsoft 365 / Office', wingetId: 'Microsoft.Office' },
  { id: 'dotnet8', labelRu: '.NET 8 Desktop Runtime', labelEn: '.NET 8 Desktop Runtime', wingetId: 'Microsoft.DotNet.DesktopRuntime.8' },
  { id: 'vcredist', labelRu: 'Visual C++ 2015-2022', labelEn: 'Visual C++ 2015-2022', wingetId: 'Microsoft.VCRedist.2015+.x64' },
]

export const VCREDIST_X86_WINGET_ID = 'Microsoft.VCRedist.2015+.x86'
