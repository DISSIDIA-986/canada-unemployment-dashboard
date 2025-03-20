# Alberta Unemployment Dashboard

交互式仪表板，用于可视化和探索阿尔伯塔省的失业率数据。

## 安装步骤

1. 克隆项目后，进入项目目录：
   ```bash
   cd alberta-dashboard
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

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

## 功能

- 查看阿尔伯塔省失业率趋势
- 与其他省份进行比较
- 按行业、性别、年龄和城市查看失业率数据
- 可自定义时间范围（1年、3年、5年、10年或全部数据）

## 数据来源

数据来自Alberta Economic Dashboard (api.economicdata.alberta.ca)
