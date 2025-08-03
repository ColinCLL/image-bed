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
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = image.path;
    link.download = image.name;
    link.target = '_blank';
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 显示下载成功提示
    showDownloadSuccess(image.name);
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
    
    // 创建新的提示
    const toast = document.createElement('div');
    toast.className = 'download-success';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${filename} 下载成功！</span>
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