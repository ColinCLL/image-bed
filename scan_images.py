#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高级图片扫描器 - 包含缩略图生成功能
专为GitHub Actions设计，自动生成缩略图以提升网站性能
"""

import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
import mimetypes

# 尝试导入Pillow，如果失败则使用简化版本
try:
    from PIL import Image
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False
    print("警告: Pillow未安装，将使用简化版本")

class AdvancedImageScanner:
    def __init__(self, project_dir="."):
        self.project_dir = Path(project_dir)
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'}
        self.images_data_file = self.project_dir / "images_data.json"
        self.thumbnails_dir = self.project_dir / "thumbnails"
        
        # 创建缩略图目录
        self.thumbnails_dir.mkdir(exist_ok=True)
        
    def scan_images(self):
        """扫描项目目录中的所有图片文件"""
        images = []
        
        for file_path in self.project_dir.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in self.image_extensions:
                # 跳过隐藏文件和系统文件
                if any(part.startswith('.') for part in file_path.parts):
                    continue
                    
                # 跳过GitHub Actions相关文件
                if '.github' in file_path.parts:
                    continue
                    
                # 跳过缩略图目录
                if self.thumbnails_dir in file_path.parents:
                    continue
                    
                image_info = self.get_image_info(file_path)
                if image_info:
                    images.append(image_info)
        
        # 按修改时间排序，最新的在前
        images.sort(key=lambda x: x['modified_time'], reverse=True)
        return images
    
    def get_image_info(self, file_path):
        """获取图片文件的详细信息"""
        try:
            stat = file_path.stat()
            
            # 计算文件大小
            size_bytes = stat.st_size
            size_str = self.format_file_size(size_bytes)
            
            # 获取修改时间
            modified_time = datetime.fromtimestamp(stat.st_mtime)
            
            # 计算文件哈希值（用于缓存）
            file_hash = self.calculate_file_hash(file_path)
            
            # 获取MIME类型
            mime_type, _ = mimetypes.guess_type(str(file_path))
            
            # 获取图片尺寸信息
            dimensions = self.get_image_dimensions(file_path)
            
            # 生成缩略图
            thumbnail_path = self.generate_thumbnail(file_path)
            
            return {
                'name': file_path.name,
                'path': str(file_path.relative_to(self.project_dir)),
                'thumbnail': str(thumbnail_path.relative_to(self.project_dir)) if thumbnail_path else None,
                'size': size_str,
                'size_bytes': size_bytes,
                'modified_time': modified_time.isoformat(),
                'modified_date': modified_time.strftime('%Y-%m-%d %H:%M'),
                'hash': file_hash,
                'mime_type': mime_type or 'image/jpeg',
                'width': dimensions.get('width'),
                'height': dimensions.get('height'),
                'aspect_ratio': dimensions.get('aspect_ratio')
            }
        except Exception as e:
            print(f"处理文件 {file_path} 时出错: {e}")
            return None
    
    def get_image_dimensions(self, file_path):
        """获取图片尺寸信息"""
        if PILLOW_AVAILABLE:
            try:
                with Image.open(file_path) as img:
                    width, height = img.size
                    aspect_ratio = round(width / height, 2) if height > 0 else 0
                    return {
                        'width': width,
                        'height': height,
                        'aspect_ratio': aspect_ratio
                    }
            except Exception as e:
                print(f"获取图片尺寸时出错 {file_path}: {e}")
                return {'width': None, 'height': None, 'aspect_ratio': None}
        else:
            # 简化版本 - 尝试从JPEG文件头读取尺寸
            try:
                with open(file_path, 'rb') as f:
                    if file_path.suffix.lower() in ['.jpg', '.jpeg']:
                        f.seek(2)
                        if f.read(2) == b'\xff\xd8':  # JPEG文件头
                            f.seek(2)
                            while True:
                                marker = f.read(2)
                                if not marker or marker[0] != 0xff:
                                    break
                                if marker[1] in [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]:
                                    f.read(1)  # 跳过长度字节
                                    height = int.from_bytes(f.read(2), 'big')
                                    width = int.from_bytes(f.read(2), 'big')
                                    aspect_ratio = round(width / height, 2) if height > 0 else 0
                                    return {
                                        'width': width,
                                        'height': height,
                                        'aspect_ratio': aspect_ratio
                                    }
                                else:
                                    length = int.from_bytes(f.read(2), 'big')
                                    f.read(length - 2)
                            f.seek(0)
                
                return {'width': None, 'height': None, 'aspect_ratio': None}
            except Exception as e:
                print(f"获取图片尺寸时出错 {file_path}: {e}")
                return {'width': None, 'height': None, 'aspect_ratio': None}
    
    def generate_thumbnail(self, file_path, max_size=(300, 300)):
        """生成缩略图"""
        if not PILLOW_AVAILABLE:
            print(f"跳过缩略图生成 {file_path.name} (Pillow未安装)")
            return None
            
        try:
            with Image.open(file_path) as img:
                # 转换为RGB模式（如果是RGBA）
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # 计算缩略图尺寸
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # 生成缩略图文件名
                thumbnail_name = f"thumb_{file_path.stem}.jpg"
                thumbnail_path = self.thumbnails_dir / thumbnail_name
                
                # 保存缩略图
                img.save(thumbnail_path, 'JPEG', quality=85, optimize=True)
                
                print(f"生成缩略图: {thumbnail_path}")
                return thumbnail_path
        except Exception as e:
            print(f"生成缩略图时出错 {file_path}: {e}")
            return None
    
    def calculate_file_hash(self, file_path):
        """计算文件的MD5哈希值"""
        hash_md5 = hashlib.md5()
        try:
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception:
            return ""
    
    def format_file_size(self, size_bytes):
        """格式化文件大小显示"""
        if size_bytes == 0:
            return "0B"
        
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f}{size_names[i]}"
    
    def save_images_data(self, images):
        """保存图片数据到JSON文件"""
        data = {
            'last_updated': datetime.now().isoformat(),
            'total_images': len(images),
            'total_size': sum(img['size_bytes'] for img in images),
            'images': images
        }
        
        try:
            with open(self.images_data_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"已保存 {len(images)} 张图片的信息到 {self.images_data_file}")
            
            # 计算总大小
            total_size = self.format_file_size(data['total_size'])
            print(f"总文件大小: {total_size}")
            
        except Exception as e:
            print(f"保存图片数据时出错: {e}")
    
    def update_images_data(self):
        """更新图片数据"""
        print("开始扫描图片文件...")
        images = self.scan_images()
        
        if images:
            print(f"找到 {len(images)} 张图片:")
            for img in images:
                print(f"  - {img['name']} ({img['size']})")
                if img['thumbnail']:
                    print(f"    缩略图: {img['thumbnail']}")
                if img['width'] and img['height']:
                    print(f"    尺寸: {img['width']}×{img['height']}")
            
            self.save_images_data(images)
            return images
        else:
            print("未找到任何图片文件")
            return []

def main():
    """主函数"""
    scanner = AdvancedImageScanner()
    
    print("=== 高级图片扫描器 ===")
    print("正在扫描项目目录中的图片文件...")
    
    if PILLOW_AVAILABLE:
        print("✓ Pillow已安装，将生成缩略图")
    else:
        print("⚠ Pillow未安装，使用简化版本")
    
    images = scanner.update_images_data()
    
    if images:
        print(f"\n扫描完成！共找到 {len(images)} 张图片")
        print("图片数据已保存到 images_data.json")
        if PILLOW_AVAILABLE:
            print("缩略图已生成到 thumbnails/ 目录")
        print("\n网站将自动更新显示最新图片。")
    else:
        print("\n未找到任何图片文件。")
        print("请确保项目目录中包含以下格式的图片文件：")
        print("  - .jpg, .jpeg, .png, .gif, .webp, .bmp, .tiff, .tif")

if __name__ == "__main__":
    main() 