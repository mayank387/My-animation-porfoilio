@echo off
title Push Mayank Portfolio to GitHub
echo ===================================================
echo     MAYANK STUDIO - GITHUB DEPLOYMENT HELPER
echo ===================================================
echo.
echo Adding and preparing all files...
git add .
git commit -m "Lighthouse Performance 90+ & Accessibility optimizations with hosting configs" 2>nul
echo.

git remote get-url origin >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Existing GitHub remote found!
    echo Pushing files to GitHub main branch...
    git push -u origin main
) else (
    echo Please copy your GitHub repository URL from your browser:
    echo (Example: https://github.com/mayank387/My-animation-porfoilio.git)
    echo.
    set /p REPO_URL="Paste your GitHub Repository URL here and press Enter: "
    if "%REPO_URL%"=="" (
        echo No URL entered. Aborting.
        pause
        exit /b
    )
    echo Setting remote origin...
    git remote remove origin 2>nul
    git remote add origin %REPO_URL%
    git branch -M main
    echo Pushing files to GitHub...
    git push -u origin main --force
)
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo  SUCCESS! All portfolio files uploaded to GitHub!
    echo  Netlify and Vercel will now build and deploy your site!
    echo ===================================================
) else (
    echo ===================================================
    echo  If a browser window opened, click 'Sign in with browser'.
    echo  Then run this script again.
    echo ===================================================
)
echo.
pause
