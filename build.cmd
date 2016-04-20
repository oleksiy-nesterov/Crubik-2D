@echo off
for %%a in (.) do set APP_NAME=%%~na
set APP_HOME=%~dp0www\
set DEPLOY_HOME=%~dp0..\..\build\%APP_NAME%

rem Remove old folder
rd /s/q "%DEPLOY_HOME%"

rem Make new folders
md "%DEPLOY_HOME%\img"
md "%DEPLOY_HOME%\css"
md "%DEPLOY_HOME%\js"

rem Copy files
xcopy /e /y "%APP_HOME%img" "%DEPLOY_HOME%\img"
xcopy /e /y "%APP_HOME%js" "%DEPLOY_HOME%\js"
xcopy /e /y "%APP_HOME%css" "%DEPLOY_HOME%\css"
copy "%APP_HOME%*.png" "%DEPLOY_HOME%\*.png"
copy "%APP_HOME%*.html" "%DEPLOY_HOME%\*.html"
copy "%APP_HOME%*.xml" "%DEPLOY_HOME%\*.xml"
copy "%APP_HOME%*.ico" "%DEPLOY_HOME%\*.ico"
copy "%APP_HOME%*.txt" "%DEPLOY_HOME%\*.txt"

rem Minimize and pack
cd /d "%DEPLOY_HOME%"
for /r css %%f in (*.css) do java -jar "%DROPBOX%\Webmotoric\~cmd\yuicompressor.jar" --type css --charset utf-8 "%%f" -o "%%f"
for /r js %%f in (*.js) do java -jar "%DROPBOX%\Webmotoric\~cmd\compiler.jar" --js="%%f" --js_output_file="%%f"
"%WINRAR%" a -afzip -r "~www.zip"