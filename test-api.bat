@echo off
echo ===============================================
echo TEST SCRIPT - Aplikacia Skrinky Backend API
echo ===============================================
echo.

echo Kontrolujem ci server bezi...
curl -s http://localhost:3000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Server nebezi! Spustite najprv server: npm start
    exit /b 1
)
echo [OK] Server bezi
echo.

echo TEST 1: Registracia noveho clena
echo -------------------------------------------
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Test\",\"lastName\":\"Pouzivatel\",\"email\":\"test@example.com\",\"phone\":\"+421900111222\",\"gender\":\"muz\",\"password\":\"test123\"}"
echo.
echo.

echo TEST 2: Prihlasenie Owner uctu
echo -------------------------------------------
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"identifier\":\"admin@skrinky.sk\",\"password\":\"admin123\"}"
echo.
echo.

echo TEST 3: Ziskanie zoznamu skriniek
echo -------------------------------------------
echo Prihlaste sa do aplikacie a otestujte manualne.
echo.

echo ===============================================
echo TESTY DOKONCENE
echo ===============================================
echo.
echo Poznamka: Pre podrobnejsie testy pouzite Postman alebo test-api.sh na Linux/Mac
pause
