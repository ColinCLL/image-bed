#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图片压缩工具
为摄影师优化图片大小，提高上传和加载速度
"""

import os
import sys
from pathlib import Path
from PIL import Image
import argparse

class ImageCompressor:
    def __init__(self, quality=85, max_width=1920, max_height=1080):
        self.quality = quality
        self.max_width = max_width
        self.max_height = max_height
        
    def compress_image(self, input_path, output_path=None):
        """压缩单张图片"""
        try:
            with Image.open(input_path) as img:
                # 获取原始尺寸
                original_size = os.path.getsize(input_path)
                original_width, original_height = img.size
                
                # 转换颜色模式
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # 调整尺寸（保持比例）
                if original_width > self.max_width or original_height > self.max_height:
                    img.thumbnail((self.max_width, self.max_height), Image.Resampling.LANCZOS)
                
                # 确定输出路径
                if output_path is None:
                    output_path = input_path
                
                # 保存压缩后的图片
                img.save(output_path, 'JPEG', quality=self.quality, optimize=True)
                
                # 获取压缩后大小
                compressed_size = os.path.getsize(output_path)
                compression_ratio = (1 - compressed_size / original_size) * 100
                
                print(f"✅ {input_path.name}")
                print(f"   原始: {original_width}×{original_height}, {self.format_size(original_size)}")
                print(f"   压缩: {img.size[0]}×{img.size[1]}, {self.format_size(compressed_size)}")
                print(f"   压缩率: {compression_ratio:.1f}%")
                print()
                
                return {
                    'original_size': original_size,
                    'compressed_size': compressed_size,
                    'compression_ratio': compression_ratio
                }
                
        except Exception as e:
            print(f"❌ 压缩失败 {input_path}: {e}")
            return None
    
    def compress_directory(self, input_dir, output_dir=None):
        """压缩目录中的所有图片"""
        input_path = Path(input_dir)
        if output_dir:
            output_path = Path(output_dir)
            output_path.mkdir(exist_ok=True)
        else:
            output_path = None
        
        # 支持的图片格式
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
        
        # 查找所有图片文件
        image_files = []
        for ext in image_extensions:
            image_files.extend(input_path.glob(f"*{ext}"))
            image_files.extend(input_path.glob(f"*{ext.upper()}"))
        
        if not image_files:
            print("❌ 未找到图片文件")
            return
        
        print(f"📁 找到 {len(image_files)} 张图片")
        print("=" * 50)
        
        total_original = 0
        total_compressed = 0
        success_count = 0
        
        for image_file in image_files:
            if output_path:
                output_file = output_path / image_file.name
            else:
                output_file = image_file
            
            result = self.compress_image(image_file, output_file)
            if result:
                total_original += result['original_size']
                total_compressed += result['compressed_size']
                success_count += 1
        
        # 显示总结
        print("=" * 50)
        print(f"📊 压缩完成: {success_count}/{len(image_files)} 张图片")
        print(f"💾 总大小: {self.format_size(total_original)} → {self.format_size(total_compressed)}")
        print(f"📉 总体压缩率: {(1 - total_compressed / total_original) * 100:.1f}%")
        
        # 建议
        if total_compressed > 500 * 1024 * 1024:  # 500MB
            print("\n⚠️  建议:")
            print("   - 考虑分批上传（每次50-80张）")
            print("   - 可以进一步降低quality参数")
            print("   - 或减小max_width/max_height参数")
    
    def format_size(self, size_bytes):
        """格式化文件大小显示"""
        if size_bytes == 0:
            return "0B"
        size_names = ["B", "KB", "MB", "GB"]
        i = 0
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        return f"{size_bytes:.1f}{size_names[i]}"

def main():
    parser = argparse.ArgumentParser(description='图片压缩工具')
    parser.add_argument('input', help='输入目录或文件路径')
    parser.add_argument('-o', '--output', help='输出目录（可选，默认覆盖原文件）')
    parser.add_argument('-q', '--quality', type=int, default=85, help='JPEG质量 (1-100, 默认85)')
    parser.add_argument('--max-width', type=int, default=1920, help='最大宽度 (默认1920)')
    parser.add_argument('--max-height', type=int, default=1080, help='最大高度 (默认1080)')
    
    args = parser.parse_args()
    
    # 检查输入路径
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"❌ 路径不存在: {args.input}")
        sys.exit(1)
    
    # 创建压缩器
    compressor = ImageCompressor(
        quality=args.quality,
        max_width=args.max_width,
        max_height=args.max_height
    )
    
    print(f"🔧 图片压缩工具")
    print(f"📁 输入: {args.input}")
    print(f"📁 输出: {args.output or '覆盖原文件'}")
    print(f"🎨 质量: {args.quality}")
    print(f"📐 最大尺寸: {args.max_width}×{args.max_height}")
    print("=" * 50)
    
    # 执行压缩
    if input_path.is_file():
        compressor.compress_image(input_path, args.output)
    else:
        compressor.compress_directory(input_path, args.output)

if __name__ == "__main__":
    main() 