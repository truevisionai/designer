@echo off
REM Load environment variables from .env file
for /F "eol=# tokens=* delims=" %%a in (.env) do (
    set "%%a"
)

REM update package version to todays date
call npm run update-version

call npm run build:prod

call npm run sentry-inject

call npm run sentry-upload

call npm run release

exit /b
