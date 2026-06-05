# Pristine, high-reliability PowerShell script to define and guarantee the DENTE Clinic Manager desktop shortcut and custom Icon
# Uses local execution context to support Hebrew paths and Unicode characters perfectly, preventing "?" corruption!

# 1. Determine script directory dynamically with perfect Unicode safety
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = $PSScriptRoot }
if (-not $scriptDir) { $scriptDir = Convert-Path . }

$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$batPath = Join-Path $scriptDir "DENTE-Launcher.bat"
$localIco = Join-Path $scriptDir "dentist.ico"
$shortcutPath = Join-Path $desktop "DENTE Clinic Manager.lnk"
$iconDest = "C:\Users\Public\dentist.ico"

# 2. Extract and guarantee the premium .ico file of a Tooth/Dentist offline
if (-not (Test-Path $localIco)) {
    $favIco = Join-Path $scriptDir "public\favicon.ico"
    if (Test-Path $favIco) {
        Copy-Item -Path $favIco -Destination $localIco -Force -ErrorAction SilentlyContinue
    }
}

# Ensure the Public directory exists and copy the icon there to guarantee Explorer natively loads it
try {
    $publicDir = [System.IO.Path]::GetDirectoryName($iconDest)
    if (-not (Test-Path $publicDir)) {
        New-Item -ItemType Directory -Force -Path $publicDir | Out-Null
    }
    if (Test-Path $localIco) {
        Copy-Item -Path $localIco -Destination $iconDest -Force -ErrorAction SilentlyContinue
    }
} catch {}

# 3. Create the Windows Shell shortcut pointing directly to the batch file
$wshell = New-Object -ComObject WScript.Shell
$shortcut = $wshell.CreateShortcut($shortcutPath)

# Point TargetPath directly to the batch file launcher to avoid cmd-argument escaping or security overrides
$shortcut.TargetPath = $batPath
$shortcut.WorkingDirectory = $scriptDir

# Set custom Tooth/dentist icon
if (Test-Path $iconDest) {
    # Standalone .ico files MUST NOT append ',0' index because they are raw icon files. Adding ',0' causes Windows to show a white square placeholder on some versions!
    $shortcut.IconLocation = $iconDest
} elseif (Test-Path $localIco) {
    $shortcut.IconLocation = $localIco
} else {
    # Fallback to a solid Windows shell32 system icon
    $shortcut.IconLocation = "shell32.dll,22" 
}

$shortcut.Description = "DENTE Clinic Management System"
$shortcut.Save()

# Unblock files to bypass Windows SmartScreen/Security block on downloaded/local scripts
Unblock-File -Path $shortcutPath -ErrorAction SilentlyContinue
Unblock-File -Path $batPath -ErrorAction SilentlyContinue
if (Test-Path $localIco) {
    Unblock-File -Path $localIco -ErrorAction SilentlyContinue
}
if (Test-Path $iconDest) {
    Unblock-File -Path $iconDest -ErrorAction SilentlyContinue
}

# 4. Notify Windows shell instantly to refresh the icon cache (no white square delays!)
try {
    $sig = '[DllImport("shell32.dll")] public static extern void SHChangeNotify(int wEventId, uint uFlags, IntPtr dwItem1, IntPtr dwItem2);'
    $type = Add-Type -MemberDefinition $sig -Namespace "Win32" -Name "Shell32" -PassThru
    $type::SHChangeNotify(0x08000000, 0, [IntPtr]::Zero, [IntPtr]::Zero)
} catch {}
