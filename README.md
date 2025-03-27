# Alberta Unemployment Dashboard

交互式仪表板，用于可视化和探索阿尔伯塔省的失业率数据。

## 安装步骤

使用Tailwind CDN构建失业率仪表板项目步骤：

1. **创建基础React应用**
```bash
npx create-react-app canada-unemployment-dashboard
cd canada-unemployment-dashboard
npm install d3 recharts
```

2. **添加Tailwind CDN**
修改 `public/index.html`，在`<head>`标签中添加：
```html
<script src="https://cdn.tailwindcss.com"></script>
```

3. **创建Dashboard组件**
创建 `src/Dashboard.js` 文件：

4. **更新App.js**
修改 `src/App.js` 文件：

5. **运行项目**
```bash
npm start
```

主要特点:
- 使用Tailwind CDN避免复杂配置
- 简化组件结构，使用基础HTML元素
- 保留所有图表和数据分析功能
- 跨浏览器兼容性良好
- 自动从Statistics Canada. Labour force Survey API获取数据

项目结构:
- Unemployment rate in Alberta
- Unemployment rate by Province
- Unemployment rate by Industry
- Unemployment rate by Sex
- Unemployment rate by Age
- Unemployment rate by City
- Unemployment rate by Region
- Unemployment rate by Occupation
- Unemployment rate by Education

此解决方案简单高效，无需额外配置即可运行。

3. 下载数据文件：
   ```bash
   python download_alberta_data.py
   ```
   这将创建一个`data`目录并下载所有必要的JSON文件。

4. 确保`data`目录中的JSON文件可以被React应用访问：
   - 如果使用Create React App，将`data`目录移动到`public`目录中
   ```bash
   mkdir -p public/data
   cp data/*.json public/data/
   ```

5. 启动开发服务器：
   ```bash
   npm start
   ```

6. 访问：
   ```
   http://localhost:3000
   ```

## GitHub Pages 部署

项目包含自动化脚本用于简化 GitHub Pages 部署流程。

### 使用部署脚本

在 `scripts` 目录下的 `rebuild-gh-pages.sh` 脚本用于自动创建和部署 gh-pages 分支：

```bash
# 赋予脚本执行权限（仅需执行一次）
chmod +x scripts/rebuild-gh-pages.sh

# 运行部署脚本
./scripts/rebuild-gh-pages.sh
```

脚本将执行以下操作：
1. 保存当前分支状态
2. 检出 main 分支并更新
3. 删除现有的 gh-pages 分支（如果存在）
4. 创建新的 gh-pages 分支
5. 自动更新 package.json 配置 homepage 属性
6. 提交更改并推送到远程
7. 运行 npm run deploy 部署到 GitHub Pages
8. 返回到原始分支

使用此脚本可以避免手动处理本地开发与 GitHub Pages 部署之间的配置差异。

## 功能

- 查看阿尔伯塔省失业率趋势
- 与其他省份进行比较
- 按行业、性别、年龄和城市查看失业率数据
- 可自定义时间范围（1年、3年、5年、10年或全部数据）

## 数据来源

数据来自Statistics Canada. Labour force Survey (api.economicdata.alberta.ca)
