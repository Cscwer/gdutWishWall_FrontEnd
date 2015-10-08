# gdutWishWall_FrontEnd
广工大许愿墙前端部分

# 环境要求
* node > 0.12
* gulp
* bower

# 使用说明
1. 进入项目根目录，运行 `npm install` 和 `bower install`。
2. 运行 `gulp server`，进行本地开发调试。
3. 运行 `gulp build`，生成上线代码到 `dist/` 目录。

# 目录结构说明
```
|
+- app               // 开发目录
|   +- index.html    // 入口文件
|   +- components    // 项目依赖，引入的其它库或框架
|   +- js
|   +- less
|   +- css
|   +- views
|   +- images
+- dist              // 产出目录
|   +- index.html
|   +- public
|       +- stylesheets
|       +- scripts
|       +- images
|   +- views
|    
```

# 项目中引入依赖
在 `index.html` 直接引入 `components/**/*.js` 或 `components/**/*.css` 即可。