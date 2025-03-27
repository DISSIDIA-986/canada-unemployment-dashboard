#!/bin/bash

# 保存当前分支名称以便后续恢复
CURRENT_BRANCH=$(git branch --show-current)

echo "Current branch: $CURRENT_BRANCH"
echo "Rebuilding gh-pages branch..."

# 确保 main 分支是最新的
git checkout main
git pull origin main

# 检查是否存在远程 gh-pages 分支，如果存在则删除
if git ls-remote --heads origin gh-pages | grep gh-pages > /dev/null; then
    echo "Removing existing gh-pages branch..."
    git push origin --delete gh-pages
fi

# 检查是否存在本地 gh-pages 分支，如果存在则删除
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "Removing local gh-pages branch..."
    git branch -D gh-pages
fi

# 从 main 创建新的 gh-pages 分支
echo "Creating new gh-pages branch from main..."
git checkout -b gh-pages

# 修改 package.json，添加 homepage 配置
echo "Updating package.json with homepage configuration..."
sed -i.bak 's/"name": "canada-unemployment-dashboard"/"homepage": "https:\/\/dissidia-986.github.io\/canada-unemployment-dashboard",\n  "name": "canada-unemployment-dashboard"/' package.json
rm package.json.bak

# 提交更改
echo "Committing changes..."
git add package.json
git commit -m "Add homepage configuration for GitHub Pages"

# 推送到远程仓库
echo "Pushing gh-pages branch to remote..."
git push -u origin gh-pages

# 部署到 GitHub Pages
echo "Deploying to GitHub Pages..."
npm run deploy

# 恢复到之前的分支
echo "Restoring to original branch: $CURRENT_BRANCH"
git checkout $CURRENT_BRANCH

echo "gh-pages branch rebuild and deployment completed."
