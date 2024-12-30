# Define a function to count lines for specific file types, excluding certain folders
function Get-LineCounts {
    param (
        [string]$Path,
        [string[]]$Extensions = @("*.cpp", "*.h", "*.hpp", "*.cc", "*.c", "*.inl"),
        [string[]]$ExcludedFolders = @("thirdparty", "doc")
    )

    $results = @{}

    # Loop through each file type extension
    foreach ($extension in $Extensions) {
        $files = Get-ChildItem -Path $Path -Recurse -Include $extension -File |
                 Where-Object { 
                     # Exclude files in specified folders
                     $exclude = $false
                     foreach ($folder in $ExcludedFolders) {
                         if ($_.FullName -match [regex]::Escape($folder)) {
                             $exclude = $true
                             break
                         }
                     }
                     -not $exclude
                 }

        $totalLines = 0
        $fileCount = 0

        foreach ($file in $files) {
            $lineCount = (Get-Content $file.FullName).Count
            $totalLines += $lineCount
            $fileCount++
        }

        if ($fileCount -gt 0) {
            $results[$extension] = @{
                Files = $fileCount
                Lines = $totalLines
            }
        }
    }

    return $results
}

# Path to the root of your C++ project
$ProjectPath = Read-Host "Enter the path to your C++ project"

if (-not (Test-Path $ProjectPath)) {
    Write-Error "The specified path does not exist."
    exit
}

Write-Host "Counting lines of code in project at: $ProjectPath`n"

# Get line counts for all relevant file types
$results = Get-LineCounts -Path $ProjectPath

# Display the results
Write-Host "Line Count Breakdown by File Type:`n"
$totalLines = 0
$totalFiles = 0

foreach ($key in $results.Keys) {
    $info = $results[$key]
    $extension = $key
    $fileCount = $info.Files
    $lineCount = $info.Lines
    $totalFiles += $fileCount
    $totalLines += $lineCount

    Write-Host "$extension`tFiles: $fileCount`tLines: $lineCount"
}

Write-Host "`nTotal Files: $totalFiles"
Write-Host "Total Lines: $totalLines"
