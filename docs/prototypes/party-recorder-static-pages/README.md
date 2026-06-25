# 聚会记录师浏览器静态页面组

生成命令：

```powershell
npm.cmd run build:static-pages
```

入口文件：

- `index.html`：全量页面总览和搜索入口
- `pages/*.html`：每个小程序页面的浏览器静态快照
- `assets/pages-data.json`：由源码抽取出的页面、文案、交互和跳转索引

覆盖范围：

- app.json 正式页面：21
- miniprogram/pages 历史或未注册页面：26
- 页面总数：47

说明：该目录是浏览器可打开的静态页面组，用于走查页面结构、文案、交互方法和跳转关系；它不替代微信小程序运行时，不连接 api.pomer.cn，也不会触碰 pomer.cn 官网。
