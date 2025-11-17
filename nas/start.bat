@echo off
echo 检查依赖并安装...

:: 检查是否已经安装 node_modules 文件夹
if not exist node_modules (
    echo 正在安装依赖包，请等待...
    npm install
    if errorlevel 1 goto error
    echo 依赖安装完成！
)

echo 启动 NAS 服务器...
node server.js
goto end

:error
echo.
echo 错误：npm 安装失败。请确保您已安装 Node.js 并配置了环境变量。
pause

:end
echo.
echo 服务器已关闭或出错。
pause