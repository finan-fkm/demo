# Static HTTP Server for Keysons Group
param(
    [int]$Port = 8080,
    [switch]$OpenBrowser
)

$root = (Resolve-Path $PSScriptRoot).Path
$prefix = "http://localhost:$Port/"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Error "Could not start HTTP listener on $prefix : $_"
    exit 1
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Keysons Group Local Web Server" -ForegroundColor Green
Write-Host " Running at: $prefix" -ForegroundColor Yellow
Write-Host " Root dir:   $root" -ForegroundColor Gray
Write-Host " Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "=============================================" -ForegroundColor Cyan

if ($OpenBrowser) {
    try {
        Start-Process $prefix
    } catch {
        Write-Warning "Could not automatically launch browser: $_"
    }
}

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".mjs"   = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".webp"  = "image/webp"
    ".avif"  = "image/avif"
    ".gif"   = "image/gif"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".woff"  = "font/woff"
    ".woff2" = "font/woff2"
    ".ttf"   = "font/ttf"
    ".otf"   = "font/otf"
    ".mp4"   = "video/mp4"
    ".webm"  = "video/webm"
    ".pdf"   = "application/pdf"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = [System.Uri]::UnescapeDataString($request.Url.AbsolutePath)
        if ($path -eq "/" -or [string]::IsNullOrWhiteSpace($path)) {
            $path = "/index.html"
        }

        # Normalize relative path
        $cleanPath = $path.TrimStart("/\").Replace("/", [System.IO.Path]::DirectorySeparatorChar)
        $targetFile = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $cleanPath))

        # Basic security: ensure target stays inside $root
        if (-not $targetFile.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $msg = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
            $response.Close()
            continue
        }

        if ([System.IO.File]::Exists($targetFile)) {
            $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
            $mime = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $mime = $mimeTypes[$ext]
            }

            $response.StatusCode = 200
            $response.ContentType = $mime
            $response.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.AddHeader("Access-Control-Allow-Origin", "*")

            try {
                $bytes = [System.IO.File]::ReadAllBytes($targetFile)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host "200 OK  - $path" -ForegroundColor Green
            } catch {
                Write-Warning "Error writing response for $path : $_"
            }
        } else {
            $response.StatusCode = 404
            $html = "<html><body><h1>404 Not Found</h1><p>File not found: $path</p></body></html>"
            $msg = [System.Text.Encoding]::UTF8.GetBytes($html)
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
            Write-Host "404 NOT - $path" -ForegroundColor Red
        }

        try {
            $response.Close()
        } catch {}
    }
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
        $listener.Close()
    }
}
