/**
 * 侧边栏管理器 - 处理侧边栏的折叠/展开和响应式行为
 */
class SidebarManager {
    constructor() {
        this.sidebar = null;
        this.toggleBtn = null;
        this.isCollapsed = false;
        this.isMobile = false;
        
        this.init();
    }

    init() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleBtn = document.getElementById('sidebar-toggle');
        
        if (!this.sidebar || !this.toggleBtn) {
            console.warn('Sidebar elements not found');
            return;
        }

        this.bindEvents();
        this.checkMobile();
        this.loadSavedState();
    }

    bindEvents() {
        // 折叠/展开按钮
        this.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });

        // 响应式检测
        window.addEventListener('resize', () => {
            this.checkMobile();
        });

        // 移动端点击外部关闭
        document.addEventListener('click', (e) => {
            if (this.isMobile && 
                this.sidebar.classList.contains('mobile-open') &&
                !this.sidebar.contains(e.target)) {
                this.closeMobile();
            }
        });

        // ESC键关闭移动端侧边栏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobile && 
                this.sidebar.classList.contains('mobile-open')) {
                this.closeMobile();
            }
        });
    }

    toggle() {
        if (this.isMobile) {
            this.toggleMobile();
        } else {
            this.toggleCollapse();
        }
    }

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.isCollapsed) {
            this.sidebar.classList.add('collapsed');
        } else {
            this.sidebar.classList.remove('collapsed');
        }

        // 保存状态到localStorage
        this.saveState();
        
        // 触发自定义事件
        this.dispatchEvent('sidebarToggle', { collapsed: this.isCollapsed });
    }

    toggleMobile() {
        const isOpen = this.sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobile();
        } else {
            this.openMobile();
        }
    }

    openMobile() {
        this.sidebar.classList.add('mobile-open');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
        
        this.dispatchEvent('sidebarMobileOpen');
    }

    closeMobile() {
        this.sidebar.classList.remove('mobile-open');
        document.body.style.overflow = '';
        
        this.dispatchEvent('sidebarMobileClose');
    }

    checkMobile() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            // 从移动端切换到桌面端
            if (!this.isMobile) {
                this.sidebar.classList.remove('mobile-open');
                document.body.style.overflow = '';
                
                // 恢复桌面端的折叠状态
                if (this.isCollapsed) {
                    this.sidebar.classList.add('collapsed');
                }
            } else {
                // 从桌面端切换到移动端
                this.sidebar.classList.remove('collapsed');
            }
        }
    }

    collapse() {
        if (!this.isMobile && !this.isCollapsed) {
            this.toggleCollapse();
        }
    }

    expand() {
        if (!this.isMobile && this.isCollapsed) {
            this.toggleCollapse();
        }
    }

    saveState() {
        try {
            localStorage.setItem('sidebar-collapsed', this.isCollapsed.toString());
        } catch (e) {
            console.warn('Failed to save sidebar state:', e);
        }
    }

    loadSavedState() {
        try {
            const saved = localStorage.getItem('sidebar-collapsed');
            if (saved !== null) {
                this.isCollapsed = saved === 'true';
                
                if (this.isCollapsed && !this.isMobile) {
                    this.sidebar.classList.add('collapsed');
                }
            }
        } catch (e) {
            console.warn('Failed to load sidebar state:', e);
        }
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true
        });
        this.sidebar.dispatchEvent(event);
    }

    // 公共API
    getState() {
        return {
            collapsed: this.isCollapsed,
            mobile: this.isMobile,
            mobileOpen: this.sidebar?.classList.contains('mobile-open') || false
        };
    }
}

// 创建全局实例
let sidebarManager = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    sidebarManager = new SidebarManager();
});

// 导出到全局作用域
window.SidebarManager = SidebarManager;
window.sidebarManager = sidebarManager;