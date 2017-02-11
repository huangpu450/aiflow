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
    |-config
      |-data.js
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
gulp default --pro xxxx
// or 
gulp --pro xxxx
// or
gulp default --sn xxxx
// or 
gulp --sn xxxx
```
用于监控项目开发过程中，项目代码的变动，实现实时编译、刷新及浏览器同步，浏览器的同步服务端口号为：3000

### 4.3 项目编译任务
```
gulp make --pro xxxx
// or
gulp make --sn xxxx
```
用于编译开发过程中，模块化样式编写方式时，将各分文件合并，并解析其样式变量等。

### 4.4 项目发布任务
```
gulp dist --pro xxxx
// or 
gulp dist --sn xxxx
```
当项目开发完成后，我们模块化开发方式的各文件通过编译及解析，并将相关文件统一打包为ZIP文件，完整输出静态文件，以此来规避发布过程中的犯错机率，以及分发时的方便性快捷性。

### 4.5 项目归档任务
```
gulp archive --pro xxxx
// or
gulp archive --sn xxxx
```
在IDE开发工具中，因各项目不断积累，导致IDE工具建立索引过多，而导致工具变慢，归档操作是将相关的项目源码归档到可以设置为忽略建索引的目录（本项目是设置位置为：./archive）。

### 4.6 项目重加载任务
```
gulp reload --pro xxxx
// or
gulp reload --sn xxxx
```
这是归档任务的反操作，当我们将某一项目归档处理后，可能后期的某个时间点，我们仍需要处理这个项目，但当前的项目文件已被归档，开发IDE对于它已不工作，因此，这里通过这个任务，重新将已归档的任务重新加载到环境中。

### 4.7 项目删除任务
```
gulp delpro --pro xxxx
// or
gulp delpro --sn xxxx
```
用于删除某一个项目源码。  
本操作需要非常小心，除非十分明确，本项目的源码已不再需要，否则请不要执行本任务。本操作的执行结果，会彻底清空该项目的源码，清除后，无法恢复。  
当不太确定是否还需要该项目的源码存在于IDE中时，但又不想该项目的相关代码对自己当前工作产生干扰，此种情况下，最好选择归档操作。

### 4.8 自动化构建工具源码发布任务
```
gulp release
```
此时，任务会将当前自动化构建工具源码执行编译打包源码，并使用package.json中的相关配置信息生成相关的版本号等信息命名格式的发布文件。  
发布所在的目录路径为：   
```
releases/0.0.x/*
releases/aiui-frame-0.0.x-2016xxxxxxxxxx.zip
```

## 5. 项目开发流程
在所有工具提供出来后，所给出的最为重要的是一种解决问题的思路。  
在本工具中，在开发项目过程中设计了一种大体的任务流程。  
流程为：  
---
1. 确定项目基本信息，并配置好相关项目信息配置文件；
2. 执行项目初始化任务，初始化自动生成相关项目目录结构及初始化文件；
3. 分析项目页面组成，及各页面相关的数据配置；
4. 项目开发及调试；
5. 开发完成，打包及发布；
---
以下将以陕西客户关怀项目为例，实例讲解使用过程
### 5.1 项目信息确定及配置
项目信息为：
```
项目编号： 2016-SN03
项目名称： sxwt
项目标题： 陕西网厅客户关怀平台
项目类型： web
针对设备： pc
项目日期： 2016-09-18
rem单元： 20
SVN地址： 
...

```
项目配置文件路径：
```
src/common/config/aipro.js
```
配置信息
```
'pro': [
  {
    sn: '2016-SN03',
    name: 'sxwt',
    title: '陕西网厅客户关怀平台',
    type: 'web',
    dev: 'pc',
    date: '2016-09-18',
    remUnit: 20,
    svn: ''
  }, ...
]
```
### 5.2 项目初始化
在项目根目录下执行
```
gulp init --pro sxwt
// or
gulp init --sn 2016-SN03
```

### 5.3 分析面组成

首页： index  
福利页： fuli

配置文件路径：
```
src/sxwt/config/data.js
```
配置文件内容：
```
'pages': {
    index: {
        action: 'index',
        title: '陕西网厅首页',
        data: {
            'curr': 'index',
            'userInfo': {
                name: '星空',
                avatar: '/images/avatar_1.png',
                level: 6,
                levelName: '高手',
                levelImg: '/images/level_06.png',
                eNum: 388,
                curIntegral: 3001,
                nextLevelIntegral: 4000
            },
            'duihuanList': [
                {
                    img: '/images/i_p_001.png',
                    title: '10元话费',
                    btText: '10E币兑换',
                    validDate: '2016-09-19至2016-09-30',
                    zhekou: '9.5折',
                    count: '4582'
                }, ...
            ]
        }
    },
    fuli: {
        action: 'fuli',
        title: '陕西网厅E币福利',
        data: {
            'curr': 'fuli'
        }
    }
}

// action 和 title 属性为必须，并且 action 与当前页面名称保持一致。
// 其中的 data 属性为用户随意依需求定义，只需要语法正确即可。

```

### 5.4 项目开发及调试

相关的任务
```
// 控监任务 
gulp --pro sxwt
```

固有变量说明：
```
// 用于定义项目的所有静态资源路径的前缀，该变量只出现在 HTML 文档中
{{proUrl}}
// 如下图片的输出写法
<img src="{{proUrl}}/images/banner.png"/>

// 用于指定项目的页面访问链接前缀，只与我们定义的各页面链接相关，如 index.html or fuli.html
{{proUri}}
// 如下导航栏上的链接写法
<li class="app-index"><a href="{{proUri}}/index.html">首页</a></li>
```

页面文件新建路径为：
```
view/sxwt/xxx.html
```

页面的命名规范为：
```
// 以字母开头，字母、数字及下划线组成
// 以 app_ 为前缀
// 命名取配置文件中的名称，如首页的命名为：
app_index.html
// 福利页面的命名为：
app_fuli.html
```

项目所有的静态资源存放位置：
```
// 根目录
www/static/sxwt/src/
// 图片
www/static/sxwt/src/images/
// css
www/static/sxwt/src/css/src/main.css
// js
www/static/sxwt/js/comm.js
// 公用库，如：jquery等
www/static/sxwt/lib/
```

更为详细的语法，可以参考 [thinkjs](https://thinkjs.org/zh-cn/doc/index.html) 的官方文档，包括其中的模块化写法，以及各模板变量的语法格式等。

### 5.5 项目打包发布

当项目代码编写开发完成后，相应的模块化开发的代码编译合并打包整体发布
```
gulp dist --pro sxwt
```

发布的文件路径为：
```
www/static/sxwt/dist
// 压缩文件
www/static/sxwt/dist/2016-SN03.陕西网厅客户关怀平台-20161102104558.zip
```






