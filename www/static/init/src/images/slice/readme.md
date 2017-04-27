1. 该文件夹存放 sprite 的小图片
2. 命名请以对应 CSS 文件名为前缀。  
   2.1 如在 web.css 中用到的小图片，请以 web-xxxxx.png 方式来命名图片；  
   2.2 如在 wap.css 中用到的，则以 wap-xxxx.png 方式命名，以此类推;  
   2.3 对应的小图片，分别会被合并成 web.png 或是 wap.png，以其前缀来命名合并后的文件。  
3. 在移动端（wap）方案中，如果采用 sprite ，在编写样式规则时，不要加入 background-size 属性，如若图片大小不合适，需要调整，请先编辑好对应的图片。
4. 采用 sprite 方案时，目前不支持背景平铺，即: background-repeat，当确实需要平铺时，请采用单个图片平铺。