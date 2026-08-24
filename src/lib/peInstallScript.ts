import type { UnattendConfig } from './types.ts'
import { volumesMarker } from './peDiskScript.ts'

const EDITION_NAME: Record<UnattendConfig['edition'], string> = {
  Pro: 'Windows 11 Pro',
  Home: 'Windows 11 Home',
  Enterprise: 'Windows 11 Enterprise',
}

const CHUNK_SIZE = 180
const MAX_RUN_PATH = 8191

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

/** Full WinPE install: partition internal disk, dism apply-image, bcdboot, copy unattend, reboot. */
export function buildPeInstallScript(cfg: UnattendConfig): string {
  const marker = volumesMarker(cfg.volumes)
  const edition = EDITION_NAME[cfg.edition].replace(/'/g, "''")
  return `$ErrorActionPreference='Stop'
# WINTOOLS_VOLUMES=${marker}
# WINTOOLS_PE_INSTALL=1
$spec='${marker}'
$ename='${edition}'
$img=$null; $xml=$null; $media=$null
foreach($d in 68..90){ $r=[char]$d+':\'; if(Test-Path ($r+'sources\\install.wim')){$img=$r+'sources\\install.wim'; $media=$r} elseif(Test-Path ($r+'sources\\install.esd')){$img=$r+'sources\\install.esd'; $media=$r}; if(Test-Path ($r+'autounattend.xml')){$xml=$r+'autounattend.xml'; if(!$media){$media=$r}} }
if(!$img -and $media){ foreach($f in @('install.wim','install.esd')){ $p=Join-Path $media ('sources\\'+$f); if(Test-Path $p){$img=$p; break} } }
if(!$img){throw 'install.wim not found'}
if(!$xml){ foreach($d in 68..90){ $r=[char]$d+':\'; if(Test-Path ($r+'autounattend.xml')){$xml=$r+'autounattend.xml'; break} } }
if(!$xml){throw 'autounattend.xml not found'}
function Disks { try{@(Get-WmiObject Win32_DiskDrive)}catch{@(Get-CimInstance Win32_DiskDrive)} }
$in=@(Disks|Where-Object{$_.InterfaceType -ne 'USB' -and $_.MediaType -notmatch 'Removable' -and $_.Model -notmatch 'USB|Flash'})
if(!$in.Count){throw 'No internal disk'}
$nv=@($in|Where-Object{$_.Model -match 'NVMe|SSD'}); $pool=$(if($nv.Count){$nv}else{$in})
$t=$pool|Sort-Object{[uint64]$_.Size} -Descending|Select-Object -First 1
$ix=[int]$t.Index; $mb=[int]([uint64]$t.Size/1MB)
$uefi=$true
try{$uefi=((Get-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Control').PEFirmwareType -eq 2)}catch{}
$vols=@()
foreach($x in $spec.Split(';')){ if(!$x){continue}; $p=$x.Split('|'); $size=$p[2]; $vols+=[pscustomobject]@{L=$p[0];N=$(if($p[1]){$p[1]}else{$p[0]});S=$(if($size){[int]$size * 1024}else{0})} }
$sys=$(if($uefi){276}else{100}); $re=1024; $use=$mb-$sys-$re
if($use -lt 20480){throw 'Disk too small'}
$fixed=0; for($i=0;$i -lt $vols.Count-1;$i++){ $fixed+=[int]$vols[$i].S }
if($fixed+1024 -gt $use){ $oth=$fixed-[int]$vols[0].S; $c=$use-$oth-1024; if($c -lt 20480){ $vols=@($vols[0],$vols[-1]); $c=$use-1024 }; if($c -ge $use){ $vols=@($vols[0]); $vols[0].S=0 } else { $vols[0].S=[int]$c; $vols[-1].S=0 } }
$dp=New-Object System.Collections.Generic.List[string]
$dp.Add("select disk $ix"); $dp.Add('clean')
if($uefi){ $dp.Add('convert gpt'); $dp.Add('create partition efi size=260'); $dp.Add('format quick fs=fat32 label=System'); $dp.Add('assign letter=S'); $dp.Add('create partition msr size=16') } else { $dp.Add('convert mbr'); $dp.Add('create partition primary size=100'); $dp.Add('format quick fs=ntfs label=System'); $dp.Add('active'); $dp.Add('assign letter=S') }
function Safe($n){ $s=($n -replace '[<>:"/\\\\|?*&=]','').Trim(); if($s){$s}else{'Data'} }
function PeLetter($i,$L){ if($i -eq 0){return 'W'}; $x=$L.ToUpper(); if($x -match '^[STWRX]$'){ return $(if($i -eq 1){'D'}else{'E'}) }; return $x }
for($i=0;$i -lt $vols.Count;$i++){
 $last=$i -eq ($vols.Count-1); $n=Safe $vols[$i].N; $L=PeLetter $i $vols[$i].L
 if($last){ $dp.Add('create partition primary'); $dp.Add("shrink desired=$re minimum=$re"); $dp.Add("format quick fs=ntfs label=$n"); $dp.Add("assign letter=$L") }
 else { if([int]$vols[$i].S -le 0){$dp.Add('create partition primary')}else{$dp.Add("create partition primary size=$($vols[$i].S)")}; $dp.Add("format quick fs=ntfs label=$n"); $dp.Add("assign letter=$L") }
}
$dp.Add('create partition primary'); $dp.Add('format quick fs=ntfs label=Recovery'); $dp.Add('assign letter=R')
if($uefi){ $dp.Add('set id=de94bba4-06d1-4d40-a16a-bfd50179d6ac'); $dp.Add('gpt attributes=0x8000000000000001') }
[IO.File]::WriteAllLines('X:\\wintools-disk.txt',$dp.ToArray(),[Text.Encoding]::Unicode)
$p=Start-Process "$env:SystemRoot\\System32\\diskpart.exe" -ArgumentList '/s X:\\wintools-disk.txt' -Wait -PassThru -NoNewWindow
if($p.ExitCode -ne 0){throw "diskpart $($p.ExitCode)"}
$p=Start-Process "$env:SystemRoot\\System32\\dism.exe" -ArgumentList @('/Apply-Image','/ImageFile:'+$img,'/Name:'+$ename,'/ApplyDir:W:\\') -Wait -PassThru -NoNewWindow
if($p.ExitCode -ne 0){
  $idx=$null; $cur=$null
  & "$env:SystemRoot\\System32\\dism.exe" /Get-WimInfo /WimFile:$img | ForEach-Object {
    if($_ -match 'Index\\s*:\\s*(\\d+)'){ $cur=[int]$Matches[1] }
    elseif($cur -and $_ -match 'Name\\s*:\\s*(.+)'){ if($Matches[1].Trim() -eq $ename){ $idx=$cur } }
  }
  if(!$idx){ throw "dism edition not found: $ename" }
  $p=Start-Process "$env:SystemRoot\\System32\\dism.exe" -ArgumentList @('/Apply-Image','/ImageFile:'+$img,'/Index:'+$idx,'/ApplyDir:W:\\') -Wait -PassThru -NoNewWindow
  if($p.ExitCode -ne 0){ throw "dism $($p.ExitCode)" }
}
$fw=$(if($uefi){'UEFI'}else{'BIOS'})
$p=Start-Process "$env:SystemRoot\\System32\\bcdboot.exe" -ArgumentList @('W:\\Windows','/s','S:','/f',$fw) -Wait -PassThru -NoNewWindow
if($p.ExitCode -ne 0){throw "bcdboot $($p.ExitCode)"}
if($uefi){ Start-Process "$env:SystemRoot\\System32\\bcdedit.exe" -ArgumentList @('/set','{fwbootmgr}','bootsequence','{bootmgr}') -Wait -NoNewWindow | Out-Null }
New-Item -Force -ItemType Directory -Path 'W:\\Windows\\Panther' | Out-Null
Copy-Item -Path $xml -Destination 'W:\\Windows\\Panther\\unattend.xml' -Force
Start-Process "$env:SystemRoot\\System32\\wpeutil.exe" -ArgumentList 'reboot' -NoNewWindow | Out-Null`
}

export type PeRunCommand = { desc: string; path: string }

/** Split PE install into many short RunSynchronous paths (Windows limit ~8191). */
export function buildPeInstallRunCommands(cfg: UnattendConfig): PeRunCommand[] {
  const b64 = utf16LeToBase64(buildPeInstallScript(cfg))
  const cmds: PeRunCommand[] = [
    {
      desc: 'WinTools PE stage init',
      path: 'cmd.exe /c "del /f /q X:\\wt.b64 X:\\wt.ps1 2>nul"',
    },
  ]
  for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
    const chunk = b64.slice(i, i + CHUNK_SIZE)
    cmds.push({
      desc: `WinTools PE stage ${Math.floor(i / CHUNK_SIZE) + 1}`,
      path: `cmd.exe /c ">>X:\\wt.b64 (echo ${chunk})"`,
    })
  }
  cmds.push({
    desc: 'WinTools PE stage decode',
    path:
      'powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "[IO.File]::WriteAllBytes(\'X:\\wt.ps1\',[Convert]::FromBase64String(-join (Get-Content \'X:\\wt.b64\')))"',
  })
  cmds.push({
    desc: 'WinTools PE install',
    path: 'powershell.exe -NoProfile -ExecutionPolicy Bypass -File X:\\wt.ps1',
  })
  for (const cmd of cmds) {
    if (cmd.path.length >= MAX_RUN_PATH) {
      throw new Error(`RunSynchronous path too long (${cmd.path.length})`)
    }
  }
  return cmds
}
