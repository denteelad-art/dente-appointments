#!/bin/bash

# Move execution context to the directory where this script sits
cd "$(dirname "$0")"

# Set window title and design
clear
echo -e "\033[1;36m======================================================================\033[0m"
echo -e "\033[1;33m         ✨ WELCOME TO DENTE CLINIC MANAGEMENT SYSTEM ✨\033[0m"
echo -e "\033[1;32m               🦷 מנהל מרפאת שיניים ומומחים DENTE 🦷\033[0m"
echo -e "\033[1;36m======================================================================\033[0m"
echo

echo "🔹 [1/3] מחפש התקנה של Node.js במחשב שלך..."

# Check standard Node paths on macOS in case PATH is not fully exported to GUI double-clicks
if ! command -v node &> /dev/null
then
    if [ -f "/usr/local/bin/node" ]; then
        export PATH="/usr/local/bin:$PATH"
    elif [ -f "/opt/homebrew/bin/node" ]; then
        export PATH="/opt/homebrew/bin:$PATH"
    fi
fi

if ! command -v node &> /dev/null
then
    echo -e "\033[1;31m❌ אופס! לא מצאנו את Node.js מותקן ב-Mac שלך.\033[0m"
    echo
    echo "כדי להריץ את המערכת בצורה אוטומטית, עליך להתקין Node.js פעם אחת בלבד."
    echo "1. פתח דפדפן והורד מכאן: https://nodejs.org"
    echo "2. בחר בגרסת LTS (מומלץ ליציבות מרבית)."
    echo "3. לאחר ההתקנה הפשוטה, לחץ שוב על הקובץ הזה!"
    echo
    echo "🔗 פותח את עמוד ההורדה עבורך כעת..."
    open "https://nodejs.org"
    read -p "לחץ על Enter ליציאה..."
    exit
fi

echo -e "\033[1;32m✅ נמצאה התקנה תקינה של Node.js! [גרסה: $(node -v)]\033[0m"
echo

# Instant launch optimization: check if node_modules exists so we don't delay start on subsequent runs
# Enforce safe pre-update config and credentials backup before doing any installs
mkdir -p backups
STAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="backups/pre-update-$STAMP"
mkdir -p "$BACKUP_DIR"
echo "⚠️ יוצר גיבוי אבטחה של קובצי ההגדרות והרישיונות בנתיב: $BACKUP_DIR..."
[ -f firebase-applet-config.json ] && cp firebase-applet-config.json "$BACKUP_DIR/"
[ -f package.json ] && cp package.json "$BACKUP_DIR/"
[ -f package-lock.json ] && cp package-lock.json "$BACKUP_DIR/"
[ -f metadata.json ] && cp metadata.json "$BACKUP_DIR/"
[ -f DENTE-Launcher.command ] && cp DENTE-Launcher.command "$BACKUP_DIR/"
[ -f DENTE-Launcher.bat ] && cp DENTE-Launcher.bat "$BACKUP_DIR/"
echo -e "\033[1;32m✅ קובצי הגדרות ונתוני רישוי גובו בהצלחה!\033[0m"
echo

if [ ! -d "node_modules" ]; then
    echo "🔹 [2/3] בודק ומעדכן רכיבי מערכת וספריות קוד (רק במידת הצורך)..."
    echo "⏳ אנא המתן, מתקין את כל הקבצים הדרושים בפעם הראשונה..."
    echo
    npm install --no-audit --no-fund
    echo
    echo -e "\033[1;32m✅ כל ספריות הקוד מוכנות ומעודכנות!\033[0m"
    echo
else
    echo -e "\033[1;32m⚡ רכיבי המערכת כבר מותקנים! מדלג ישירות להפעלת התוכנה...\033[0m"
    echo
fi

echo "🔹 [3/3] מעלה את שרת המרפאה בנמל מקומי 3000..."
echo -e "\033[1;35m🚀 מפעיל את השרת המקומי...\033[0m"
echo -e "⏳ פותח את המערכת בחלון אפליקציה ייעודי תוך 3 שניות..."
echo
echo "📍 כתובת השרת: http://localhost:3000"
echo
echo "✨ תהנה מהגרסה המשודרגת (העתקת טלפונים נקייה, לוגו זהב מרהיב, ועוד!) ✨"
echo -e "\033[1;36m======================================================================\033[0m"
echo

# Open the browser in "App Mode" if Chrome is installed, otherwise fall back to Safari
(
    sleep 3
    if [ -d "/Applications/Google Chrome.app" ]; then
        open -a "Google Chrome" --args --app="http://localhost:3000"
    else
        open "http://localhost:3000"
    fi
) &

# Run the dev server (blocking)
npm run dev
