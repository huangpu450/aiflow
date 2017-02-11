项目由亚信CMC UED团队创建

## 1. 项目初始化，安装相关依赖

```
npm install
```

## 2. 启动服务

```
npm start
```

## 3. 相关配置说明
### 3.1 服务端口
配置文件路径：  
src/common/config/config.js
```
port: 1234
```
框架默认的端口号为：1234  
服务启动后，即可通过: [localhost:1234](http://localhost:1234) 访问

### 3.2 项目配置
路径：
src/common/config/aipro.js
```
export default {
    'pro': [
        {
            // 项目编号，值必须唯一，用于标记项目的唯一性属性
            sn: '2016-SN12',
            // 项目工程名称，必须唯一
            name: 'gqkuandai',
            // 项目标题
            title: '陕西宽带国庆活动',
            // 项目类型： web or wap
            type: 'web',
            // 项目展示平台： pc or phone
            dev: 'pc',
            // 项目日期
            date: '2016-10-09',
            // 展示平台为 phone 时， 单位 px 转 rem 时的换算单位
            remUnit: 20,
            // SVN地址
            svn: ''
        },
        ...
    ]
}
```
多个项目，以数组方式配置在这个数组中。

## 4. 相关任务流程
任务参数包括：  
pro  指定任务所对应的项目名称，对应于项目配置中的 pro.name；  
sn   指定任务所对应的项目编号，对应于项目配置中的 pro.sn；
### 4.1 初始化任务
```
gulp init --pro gqkuandai
// or
gulp init --sn 2016-SN12
```
以上两个命令等效。  
执行的结果中，会对于项目的文件夹初始结构构建完成，并包含有相关的基础性代码。
```
src
  |-gqkuandai
    |-controller
      |-app.js
      |-base.js
view
  |-gqkuandai
    |-public
      |-block
        |-head_all.html
        |-head_wap.html
        |-head_web.html
      |-frame
    |-app_index.html
www
  |-static
    |-gqkuandai
      |-src
        |-css
          |-src
            |-...
        |-js
          |-comm.js
        |-lib
          |-...
```
### 4.2 项目监控任务
```
npm default --pro xxxx
// or 
npm --pro xxxx
// or
npm default --sn xxxx
// or 
npm --sn xxxx
```
用于监控项目开发过程中，项目代码的变动，实现实时编译、刷新及浏览器同步，浏览器的同步服务端口号为：3000

### 4.3 项目编译任务
```
npm make --pro xxxx
// or
npm make --sn xxxx
```
用于编译开发过程中，模块化样式编写方式时，将各分文件合并，并解析其样式变量等。

### 4.4 项目发布任务
```
npm dist --pro xxxx
// or 
npm dist --sn xxxx
```
当项目开发完成后，我们模块化开发方式的各文件通过编译及解析，并将相关文件统一打包为ZIP文件，完整输出静态文件，以此来规避发布过程中的犯错机率，以及分发时的方便性快捷性。

### 4.5 项目归档任务
```
npm archive --pro xxxx
// or
npm archive --sn xxxx
```
在IDE开发工具中，因各项目不断积累，导致IDE工具建立索引过多，而导致工具变慢，归档操作是将相关的项目源码归档到可以设置为忽略建索引的目录（本项目是设置位置为：./archive）。

### 4.6 项目重加载任务
```
npm reload --pro xxxx
// or
npm reload --sn xxxx
```
这是归档任务的反操作，当我们将某一项目归档处理后，可能后期的某个时间点，我们仍需要处理这个项目，但当前的项目文件已被归档，开发IDE对于它已不工作，因此，这里通过这个任务，重新将已归档的任务重新加载到环境中。


