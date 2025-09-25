/**
 * 主应用程序 - 整合所有模块
 */
class App {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        
        this.init();
    }

    /**
     * 初始化应用程序
     */
    async init() {
        try {
            // 显示加载状态
            this.showLoadingState();
            
            // 初始化数据管理器
            await this.initDataManager();
            
            // 初始化路由
            await this.initRouter();
            
            // 初始化各个功能模块
            await this.initModules();
            
            // 绑定全局事件
            this.bindGlobalEvents();
            
            // 设置主题
            this.initTheme();
            
            // 初始化AI功能
            if (window.aiManager) {
                console.log('AI功能已启用');
            }
            
            // 初始化待办事项管理器
        if (window.todoManager) {
            console.log('待办事项管理器已初始化');
        } else {
            console.warn('待办事项管理器未找到');
        }

        // 初始化对话管理器
        if (window.chatManager) {
            console.log('对话管理器已初始化');
        } else {
            console.warn('对话管理器未找到');
        }

        // 初始化番茄钟管理器
        if (window.pomodoroManager) {
            console.log('番茄钟管理器已初始化');
        } else {
            console.warn('番茄钟管理器未找到');
        }

        // 初始化项目管理器
        if (window.projectManager) {
            console.log('项目管理器已初始化');
        } else {
            console.warn('项目管理器未找到');
        }
            
            // 隐藏加载状态
            this.hideLoadingState();
            
            this.isInitialized = true;
            
            console.log('智能笔记应用初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showErrorState(error);
        }
    }

    /**
     * 初始化数据管理器
     */
    async initDataManager() {
        if (window.dataManager) {
            this.modules.dataManager = window.dataManager;
            console.log('数据管理器已初始化');
        } else {
            throw new Error('数据管理器未找到');
        }
    }

    /**
     * 初始化路由
     */
    async initRouter() {
        if (window.router) {
            this.modules.router = window.router;
            console.log('路由管理器已初始化');
        } else {
            throw new Error('路由管理器未找到');
        }
    }

    /**
     * 初始化各个功能模块
     */
    async initModules() {
        // 初始化笔记管理器
        if (window.notesManager) {
            this.modules.notesManager = window.notesManager;
            console.log('笔记管理器已初始化');
        }
        
        // 初始化其他模块（待实现）
        // this.modules.todosManager = window.todosManager;
        // this.modules.chatManager = window.chatManager;
        // this.modules.timerManager = window.timerManager;
        // this.modules.projectsManager = window.projectsManager;
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 窗口大小改变
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // 页面可见性改变
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // 页面卸载前保存数据
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // 键盘快捷键
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
        
        // 错误处理
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
        
        // 页面切换事件
        window.addEventListener('pageChanged', this.handlePageChanged.bind(this));
    }

    /**
     * 处理窗口大小改变
     */
    handleResize() {
        // 更新布局
        this.updateLayout();
        
        // 保存窗口尺寸
        const settings = this.modules.dataManager.getSettings();
        settings.windowSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        this.modules.dataManager.saveSettings(settings);
    }

    /**
     * 处理页面可见性改变
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // 页面隐藏时保存数据
            this.saveAllData();
        } else {
            // 页面显示时刷新数据
            this.refreshAllData();
        }
    }

    /**
     * 处理页面卸载前事件
     */
    handleBeforeUnload(e) {
        // 检查是否有未保存的更改
        let hasUnsavedChanges = false;
        
        if (this.modules.notesManager && this.modules.notesManager.hasUnsavedChanges()) {
            hasUnsavedChanges = true;
        }
        
        if (hasUnsavedChanges) {
            const message = '您有未保存的更改，确定要离开吗？';
            e.returnValue = message;
            return message;
        }
        
        // 保存所有数据
        this.saveAllData();
    }

    /**
     * 处理全局键盘事件
     */
    handleGlobalKeydown(e) {
        // Ctrl/Cmd + 组合键
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case ',':
                    // 打开设置
                    e.preventDefault();
                    this.openSettings();
                    break;
                    
                case '/':
                    // 显示快捷键帮助
                    e.preventDefault();
                    this.showKeyboardShortcuts();
                    break;
                    
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    // 快速切换页面
                    e.preventDefault();
                    this.switchToPageByNumber(parseInt(e.key));
                    break;
            }
        }
        
        // ESC 键
        if (e.key === 'Escape') {
            this.handleEscapeKey();
        }
    }

    /**
     * 处理全局错误
     */
    handleGlobalError(e) {
        console.error('全局错误:', e.error);
        this.showNotification('发生了一个错误，请刷新页面重试', 'error');
    }

    /**
     * 处理未捕获的Promise拒绝
     */
    handleUnhandledRejection(e) {
        console.error('未处理的Promise拒绝:', e.reason);
        this.showNotification('操作失败，请重试', 'error');
    }

    /**
     * 处理页面切换事件
     */
    handlePageChanged(e) {
        const { page, previousPage } = e.detail;
        console.log(`页面切换: ${previousPage} -> ${page}`);
        
        // 更新页面标题
        if (this.modules.router) {
            this.modules.router.updatePageTitle(page);
        }
        
        // 保存页面切换历史
        const settings = this.modules.dataManager.getSettings();
        settings.lastVisitedPage = page;
        this.modules.dataManager.saveSettings(settings);
    }

    /**
     * 更新布局
     */
    updateLayout() {
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        if (window.innerWidth < 768) {
            // 移动端布局
            document.body.classList.add('mobile-layout');
            if (sidebar) sidebar.classList.add('mobile-sidebar');
        } else {
            // 桌面端布局
            document.body.classList.remove('mobile-layout');
            if (sidebar) sidebar.classList.remove('mobile-sidebar');
        }
    }

    /**
     * 保存所有数据
     */
    saveAllData() {
        try {
            // 保存笔记
            if (this.modules.notesManager) {
                this.modules.notesManager.saveCurrentNote();
            }
            
            // 保存其他模块数据
            // if (this.modules.todosManager) {
            //     this.modules.todosManager.saveAllTodos();
            // }
            
            console.log('所有数据已保存');
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }

    /**
     * 刷新所有数据
     */
    refreshAllData() {
        try {
            // 刷新笔记
            if (this.modules.notesManager) {
                this.modules.notesManager.refreshNotesList();
            }
            
            // 刷新其他模块数据
            // if (this.modules.todosManager) {
            //     this.modules.todosManager.refreshTodosList();
            // }
            
            console.log('所有数据已刷新');
        } catch (error) {
            console.error('刷新数据失败:', error);
        }
    }

    /**
     * 初始化主题
     */
    initTheme() {
        const settings = this.modules.dataManager.getSettings();
        const theme = settings.theme || 'light';
        this.setTheme(theme);
    }

    /**
     * 设置主题
     */
    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        // 保存主题设置
        const settings = this.modules.dataManager.getSettings();
        settings.theme = theme;
        this.modules.dataManager.saveSettings(settings);
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    /**
     * 显示加载状态
     */
    showLoadingState() {
        const loadingElement = document.getElementById('loading-screen');
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoadingState() {
        const loadingElement = document.getElementById('loading-screen');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * 显示错误状态
     */
    showErrorState(error) {
        const errorElement = document.getElementById('error-screen');
        if (errorElement) {
            errorElement.style.display = 'flex';
            const errorMessage = errorElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = error.message || '应用初始化失败';
            }
        }
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // 添加到页面
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
    }

    /**
     * 打开设置
     */
    openSettings() {
        // 创建设置模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>设置</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="setting-group">
                        <label>主题</label>
                        <select id="theme-select">
                            <option value="light">浅色</option>
                            <option value="dark">深色</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>自动保存间隔</label>
                        <select id="autosave-interval">
                            <option value="1000">1秒</option>
                            <option value="2000">2秒</option>
                            <option value="5000">5秒</option>
                            <option value="10000">10秒</option>
                        </select>
                    </div>
                    <div class="setting-group">
                        <label>
                            <input type="checkbox" id="enable-shortcuts"> 启用键盘快捷键
                        </label>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.app.saveSettings(); this.closest('.modal').remove();">保存</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 加载当前设置
        this.loadSettingsToModal();
    }

    /**
     * 加载设置到模态框
     */
    loadSettingsToModal() {
        const settings = this.modules.dataManager.getSettings();
        
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = settings.theme || 'light';
        }
        
        const autosaveInterval = document.getElementById('autosave-interval');
        if (autosaveInterval) {
            autosaveInterval.value = settings.autosaveInterval || '2000';
        }
        
        const enableShortcuts = document.getElementById('enable-shortcuts');
        if (enableShortcuts) {
            enableShortcuts.checked = settings.enableShortcuts !== false;
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        const settings = this.modules.dataManager.getSettings();
        
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            settings.theme = themeSelect.value;
            this.setTheme(themeSelect.value);
        }
        
        const autosaveInterval = document.getElementById('autosave-interval');
        if (autosaveInterval) {
            settings.autosaveInterval = parseInt(autosaveInterval.value);
        }
        
        const enableShortcuts = document.getElementById('enable-shortcuts');
        if (enableShortcuts) {
            settings.enableShortcuts = enableShortcuts.checked;
        }
        
        this.modules.dataManager.saveSettings(settings);
        this.showNotification('设置已保存', 'success');
    }

    /**
     * 显示键盘快捷键帮助
     */
    showKeyboardShortcuts() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>键盘快捷键</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-list">
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>N</kbd>
                            <span>新建笔记</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>S</kbd>
                            <span>保存笔记</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>F</kbd>
                            <span>搜索笔记</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>,</kbd>
                            <span>打开设置</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>/</kbd>
                            <span>显示快捷键帮助</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>1-5</kbd>
                            <span>快速切换页面</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Esc</kbd>
                            <span>关闭模态框/取消操作</span>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">关闭</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * 根据数字切换页面
     */
    switchToPageByNumber(number) {
        const pages = ['notes', 'todos', 'chat', 'timer', 'projects'];
        const page = pages[number - 1];
        if (page && this.modules.router) {
            this.modules.router.navigateTo(page);
        }
    }

    /**
     * 处理ESC键
     */
    handleEscapeKey() {
        // 关闭模态框
        const modals = document.querySelectorAll('.modal');
        if (modals.length > 0) {
            modals[modals.length - 1].remove();
            return;
        }
        
        // 清除搜索
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        searchInputs.forEach(input => {
            if (input === document.activeElement) {
                input.value = '';
                input.dispatchEvent(new Event('input'));
                input.blur();
            }
        });
    }

    /**
     * 获取应用信息
     */
    getAppInfo() {
        return {
            name: '智能笔记应用',
            version: '1.0.0',
            author: 'AI Assistant',
            description: '一个功能丰富的智能笔记应用，支持AI功能、待办事项、番茄钟等',
            initialized: this.isInitialized,
            modules: Object.keys(this.modules)
        };
    }

    /**
     * 重启应用
     */
    restart() {
        // 保存数据
        this.saveAllData();
        
        // 重新加载页面
        window.location.reload();
    }

    /**
     * 销毁应用
     */
    destroy() {
        // 保存数据
        this.saveAllData();
        
        // 销毁模块
        Object.values(this.modules).forEach(module => {
            if (module && typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        
        // 移除事件监听器
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
        window.removeEventListener('pageChanged', this.handlePageChanged);
        
        // 清除数据
        this.modules = {};
        this.isInitialized = false;
        
        console.log('应用已销毁');
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// 导出应用类
window.App = App;