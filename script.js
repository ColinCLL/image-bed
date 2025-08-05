// 全局变量
let allImages = [];
let currentImageIndex = 0;
let currentView = 'grid';

// 支持的图片格式
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeGallery();
    setupEventListeners();
});

// 初始化画廊
async function initializeGallery() {
    showLoading(true);
    
    try {
        // 扫描当前目录下的图片文件
        const images = await scanImages();
        allImages = images;
        
        if (images.length === 0) {
            showNoImagesMessage();
        } else {
            displayImages(images);
        }
    } catch (error) {
        console.error('加载图片时出错:', error);
        showErrorMessage('加载图片时出现错误，请刷新页面重试。');
    } finally {
        showLoading(false);
    }
}

// 扫描图片文件
async function scanImages() {
    try {
        // 尝试从JSON文件加载图片数据
        const response = await fetch('./images_data.json');
        if (response.ok) {
            const data = await response.json();
            return data.images.map(img => ({
                name: img.name,
                path: img.path,
                thumbnail: img.thumbnail,
                date: new Date(img.modified_time),
                size: img.size,
                modified_date: img.modified_date,
                width: img.width,
                height: img.height
            }));
        }
    } catch (error) {
        console.log('无法加载images_data.json，使用默认图片');
    }
    
    // 如果无法加载JSON文件，使用默认图片
    const defaultImages = [
        {
            name: '微信图片_20250331172746.jpg',
            path: './微信图片_20250331172746.jpg',
            date: new Date('2025-03-31'),
            size: '381KB'
        }
    ];
    
    return defaultImages;
}

// 显示图片
function displayImages(images) {
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = '';
    
    images.forEach((image, index) => {
        const imageItem = createImageItem(image, index);
        gallery.appendChild(imageItem);
    });
}

// 创建图片项
function createImageItem(image, index) {
    const item = document.createElement('div');
    item.className = 'image-item';
    item.dataset.index = index;
    
    const formattedDate = formatDate(image.date);
    
    // 修复缩略图路径
    let thumbnailSrc = image.path || ''; // 默认使用原图，确保不为undefined
    if (image.thumbnail) {
        // 确保缩略图路径正确处理
        thumbnailSrc = image.thumbnail.startsWith('./') ? image.thumbnail : './' + image.thumbnail;
        
        // 调试信息
        console.log('缩略图路径:', {
            original: image.thumbnail,
            processed: thumbnailSrc,
            imageName: image.name
        });
    } else if (!thumbnailSrc && image.path) {
        // 如果没有缩略图但有原图路径，则使用原图路径
        thumbnailSrc = image.path.startsWith('./') ? image.path : './' + image.path;
    }
    
    // 确保最终thumbnailSrc不为空
    if (!thumbnailSrc) {
        thumbnailSrc = 'data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23999%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E图片加载失败%3C%2Ftext%3E%3C%2Fsvg%3E';
    }
    
    item.innerHTML = `
        <img src="${thumbnailSrc}" alt="${image.name}" loading="lazy" data-full="${image.path || ''}" data-src="${thumbnailSrc}" onerror="this.onerror=null; this.src='data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23999%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E图片加载失败%3C%2Ftext%3E%3C%2Fsvg%3E';">
        <div class="image-info">
            <h3>${image.name || '未知图片'}</h3>
            <p>拍摄时间: ${formattedDate || '未知时间'}</p>
            <p>文件大小: ${image.size || '未知'}</p>
            ${image.width && image.height ? `<p>尺寸: ${image.width}×${image.height}</p>` : ''}
            <div class="image-actions">
                <button class="download-thumb-btn" title="下载图片">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        </div>
    `;
    
    // 添加图片加载错误处理
    const imgElement = item.querySelector('img');
    imgElement.addEventListener('error', function() {
        console.log('图片加载失败，使用默认图片:', image.name);
        // 当图片加载失败时，使用默认图片
        this.src = './wechat_2025-07-30_175627_470.png';
        // 如果默认图片也加载失败，则显示占位符
        this.onerror = function() {
            this.src = 'data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22200%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20fill%3D%22%23999%22%20font-size%3D%2220%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E图片加载失败%3C%2Ftext%3E%3C%2Fsvg%3E';
        };
    });
    
    // 添加点击事件
    item.addEventListener('click', (e) => {
        // 如果点击的是下载按钮，不打开模态框
        if (e.target.closest('.download-thumb-btn')) {
            e.stopPropagation();
            downloadImage(image);
            return;
        }
        openModal(index);
    });
    
    return item;
}

// 格式化日期
function formatDate(date) {
    if (!date) return '未知时间';
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return date.toLocaleDateString('zh-CN', options);
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // 视图切换
    const gridViewBtn = document.getElementById('gridView');
    const listViewBtn = document.getElementById('listView');
    
    gridViewBtn.addEventListener('click', () => switchView('grid'));
    listViewBtn.addEventListener('click', () => switchView('list'));
    
    // 模态框
    const modal = document.getElementById('imageModal');
    const closeBtn = modal.querySelector('.close');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    prevBtn.addEventListener('click', showPreviousImage);
    nextBtn.addEventListener('click', showNextImage);
    downloadBtn.addEventListener('click', downloadCurrentImage);
    
    // 键盘导航
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// 搜索处理
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const filteredImages = allImages.filter(image => 
        image.name.toLowerCase().includes(searchTerm)
    );
    
    displayImages(filteredImages);
}

// 视图切换
function switchView(view) {
    currentView = view;
    const gallery = document.getElementById('imageGallery');
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    
    if (view === 'list') {
        gallery.classList.add('list-view');
        gridBtn.classList.remove('active');
        listBtn.classList.add('active');
    } else {
        gallery.classList.remove('list-view');
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    }
}

// 打开模态框
function openModal(index) {
    currentImageIndex = index;
    const image = allImages[index];
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDate = document.getElementById('modalDate');
    
    modalImage.src = image.path;
    modalImage.alt = image.name;
    modalTitle.textContent = image.name;
    modalDate.textContent = `拍摄时间: ${formatDate(image.date)} | 文件大小: ${image.size}`;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    updateModalNavigation();
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 显示上一张图片
function showPreviousImage() {
    if (currentImageIndex > 0) {
        openModal(currentImageIndex - 1);
    }
}

// 显示下一张图片
function showNextImage() {
    if (currentImageIndex < allImages.length - 1) {
        openModal(currentImageIndex + 1);
    }
}

// 更新模态框导航按钮状态
function updateModalNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.style.display = currentImageIndex > 0 ? 'flex' : 'none';
    nextBtn.style.display = currentImageIndex < allImages.length - 1 ? 'flex' : 'none';
}

// 下载图片（通用函数）
function downloadImage(image) {
    if (!image) return;
    
    // 检测设备类型
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent);
    
    if (isWeChat) {
        // 微信内置浏览器：使用特殊处理
        downloadInWeChat(image);
    } else if (isMobile) {
        // 其他移动设备：使用移动设备方法
        downloadToMobileGallery(image);
    } else {
        // 桌面设备：使用传统下载方法
        downloadToDesktop(image);
    }
}

// 桌面设备下载
function downloadToDesktop(image) {
    const link = document.createElement('a');
    link.href = image.path;
    link.download = image.name;
    link.target = '_blank';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showDownloadSuccess(image.name);
}

// 移动设备保存到相册
function downloadToMobileGallery(image) {
    // 首先尝试使用Web Share API（iOS Safari支持）
    if (navigator.share) {
        fetch(image.path)
            .then(response => response.blob())
            .then(blob => {
                const file = new File([blob], image.name, { type: blob.type });
                navigator.share({
                    title: image.name,
                    files: [file]
                }).then(() => {
                    showDownloadSuccess(image.name);
                }).catch((error) => {
                    console.log('Web Share API失败，使用Canvas方法');
                    downloadWithCanvas(image);
                });
            })
            .catch(() => {
                downloadWithCanvas(image);
            });
    } else {
        // 如果不支持Web Share API，使用Canvas方法
        downloadWithCanvas(image);
    }
}

// 使用Canvas方法下载
function downloadWithCanvas(image) {
    // 首先尝试直接下载原图（避免Canvas压缩）
    try {
        fetch(image.path)
            .then(response => {
                if (response.ok) {
                    return response.blob();
                } else {
                    throw new Error('无法获取原图');
                }
            })
            .then(blob => {
                // 直接使用原图blob，不经过Canvas处理
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = image.name;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                showDownloadSuccess(image.name);
            })
            .catch(error => {
                console.log('直接下载失败，使用Canvas方法:', error);
                downloadWithCanvasFallback(image);
            });
    } catch (error) {
        console.log('Fetch方法失败，使用Canvas方法:', error);
        downloadWithCanvasFallback(image);
    }
}

// Canvas方法（兜底方案）
function downloadWithCanvasFallback(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 检测原图格式
        const originalFormat = getImageFormat(image.path);
        
        // 根据原图格式选择输出格式和质量
        let outputFormat = 'image/jpeg';
        let quality = 0.98; // 进一步提高质量
        
        if (originalFormat === 'png') {
            outputFormat = 'image/png';
            quality = 1.0; // PNG无损
        } else if (originalFormat === 'webp') {
            outputFormat = 'image/webp';
            quality = 0.98;
        }
        
        // 将canvas转换为blob，保持原图质量
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = image.name;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            showDownloadSuccess(image.name);
        }, outputFormat, quality);
    };
    
    img.onerror = function() {
        console.log('Canvas方法失败，使用传统下载方法');
        downloadToDesktop(image);
    };
    
    img.src = image.path;
}

// 微信内置浏览器下载处理
function downloadInWeChat(image) {
    // 微信内置浏览器限制较多，使用引导方式
    showWeChatDownloadGuide(image);
}

// 显示微信下载引导
function showWeChatDownloadGuide(image) {
    // 创建引导弹窗
    const guideModal = document.createElement('div');
    guideModal.className = 'wechat-guide-modal';
    guideModal.innerHTML = `
        <div class="wechat-guide-content">
            <div class="wechat-guide-header">
                <h3>📱 微信下载引导</h3>
                <button class="close-guide" onclick="closeWeChatGuide()">×</button>
            </div>
            <div class="wechat-guide-body">
                <p>由于微信内置浏览器限制，无法直接下载图片。</p>
                <p>可以查看原图，然后长按保存图片。</p>
                <p>或者请按以下步骤操作：</p>
                <ol>
                    <li>点击右上角"..."按钮</li>
                    <li>选择"在浏览器中打开"</li>
                    <li>在浏览器中重新访问此页面</li>
                    <li>然后点击下载按钮</li>
                </ol>
                <div class="wechat-guide-tips">
                    <p><strong>💡 提示：</strong></p>
                    <p>• 建议使用Safari（iOS）或Chrome（Android）</p>
                    <p>• 在浏览器中可以正常下载和保存图片</p>
                </div>
            </div>
            <div class="wechat-guide-footer">
                <button class="copy-link-btn" onclick="copyPageLink()">复制链接</button>
                <button class="close-guide-btn" onclick="closeWeChatGuide()">知道了</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(guideModal);
    
    // 添加样式
    if (!document.querySelector('#wechat-guide-styles')) {
        const style = document.createElement('style');
        style.id = 'wechat-guide-styles';
        style.textContent = `
            .wechat-guide-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .wechat-guide-content {
                background: white;
                border-radius: 15px;
                max-width: 90%;
                max-height: 80%;
                overflow-y: auto;
                padding: 0;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .wechat-guide-header {
                padding: 20px 20px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #eee;
            }
            .wechat-guide-header h3 {
                margin: 0;
                color: #333;
            }
            .close-guide {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
            }
            .wechat-guide-body {
                padding: 20px;
            }
            .wechat-guide-body p {
                margin: 10px 0;
                color: #666;
                line-height: 1.6;
            }
            .wechat-guide-body ol {
                margin: 15px 0;
                padding-left: 20px;
            }
            .wechat-guide-body li {
                margin: 8px 0;
                color: #666;
            }
            .wechat-guide-tips {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
            }
            .wechat-guide-tips p {
                margin: 5px 0;
                font-size: 14px;
            }
            .wechat-guide-footer {
                padding: 20px;
                display: flex;
                gap: 10px;
                border-top: 1px solid #eee;
            }
            .copy-link-btn, .close-guide-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            .copy-link-btn {
                background: #667eea;
                color: white;
            }
            .copy-link-btn:hover {
                background: #5a6fd8;
            }
            .close-guide-btn {
                background: #f8f9fa;
                color: #666;
            }
            .close-guide-btn:hover {
                background: #e9ecef;
            }
        `;
        document.head.appendChild(style);
    }
}

// 关闭微信引导
function closeWeChatGuide() {
    const guideModal = document.querySelector('.wechat-guide-modal');
    if (guideModal) {
        guideModal.remove();
    }
}

// 复制页面链接
function copyPageLink() {
    const url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showCopySuccess();
        });
    } else {
        // 兼容旧版本浏览器
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopySuccess();
    }
}

// 显示复制成功提示
function showCopySuccess() {
    const toast = document.createElement('div');
    toast.className = 'copy-success-toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>链接已复制到剪贴板！</span>
    `;
    
    // 添加样式
    if (!document.querySelector('#copy-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'copy-toast-styles';
        style.textContent = `
            .copy-success-toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #28a745;
                color: white;
                padding: 12px 20px;
                border-radius: 25px;
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 10001;
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
                animation: slideIn 0.3s ease;
            }
            @keyframes slideIn {
                from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                to { transform: translateX(-50%) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 检测图片格式
function getImageFormat(imagePath) {
    const extension = imagePath.split('.').pop().toLowerCase();
    switch (extension) {
        case 'png':
            return 'png';
        case 'webp':
            return 'webp';
        case 'gif':
            return 'gif';
        case 'bmp':
            return 'bmp';
        case 'jpg':
        case 'jpeg':
        default:
            return 'jpeg';
    }
}

// 下载当前图片
function downloadCurrentImage() {
    const image = allImages[currentImageIndex];
    downloadImage(image);
}

// 显示下载成功提示
function showDownloadSuccess(filename) {
    // 移除已存在的提示
    const existingToast = document.querySelector('.download-success');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 根据设备类型显示不同的提示
    let message = `${filename} 下载成功！`;
    if (isMobile) {
        message = `${filename} 已保存到相册！`;
    }
    
    // 创建新的提示
    const toast = document.createElement('div');
    toast.className = 'download-success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 键盘导航
function handleKeyboardNavigation(event) {
    const modal = document.getElementById('imageModal');
    
    if (modal.style.display === 'block') {
        switch (event.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                showPreviousImage();
                break;
            case 'ArrowRight':
                showNextImage();
                break;
            case 'd':
            case 'D':
                downloadCurrentImage();
                break;
        }
    }
}

// 显示加载状态
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (show) {
        loading.classList.add('show');
    } else {
        loading.classList.remove('show');
    }
}

// 显示无图片消息
function showNoImagesMessage() {
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #666;">
            <i class="fas fa-images" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
            <h3>暂无图片</h3>
            <p>请上传图片到项目目录中，刷新页面即可看到。</p>
        </div>
    `;
}

// 显示错误消息
function showErrorMessage(message) {
    const gallery = document.getElementById('imageGallery');
    gallery.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #d32f2f;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>加载失败</h3>
            <p>${message}</p>
        </div>
    `;
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 图片懒加载
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    // 如果没有需要懒加载的图片，直接返回
    if (images.length === 0) {
        return;
    }
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // 检查data-src是否存在且不为空
                if (img.dataset.src && img.dataset.src !== 'undefined') {
                    img.src = img.dataset.src;
                }
                // 移除lazy类名
                img.classList.remove('lazy');
                // 停止观察这个元素
                observer.unobserve(img);
            }
        });
    }, {
        // 配置观察选项
        rootMargin: '50px' // 提前50px加载
    });
    
    images.forEach(img => {
        // 确保图片元素存在再观察
        if (img) {
            imageObserver.observe(img);
        }
    });
}

// 在图片加载完成后设置懒加载
document.addEventListener('DOMContentLoaded', () => {
    // 延迟执行懒加载设置，确保DOM完全加载
    setTimeout(setupLazyLoading, 100);
}); 