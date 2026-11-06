@echo off
title Push Mayank Portfolio to GitHub
echo ===================================================
echo     MAYANK STUDIO - GITHUB DEPLOYMENT HELPER
echo ===================================================
echo.
echo Adding and preparing all files...
git add .
git commit -m "Deploy latest portfolio code and production configs" 2>nul
echo.
echo Please copy your GitHub repository URL from your browser:
echo (Example: https://github.com/mayankk4m-4380/YOUR-REPO.git)
echo.
set /p REPO_URL="Paste your GitHub Repository URL here and press Enter: "
if "%REPO_URL%"=="" (
    echo No URL entered. Aborting.
    pause
    exit /b
)
echo.
echo Setting remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
echo.
echo Pushing files to GitHub...
git push -u origin main --force
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
