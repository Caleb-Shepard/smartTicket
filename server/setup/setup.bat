@echo off
set /p user="Enter MySQL username: "
set /p pass="Enter MySQL password: "
mysql -u %user% --password=%pass% < table_Creation.sql && echo Success!
pause