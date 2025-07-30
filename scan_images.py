#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片扫描器 - 专为CI/CD设计
自动扫描项目目录中的图片文件并生成JSON数据
"""

import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
import mimetypes

class ImageScanner:
    def __init__(self, project_dir="."):
        self.project_dir = Path(project_dir)
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif'}
        self.images_data_file = self.project_dir / "images_data.json"
        
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
            
            return {
                'name': file_path.name,
                'path': str(file_path.relative_to(self.project_dir)),
                'size': size_str,
                'size_bytes': size_bytes,
                'modified_time': modified_time.isoformat(),
                'modified_date': modified_time.strftime('%Y-%m-%d %H:%M'),
                'hash': file_hash,
                'mime_type': mime_type or 'image/jpeg'
            }
        except Exception as e:
            print(f"处理文件 {file_path} 时出错: {e}")
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
            
            self.save_images_data(images)
            return images
        else:
            print("未找到任何图片文件")
            return []

def main():
    """主函数"""
    scanner = ImageScanner()
    
    print("=== 图片扫描器 ===")
    print("正在扫描项目目录中的图片文件...")
    
    images = scanner.update_images_data()
    
    if images:
        print(f"\n扫描完成！共找到 {len(images)} 张图片")
        print("图片数据已保存到 images_data.json")
        print("\n网站将自动更新显示最新图片。")
    else:
        print("\n未找到任何图片文件。")
        print("请确保项目目录中包含以下格式的图片文件：")
        print("  - .jpg, .jpeg, .png, .gif, .webp, .bmp, .tiff, .tif")

if __name__ == "__main__":
    main() 