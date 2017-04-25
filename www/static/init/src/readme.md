---
1. 本目录内容为最终编译发布文件
2. 其中的 tmp 目录是项目索引工具依赖库存储位置，无需上传生产环境，可以整体删除
3. start.html 是项目整体文件的索引工具页，因此，项目开发过程中，直接忽略该文件
4. 查看展示时，可以直接打开 start.html 查看，支持 PC/WAP 间的切换，以及项目内相关文件的查找
5. 要取得最佳的浏览效果，请使用 google chrome 浏览查看
6. 在索引页面查看时，因使用到了 iframe ，而如若文件不是在服务程序内浏览时，如：采用直接在浏览器内，打开本地文件方式浏览。此时，chrome 中存在 iframe 跨域访问安全限制问题，页面一样可以打开，但不是最佳效果，如果需要开启最佳效果，此时可以配置开启 chrome 的 disable-web-security 模式。具体配置如下：
  > 找到 chrome.exe 的起始位置，如：

  > C:\Program Files (x86)\Google\Chrome\Application\chrome.exe

  > 进入该目录，在命令行下执行命令：

  > chrome.exe --disable-web-security --user-data-dir=E:\work\tmp

  > 注：E:\work\tmp 目录可以自行指定
7. 这里建议在查看演示时，将所有文件上传到一个简单的 WEB 服务器程序中，如：apache / ngix / IIS等，这样就不会再存在跨域问题，而获得最为流畅的效果
---