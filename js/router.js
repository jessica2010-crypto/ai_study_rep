/**
 * 路由管理模块 - 负责页面切换和导航
 */
class Router {
    constructor() {
        this.currentPage = 'notes';
        this.pages = {
            notes: 'notes-page',
            todos: 'todos-page',
            chat: 'chat-page',
            timer: 'timer-page',
            projects: 'projects-page'
        };
        
        this.init();
    }

    /**
     * 初始化路由
     */
    init() {
        this.bindEvents();
        this.showPage(this.currentPage);
    }

    /**
     * 绑定导航事件
     */
    bindEvents() {
        // 绑定导航项点击事件
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.getAttribute('data-page');
                if (page && this.pages[page]) {
                    this.navigateTo(page);
                }
            });
        });

        // 监听浏览器前进后退
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'notes';
            this.showPage(page, false);
        });

        // 设置初始状态
        history.replaceState({ page: this.currentPage }, '', `#${this.currentPage}`);
    }

    /**
     * 导航到指定页面
     */
    navigateTo(page) {
        if (page === this.currentPage) return;
        
        // 保存当前页面状态（如果需要）
        this.saveCurrentPageState();
        
        // 切换页面
        this.showPage(page, true);
        
        // 更新浏览器历史
        history.pushState({ page: page }, '', `#${page}`);
    }

    /**
     * 显示指定页面
     */
    showPage(page, updateHistory = false) {
        // 隐藏所有页面
        Object.values(this.pages).forEach(pageId => {
            const pageElement = document.getElementById(pageId);
            if (pageElement) {
                pageElement.classList.add('hidden');
            }
        });

        // 显示目标页面
        const targetPageId = this.pages[page];
        const targetPage = document.getElementById(targetPageId);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            targetPage.classList.add('fade-in');
            
            // 移除动画类（避免重复动画）
            setTimeout(() => {
                targetPage.classList.remove('fade-in');
            }, 300);
        }

        // 更新导航状态
        this.updateNavigation(page);
        
        // 更新当前页面
        this.currentPage = page;
        
        // 触发页面切换事件
        this.onPageChange(page);
    }

    /**
     * 更新导航栏状态
     */
    updateNavigation(activePage) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === activePage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * 页面切换时的回调
     */
    onPageChange(page) {
        // 根据页面执行特定的初始化逻辑
        switch (page) {
            case 'notes':
                if (window.notesManager) {
                    window.notesManager.refreshNotesList();
                }
                break;
                
            case 'todos':
                if (window.todosManager) {
                    window.todosManager.refreshTodosList();
                }
                break;
                
            case 'chat':
                if (window.chatManager) {
                    window.chatManager.focusInput();
                }
                break;
                
            case 'timer':
                if (window.timerManager) {
                    window.timerManager.updateDisplay();
                }
                break;
                
            case 'projects':
                if (window.projectsManager) {
                    window.projectsManager.refreshProjectsList();
                }
                break;
        }
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('pageChanged', {
            detail: { page: page, previousPage: this.previousPage }
        }));
        
        this.previousPage = page;
    }

    /**
     * 保存当前页面状态
     */
    saveCurrentPageState() {
        switch (this.currentPage) {
            case 'notes':
                if (window.notesManager) {
                    window.notesManager.saveCurrentNote();
                }
                break;
                
            case 'todos':
                // 待办事项通常实时保存，无需特殊处理
                break;
                
            case 'chat':
                // 聊天记录实时保存
                break;
                
            case 'timer':
                // 计时器状态保持
                break;
                
            case 'projects':
                // 项目数据实时保存
                break;
        }
    }

    /**
     * 获取当前页面
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * 检查是否为指定页面
     */
    isCurrentPage(page) {
        return this.currentPage === page;
    }

    /**
     * 获取页面标题
     */
    getPageTitle(page) {
        const titles = {
            notes: '笔记',
            todos: '待办事项',
            chat: 'AI对话',
            timer: '番茄钟',
            projects: '项目管理'
        };
        return titles[page] || '智能笔记';
    }

    /**
     * 更新页面标题
     */
    updatePageTitle(page = this.currentPage) {
        const title = this.getPageTitle(page);
        document.title = `${title} - 智能笔记应用`;
    }

    /**
     * 添加页面切换监听器
     */
    onPageChanged(callback) {
        window.addEventListener('pageChanged', callback);
    }

    /**
     * 移除页面切换监听器
     */
    offPageChanged(callback) {
        window.removeEventListener('pageChanged', callback);
    }

    /**
     * 显示页面加载状态
     */
    showPageLoading(page) {
        const pageElement = document.getElementById(this.pages[page]);
        if (pageElement) {
            // 可以添加加载动画
            pageElement.style.opacity = '0.5';
        }
    }

    /**
     * 隐藏页面加载状态
     */
    hidePageLoading(page) {
        const pageElement = document.getElementById(this.pages[page]);
        if (pageElement) {
            pageElement.style.opacity = '1';
        }
    }

    /**
     * 预加载页面内容
     */
    preloadPage(page) {
        // 根据需要预加载页面数据
        switch (page) {
            case 'notes':
                if (window.notesManager) {
                    window.notesManager.preloadNotes();
                }
                break;
                
            case 'todos':
                if (window.todosManager) {
                    window.todosManager.preloadTodos();
                }
                break;
                
            case 'projects':
                if (window.projectsManager) {
                    window.projectsManager.preloadProjects();
                }
                break;
        }
    }

    /**
     * 检查页面是否需要保存
     */
    checkUnsavedChanges() {
        switch (this.currentPage) {
            case 'notes':
                if (window.notesManager) {
                    return window.notesManager.hasUnsavedChanges();
                }
                break;
        }
        return false;
    }

    /**
     * 确认页面切换（如果有未保存的更改）
     */
    confirmPageChange(targetPage) {
        if (this.checkUnsavedChanges()) {
            return confirm('当前页面有未保存的更改，确定要离开吗？');
        }
        return true;
    }

    /**
     * 安全导航（检查未保存更改）
     */
    safeNavigateTo(page) {
        if (this.confirmPageChange(page)) {
            this.navigateTo(page);
            return true;
        }
        return false;
    }

    /**
     * 获取页面历史
     */
    getPageHistory() {
        return this.pageHistory || [];
    }

    /**
     * 返回上一页
     */
    goBack() {
        if (this.pageHistory && this.pageHistory.length > 1) {
            // 移除当前页面
            this.pageHistory.pop();
            // 获取上一页
            const previousPage = this.pageHistory[this.pageHistory.length - 1];
            this.showPage(previousPage, true);
            history.pushState({ page: previousPage }, '', `#${previousPage}`);
        }
    }

    /**
     * 初始化页面历史
     */
    initPageHistory() {
        this.pageHistory = [this.currentPage];
    }

    /**
     * 添加到页面历史
     */
    addToHistory(page) {
        if (!this.pageHistory) {
            this.initPageHistory();
        }
        
        // 避免重复添加相同页面
        if (this.pageHistory[this.pageHistory.length - 1] !== page) {
            this.pageHistory.push(page);
            
            // 限制历史记录长度
            if (this.pageHistory.length > 10) {
                this.pageHistory.shift();
            }
        }
    }

    /**
     * 重置路由
     */
    reset() {
        this.currentPage = 'notes';
        this.pageHistory = ['notes'];
        this.showPage('notes', true);
        history.replaceState({ page: 'notes' }, '', '#notes');
    }

    /**
     * 销毁路由
     */
    destroy() {
        // 移除事件监听器
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.removeEventListener('click', this.handleNavClick);
        });
        
        window.removeEventListener('popstate', this.handlePopState);
    }
}

// 创建全局路由实例
window.router = new Router();