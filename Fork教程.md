# 通过Fork实现图传服务器 - 完整教程

## 🎯 教程概述

本教程将指导您如何通过Fork这个项目来快速搭建自己的图传服务器，为模特提供专业的返图服务。

## 🚀 快速开始（5分钟搭建）

### 第一步：Fork项目

1. **访问项目页面**
   - 打开浏览器，访问：`https://github.com/ColinCLL/image-bed`
   - 点击右上角的 "Fork" 按钮
   - 选择您的GitHub账号
   - 等待Fork完成

2. **进入您的仓库**
   - Fork完成后，您会跳转到您的新仓库
   - 仓库名称格式：`https://github.com/您的用户名/image-bed`

### 第二步：启用GitHub Pages

1. **进入仓库设置**
   - 点击仓库页面的 "Settings" 标签
   - 在左侧菜单中找到 "Pages"

2. **配置Pages**
   - 在 "Source" 部分选择 "Deploy from a branch"
   - 在 "Branch" 下拉菜单中选择 "main"(如果没有main 分支，请创建一个main分支)
   - 点击 "Save"

3. **获取网站链接**
   - 等待几分钟后，GitHub会生成网站链接
   - 链接格式：`https://您的用户名.github.io/image-bed`

### 第三步：测试功能

1. **上传测试图片**
   - 在您的仓库页面点击 "Add file" → "Upload files"
   - 上传几张测试图片（支持jpg、png、gif等格式）
   - 填写提交信息，点击 "Commit changes"

2. **等待自动部署**
   - 系统会自动扫描图片
   - 生成缩略图和JSON数据
   - 更新网站内容

3. **访问网站**
   - 访问您的GitHub Pages链接
   - 查看图片是否正确显示

## 📋 详细配置步骤

### 1. 自定义网站信息

#### 修改网站标题
编辑 `index.html` 文件：

```html
<!-- 修改第6行 -->
<title>您的摄影工作室 - 作品展示</title>

<!-- 修改第12行 -->
<h1><i class="fas fa-camera"></i> 您的摄影工作室</h1>
<p>专业摄影服务 - 为模特提供高质量返图</p>
```

#### 修改颜色主题
编辑 `styles.css` 文件：

```css
/* 修改第8行，更换背景颜色 */
body {
    background: linear-gradient(135deg, #您的颜色1 0%, #您的颜色2 100%);
}
```

### 2. 配置GitHub Actions权限

1. **进入仓库设置**
   - 点击 "Settings" → "Actions" → "General"

2. **设置权限**
   - 在 "Workflow permissions" 中选择 "Read and write permissions"
   - 勾选 "Allow GitHub Actions to create and approve pull requests"
   - 点击 "Save"

### 3. 添加Personal Access Token（可选）

如果遇到权限问题，可以添加Personal Access Token：

1. **生成Token**
   - 进入GitHub设置 → "Developer settings" → "Personal access tokens"
   - 点击 "Generate new token (classic)"
   - 选择权限：`repo`, `workflow`
   - 生成并复制token

2. **添加Secret**
   - 进入仓库设置 → "Secrets and variables" → "Actions"
   - 点击 "New repository secret"
   - 名称：`PAT`
   - 值：刚才生成的token
   - 点击 "Add secret"

## 🔧 高级配置

### 1. 自定义图片格式

编辑 `scan_images.py` 文件：

```python
# 修改第15行，添加更多图片格式
self.image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.heic', '.avif'}
```

### 2. 调整缩略图设置

编辑 `scan_images.py` 文件：

```python
# 修改第147行，调整缩略图尺寸
def generate_thumbnail(self, file_path, max_size=(400, 400)):  # 改为400x400

# 修改第155行，调整图片质量
img.save(thumbnail_path, 'JPEG', quality=90, optimize=True)  # 改为90%
```

### 3. 添加自定义域名

1. **购买域名**（可选）
2. **配置DNS**
   - 添加CNAME记录指向：`您的用户名.github.io`
3. **设置自定义域名**
   - 进入仓库设置 → "Pages"
   - 在 "Custom domain" 中输入您的域名
   - 点击 "Save"

## 📱 使用方法

### 日常使用流程

1. **拍摄完成后**
   - 整理照片文件
   - 确保文件名有意义

2. **上传图片**
   - 进入您的GitHub仓库
   - 点击 "Add file" → "Upload files"
   - 拖拽或选择图片文件
   - 填写提交信息，如："添加新拍摄的照片"
   - 点击 "Commit changes"

3. **等待自动部署**
   - 系统会自动处理图片
   - 生成缩略图和更新数据
   - 1-5分钟后网站自动更新

4. **分享链接**
   - 将GitHub Pages链接发送给模特
   - 模特可以立即查看最新照片

### 网站功能

- **自动显示**：上传图片后自动显示
- **搜索功能**：快速查找特定图片
- **多种视图**：网格视图和列表视图
- **图片预览**：点击查看大图
- **下载功能**：支持直接下载原图
- **移动友好**：完美适配手机和电脑

## 🛠️ 故障排除

### 常见问题

#### 1. 网站无法访问
- 检查GitHub Pages是否已启用
- 确认仓库是否为公开
- 等待几分钟让部署完成

#### 2. 图片不显示
- 检查图片格式是否支持
- 确认图片文件已上传
- 查看GitHub Actions是否正常运行

#### 3. 自动更新失败
- 检查GitHub Actions权限设置
- 查看Actions页面的错误日志
- 确认推送到了main分支

### 调试步骤

1. **查看Actions日志**
   - 进入仓库页面
   - 点击 "Actions" 标签
   - 查看最新的工作流执行

2. **检查文件结构**
   - 确认 `images_data.json` 文件存在
   - 检查 `thumbnails/` 目录是否有文件

3. **手动触发**
   - 在Actions页面手动触发工作流
   - 查看详细的执行日志

## 🎯 最佳实践

### 1. 图片管理
- 使用有意义的文件名
- 避免中文和特殊字符
- 定期清理不需要的图片

### 2. 工作流程
- 每次拍摄后及时上传
- 使用清晰的提交信息
- 定期备份重要文件

### 3. 性能优化
- 压缩图片文件大小
- 使用合适的图片格式
- 避免上传过多图片

## 📊 项目优势

### 1. 完全免费
- GitHub Pages免费托管
- GitHub Actions免费使用
- 无需购买服务器

### 2. 高度自动化
- 零手动操作
- 实时更新
- 专业可靠

### 3. 易于使用
- 简单操作流程
- 详细中文文档
- 完善的错误处理

### 4. 功能完整
- 现代化界面
- 移动端优化
- 下载和预览功能

## 🔗 相关链接

- **项目地址**：https://github.com/ColinCLL/image-bed
- **GitHub Pages文档**：https://pages.github.com/
- **GitHub Actions文档**：https://docs.github.com/en/actions

## 📞 获取帮助

如果遇到问题：

1. **查看文档**：阅读项目中的详细说明
2. **检查日志**：查看GitHub Actions的执行日志
3. **搜索问题**：在GitHub Issues中搜索类似问题
4. **提交Issue**：如果问题仍然存在，可以提交Issue

---

**通过这个教程，您可以在5分钟内搭建一个专业的图传服务器，为您的摄影事业提供强大的技术支持！** 🎉 