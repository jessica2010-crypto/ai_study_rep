/**
 * 待办事项页面功能模块
 * 处理待办事项页面的UI交互和事件绑定
 */

class TodosPage {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupUI();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 新建待办事项按钮
        const newTodoBtn = document.getElementById('new-todo-btn');
        if (newTodoBtn) {
            newTodoBtn.addEventListener('click', () => {
                this.createNewTodo();
            });
        }

        // 筛选按钮
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.dataset.filter);
            });
        });

        // 搜索功能
        const searchInput = document.getElementById('todo-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    /**
     * 设置UI
     */
    setupUI() {
        this.updateTodosList();
        this.updateStats();
    }

    /**
     * 创建新待办事项
     */
    createNewTodo() {
        if (window.todoManager) {
            window.todoManager.createTodo();
        }
    }

    /**
     * 处理筛选
     */
    handleFilter(filter) {
        if (window.todoManager) {
            window.todoManager.filterTodos(filter);
        }
        
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
    }

    /**
     * 处理搜索
     */
    handleSearch(query) {
        if (window.todoManager) {
            window.todoManager.searchTodos(query);
        }
    }

    /**
     * 更新待办事项列表
     */
    updateTodosList() {
        if (window.todoManager) {
            window.todoManager.renderTodosList();
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        if (window.todoManager) {
            const stats = window.todoManager.getStats();
            this.displayStats(stats);
        }
    }

    /**
     * 显示统计信息
     */
    displayStats(stats) {
        const totalElement = document.getElementById('total-todos');
        const completedElement = document.getElementById('completed-todos');
        const pendingElement = document.getElementById('pending-todos');

        if (totalElement) totalElement.textContent = stats.total || 0;
        if (completedElement) completedElement.textContent = stats.completed || 0;
        if (pendingElement) pendingElement.textContent = stats.pending || 0;
    }

    /**
     * 显示页面
     */
    show() {
        const todosPage = document.getElementById('todos-page');
        if (todosPage) {
            todosPage.style.display = 'block';
        }
        this.updateTodosList();
        this.updateStats();
    }

    /**
     * 隐藏页面
     */
    hide() {
        const todosPage = document.getElementById('todos-page');
        if (todosPage) {
            todosPage.style.display = 'none';
        }
    }
}

// 创建全局实例
window.todosPage = new TodosPage();