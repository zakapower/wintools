import type { DiskVolume, UnattendConfig } from './types.ts'
import { normalizeVolumes } from './diskVolumes.ts'

function sanitizeLabel(label: string): string {
  return label.replace(/[|;\r\n'"]/g, ' ').trim() || 'Data'
}

export function volumesMarker(volumes: DiskVolume[]): string {
  return normalizeVolumes(volumes)
    .map((v) => `${v.letter}|${sanitizeLabel(v.label)}|${v.sizeGb ?? ''}`)
    .join(';')
}

export function parseVolumesMarker(marker: string): DiskVolume[] | null {
  const parts = marker
    .trim()
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length < 2) return null
  const volumes = parts.map((part, i) => {
    const [letter = 'D', label = 'Data', size = ''] = part.split('|')
    const sizeGb = size ? Number(size) : null
    return {
      letter: (i === 0 ? 'C' : letter).toUpperCase().slice(0, 1),
      label: label || letter,
      sizeGb: sizeGb != null && Number.isFinite(sizeGb) ? sizeGb : null,
    }
  })
  volumes[volumes.length - 1] = {
    ...volumes[volumes.length - 1],
    sizeGb: null,
  }
  return volumes
}

/** Compact WinPE script: wipe first internal (non-USB) disk and apply volumes. */
export function buildPeDiskScript(cfg: UnattendConfig): string {
  const marker = volumesMarker(cfg.volumes)
  const spec = marker
  return `$ErrorActionPreference='Stop'
# WINTOOLS_VOLUMES=${marker}
$spec='${spec}'
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
if($uefi){ $dp.Add('convert gpt'); $dp.Add('create partition efi size=260'); $dp.Add('format quick fs=fat32 label=EFI'); $dp.Add('create partition msr size=16') } else { $dp.Add('convert mbr'); $dp.Add('create partition primary size=100'); $dp.Add('format quick fs=ntfs label=System'); $dp.Add('active') }
function Safe($n){ $s=($n -replace '[<>:"/\\\\|?*&=]','').Trim(); if($s){$s}else{'Data'} }
 for($i=0;$i -lt $vols.Count;$i++){
 $last=$i -eq ($vols.Count-1); $n=Safe $vols[$i].N; $L=$vols[$i].L
 if($last){ $dp.Add('create partition primary'); $dp.Add("shrink desired=$re minimum=$re"); $dp.Add("format quick fs=ntfs label=$n"); $dp.Add("assign letter=$L") }
 else { if([int]$vols[$i].S -le 0){$dp.Add('create partition primary')}else{$dp.Add("create partition primary size=$($vols[$i].S)")}; $dp.Add("format quick fs=ntfs label=$n"); $dp.Add("assign letter=$L") }
}
$dp.Add('create partition primary'); $dp.Add('format quick fs=ntfs label=Recovery')
if($uefi){ $dp.Add('set id=de94bba4-06d1-4d40-a16a-bfd50179d6ac'); $dp.Add('gpt attributes=0x8000000000000001') }
[IO.File]::WriteAllLines('X:\\wintools-disk.txt',$dp.ToArray(),[Text.Encoding]::Unicode)
$p=Start-Process "$env:SystemRoot\\System32\\diskpart.exe" -ArgumentList '/s X:\\wintools-disk.txt' -Wait -PassThru -NoNewWindow
if($p.ExitCode -ne 0){throw "diskpart $($p.ExitCode)"}`
}
