@echo off
:: Ensure correct Hebrew representation in CMD
chcp 65001 >nul
title DENTE - ריענון מטמון אייקונים של Windows
color 0B

echo ======================================================================
echo           DENTE SYSTEM - איפוס וניקוי מטמון האייקונים של Windows
echo ======================================================================
echo.
echo [!] תהליך זה מרענן את מטמון האייקונים של Windows כדי לפתור בעיות
echo     של אייקונים שחורים, ריבועים לבנים או אייקונים לא מעודכנים.
echo.
echo [!] שים לב: שורת המשימות ושולחן העבודה יאותחלו לשנייה אחת בצורה בטוחה.
echo.
echo לחצו על מקש כלשהו כדי להתחיל בריענון...
pause >nul

echo.
echo [1/4] סוגר את תהליך Windows Explorer...
taskkill /f /im explorer.exe >nul 2>&1

echo [2/4] מוחק את קבצי המטמון הישנים של האייקונים...
cd /d %userprofile%\AppData\Local\Microsoft\Windows\Explorer >nul 2>&1
del /f /s /q iconcache* >nul 2>&1
attrib -h "%userprofile%\AppData\Local\IconCache.db" >nul 2>&1
del /f /q "%userprofile%\AppData\Local\IconCache.db" >nul 2>&1

echo [3/4] מפעיל מחדש את שולחן העבודה (Windows Explorer)...
start explorer.exe >nul 2>&1

echo [4/4] מרענן ומסנכרן מול מערכת הפעלה...
ie4uinit.exe -show >nul 2>&1

echo.
echo ======================================================================
echo       הפעולה הושלמה בהצלחה! מטמון האייקונים של Windows נוקה ורוענן.
echo ======================================================================
echo.
echo כעת האייקון היפה של השן התכולה אמור להופיע בצורה מבריקה ומעודכנת!
echo לחצו על מקש כלשהו ליציאה.
pause >nul
exit
