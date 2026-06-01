@echo off
REM ================================================
REM  AI简历助手 - Windows 一键启动脚本
REM  双击运行，或放在启动目录开机自启：
REM  Win+R → shell:startup → 放入快捷方式
REM ================================================

echo =========================================
echo   AI简历助手 - 启动中...
echo =========================================
echo.

cd /d %~dp0..

REM 创建日志目录
if not exist "logs" mkdir logs

REM 启动后端 (新窗口)
echo [1/2] 启动后端 API (端口 8000)...
start "AI简历后端" cmd /c "cd /d %CD%\api && python -m uvicorn app.dev_server:app --host 0.0.0.0 --port 8000 >> %CD%\logs\backend.log 2>&1"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动 Cloudflare Tunnel (新窗口)
echo [2/2] 启动 Cloudflare Tunnel...
start "Cloudflare Tunnel" cmd /c "cloudflared tunnel --url http://localhost:8000 >> %CD%\logs\tunnel.log 2>&1"

echo.
echo =========================================
echo   启动完成！
echo.
echo   后端: http://localhost:8000
echo   健康检查: http://localhost:8000/api/health
echo.
echo   Tunnel 公网地址查看 logs\tunnel.log
echo   关闭窗口不会停止服务
echo =========================================
echo.
pause
