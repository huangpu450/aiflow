#亚信UED前端流程自动化构建工具
Tags: aiflow 亚信 gulp

------------------
项目由亚信CMC UED团队创建，用于解决前端项目构建的流程管理，以及复杂度问题解决。

[TOC]

## 1. 项目初始化，安装相关依赖

```bash
npm install
```

## 2. 启动服务

```bash
npm start
```

## 3. 相关配置说明
### 3.1 服务端口
配置文件路径：  
src/common/config/config.js
```js
export default {
    port: 1234
}
```
框架默认的端口号为：1234  
服务启动后，即可通过: [localhost:1234](http://localhost:1234) 访问

### 3.2 项目配置
路径：  
// 系统初始项目配置  
src/common/config/initpro.js  
// 以 aipro 为前缀命名  
src/common/config/aiproxxxx.js  
// 如：  
src/common/config/aipro_liyz.js  
...
```js
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
            // 展示平台为 phone 时， 单位 px 转 rem 时的换算单位。
            // 当展示为 phone 外的其他值时，不考虑该配置值。
            // 取值以设计稿的最大宽度为依据，分为10份，
            // 取其中一份为 remUnit 值。
            // 如设计稿最大宽度为 750px，此只 remUnit 的配置值为： 750 / 10 = 75
            remUnit: 75,
            // less\css\sass\postcss
            // 当前仍只支持前两种
            compileCss: 'less',
            // SVN地址
            svn: ''
        },
        //...
    ]
}
```
多个项目，以数组方式配置在这个数组中。

## 4. 相关任务流程
任务参数包括：  
pro  指定任务所对应的项目名称，对应于项目配置中的 pro.name；  
sn   指定任务所对应的项目编号，对应于项目配置中的 pro.sn；
### 4.1 初始化任务
```bash
gulp init --pro gqkuandai
# or
gulp init --sn 2016-SN12
```
以上两个命令等效。  
执行的结果中，会对于项目的文件夹初始结构构建完成，并包含有相关的基础性代码。
```text
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
          |-less
            |-...
          |-src
            |-...
        |-images
          |-...
        |-js
          |-comm.js
        |-lib
          |-...
```
### 4.2 项目监控任务
```bash
gulp default --pro xxxx
# or 
gulp --pro xxxx
# or
gulp default --sn xxxx
# or 
gulp --sn xxxx
```
用于监控项目开发过程中，项目代码的变动，实现实时编译、刷新及浏览器同步，浏览器的同步服务端口号为：3000

### 4.3 项目编译任务
```bash
gulp make --pro xxxx
# or
gulp make --sn xxxx
```
用于编译开发过程中，模块化样式编写方式时，将各分文件合并，并解析其样式变量等。

### 4.4 项目发布任务
```bash
gulp dist --pro xxxx
# or 
gulp dist --sn xxxx
```
当项目开发完成后，我们模块化开发方式的各文件通过编译及解析，并将相关文件统一打包为ZIP文件，完整输出静态文件，以此来规避发布过程中的犯错机率，以及分发时的方便性快捷性。

### 4.5 项目归档任务
```bash
gulp archive --pro xxxx
# or
gulp archive --sn xxxx
```
在IDE开发工具中，因各项目不断积累，导致IDE工具建立索引过多，而导致工具变慢，归档操作是将相关的项目源码归档到可以设置为忽略建索引的目录（本项目是设置位置为：./archive）。   
项目归档后，我们可以将原项目开发目录删除，减少IDE在索引计算上的开销，以此来提升IDE的响应速度。  
为了快速完成该动作，插件中支持了一个快速操作的任务： archive:del，该任务执行的操作是，将项目源码归档到 archive 目录后，再将原开发目录中的相关内容删除。（请慎重使用该任务）
```bash
gulp archive:del --pro xxxx
# or
gulp archive:del --sn xxxx
```

### 4.6 项目重加载任务
```bash
gulp reload --pro xxxx
# or
gulp reload --sn xxxx
```
这是归档任务的反操作，当我们将某一项目归档处理后，可能后期的某个时间点，我们仍需要处理这个项目，但当前的项目文件已被归档，开发IDE对于它已不工作，因此，这里通过这个任务，重新将已归档的任务重新加载到环境中。

### 4.7 项目删除任务
```bash
gulp delpro --pro xxxx
# or
gulp delpro --sn xxxx
```
用于删除某一个项目源码。  
本操作需要非常小心，除非十分明确，本项目的源码已不再需要，否则请不要执行本任务。本操作的执行结果，会彻底清空该项目的源码，清除后，无法恢复。  
当不太确定是否还需要该项目的源码存在于IDE中时，但又不想该项目的相关代码对自己当前工作产生干扰，此种情况下，最好选择归档操作。

### 4.8 自动化构建工具源码发布任务
```bash
gulp release
```
此时，任务会将当前自动化构建工具源码执行编译打包源码，并使用package.json中的相关配置信息生成相关的版本号等信息命名格式的发布文件。  
发布所在的目录路径为：   
```text
releases/0.0.x/*
releases/aiui-frame-0.0.x-2016xxxxxxxxxx.zip
```

### 4.9 项目列表任务
```bash
gulp list
```
当整体的项目工程中，任务配置数量经积累较多后，整个工程中的项目会很多，在某个时候我们有可能需要查看工程中所有的项目信息，这时，可以通过该任务查看工程中的项目列表信息。

如：
```text
gulp list
[00:43:54] Requiring external module babel-register
[00:43:54] Working directory changed to C:\project\aiui_dev
==================================================================
-- 项目列表
[00:43:56] Using gulpfile C:\project\aiui_dev\gulpfile.babel.js
[00:43:57] Starting 'list'...
------------------------------------------------------------------
-- 框架初始化样例项目 项目信息
------------------------------------------------------------------
Project title:: 框架初始化样例项目
Project SN:: 2016-PI001
Project Name:: init
Surport Device Type:: pc
------------------------------------------------------------------

------------------------------------------------------------------
-- 陕西网厅客户关怀平台 项目信息
------------------------------------------------------------------
Project title:: 陕西网厅客户关怀平台
Project SN:: 2016-SN03
Project Name:: sxwt
Surport Device Type:: pc
------------------------------------------------------------------

[00:43:57] Finished 'list' after 11 ms
```
以上是 list 任务的一个完整输出的实例。

### 4.10 某项目包含页面列表任务
```bash
gulp listpages
```
用于列出某一项目中，包含的所有页面配置信息。
```text
gulp listpages --pro sxwt
[00:56:42] Requiring external module babel-register
[00:56:42] Working directory changed to C:\project\aiui_dev
==================================================================
-- sxwt 项目包含页面列表
------------------------------------------------------------------
-- Gulp task params
------------------------------------------------------------------
Project title:: 陕西网厅客户关怀平台
Project SN:: 2016-SN03
Project Name:: sxwt
Device Type:: pc
------------------------------------------------------------------
[00:56:45] Using gulpfile C:\project\aiui_dev\gulpfile.babel.js
[00:56:45] Starting 'listpages'...
------------------------------------------------------------------
-- 陕西网厅客户关怀平台 项目页面信息
------------------------------------------------------------------
--
-- Page title:: 陕西网厅首页
-- Page file name:: index.html
--
------------------------------------------------------------------
------------------------------------------------------------------
--
-- Page title:: 陕西网厅E币福利
-- Page file name:: fuli.html
--
------------------------------------------------------------------
[00:56:45] Finished 'listpages' after 176 ms
```
从以上实例可以看到，当前项目中包含两个页面：index.html  fuli.html

### 4.11 项目信息搜索任务
```bash
gulp search --key xxxx
```

本任务用于在项目列表搜索包含相应关键词的项目。
其中的关键词可以指向的搜索范围是：
项目标题、项目序列号、项目名称

如：
```text
gulp search --key 陕西
[01:00:38] Requiring external module babel-register
[01:00:38] Working directory changed to C:\project\aiui_dev
==================================================================
-- 搜索项目
[01:00:41] Using gulpfile C:\project\aiui_dev\gulpfile.babel.js
[01:00:41] Starting 'search'...
-- 搜索关键词为:: 陕西

------------------------------------------------------------------
-- 陕西网厅客户关怀平台 项目信息
------------------------------------------------------------------
Project title:: 陕西网厅客户关怀平台
Project SN:: 2016-SN03
Project Name:: sxwt
Surport Device Type:: pc
------------------------------------------------------------------

[01:00:41] Finished 'search' after 3.83 ms
```
以上为一个搜索关键词为：陕西，的项目搜索命令实例。


## 5. 项目开发流程
在所有工具提供出来后，所给出的最为重要的是一种解决问题的思路。  
在本工具中，在开发项目过程中设计了一种大体的任务流程。  

**流程为：**  

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
```text
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
```bash
src/common/config/aipro_liyz.js
```

配置信息
```js
export default {
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
      }, 
      //...
    ]
}
```
### 5.2 项目初始化
在项目根目录下执行
```bash
gulp init --pro sxwt
# or
gulp init --sn 2016-SN03
```

### 5.3 分析面组成

首页： index  
福利页： fuli

配置文件路径：
```bash
src/sxwt/config/data.js
```

配置文件内容：
```js
export default {
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
                    }, 
                    //...
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
}
// action 和 title 属性为必须，并且 action 与当前页面名称保持一致。
// 其中的 data 属性为用户随意依需求定义，只需要语法正确即可。

```

### 5.4 项目开发及调试

相关的任务
```bash
# 控监任务 
gulp --pro sxwt
```

固有变量说明：
```html
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
```bash
view/sxwt/xxx.html
```

页面的命名规范为：
```bash
# 以字母开头，字母、数字及下划线组成
# 以 app_ 为前缀
# 命名取配置文件中的名称，如首页的命名为：
app_index.html
# 福利页面的命名为：
app_fuli.html
```

项目所有的静态资源存放位置：
```bash
# 根目录
www/static/sxwt/src/
# 图片
www/static/sxwt/src/images/
# css
www/static/sxwt/src/css/src/main.css
# js
www/static/sxwt/js/comm.js
# 公用库，如：jquery等
www/static/sxwt/lib/
```

更为详细的语法，可以参考 [thinkjs](https://thinkjs.org/zh-cn/doc/index.html) 的官方文档，包括其中的模块化写法，以及各模板变量的语法格式等。

### 5.5 项目打包发布

当项目代码编写开发完成后，相应的模块化开发的代码编译合并打包整体发布
```bash
gulp dist --pro sxwt
```

发布的文件路径为：
```bash
www/static/sxwt/dist
# 压缩文件
www/static/sxwt/dist/2016-SN03.陕西网厅客户关怀平台-20161102104558.zip
```

### 5.6 工具自动升级
当在开发过程中，发现在MAC类系统中，当解压文件到某个目录时，发现如若原来目录下不为空时，目录内的相关文件的默认操作不是合并，还是直接覆盖，这样会导致原有文件丢失。  
在这种情况下，我考虑到将软件的升级定义成一个自动化或是半自动化的过程。  
操作过程：  
1. 将最版本升级包（zip）下载到项目目录中的： releases ，目录。
2. 运行以下命令
```bash
gulp update
```
3. 运行结果类似如下内容
```text
C:\project\aiflow (master) (aiui-automation-workflow@0.0.8)
λ gulp update
[14:30:02] Requiring external module babel-register
==================================================================
-- 软件升级
[14:30:06] Using gulpfile C:\project\aiflow\gulpfile.babel.js
[14:30:06] Starting 'update'...
-- 当前版本号:: 0.0.8
-- 当前版本发布日期:: 20170215161606
--
-- 当前版本已是最新，无需升级！
------------------------------------------------------------------
[14:30:06] Finished 'update' after 11 ms

```





