/**
 * 待办事项管理模块 - 负责待办事项的CRUD操作
 */
class TodoManager {
    constructor() {
        this.currentTodos = [];
        this.currentFilter = 'all'; // all, active, completed
        this.currentSort = 'created'; // created, priority, dueDate
        
        this.init();
    }

    /**
     * 初始化待办事项管理器
     */
    init() {
        this.bindEvents();
        this.loadTodos();
        console.log('待办事项管理器已初始化');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 添加待办事项
        const addTodoBtn = document.getElementById('add-todo-btn');
        const todoInput = document.getElementById('new-todo-input');
        
        if (addTodoBtn) {
            addTodoBtn.addEventListener('click', () => {
                this.addTodo();
            });
        }
        
        if (todoInput) {
            todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTodo();
                }
            });
        }

        // 筛选按钮
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 排序选择
        const sortSelect = document.getElementById('todo-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.setSortOrder(e.target.value);
            });
        }

        // 批量操作
        const markAllBtn = document.getElementById('mark-all-completed');
        const deleteCompletedBtn = document.getElementById('delete-completed');
        
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                this.markAllCompleted();
            });
        }
        
        if (deleteCompletedBtn) {
            deleteCompletedBtn.addEventListener('click', () => {
                this.deleteCompleted();
            });
        }
    }

    /**
     * 加载待办事项
     */
    loadTodos() {
        this.currentTodos = window.dataManager?.getAllTodos() || [];
        this.renderTodos();
        this.updateStats();
    }

    /**
     * 添加待办事项
     */
    addTodo() {
        const input = document.getElementById('new-todo-input');
        const title = input?.value.trim();
        
        if (!title) {
            window.app?.showNotification('请输入待办事项内容', 'warning');
            return;
        }

        const todo = {
            id: window.dataManager?.generateId() || Date.now().toString(),
            title: title,
            description: '',
            completed: false,
            priority: 'medium', // low, medium, high
            dueDate: null,
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null
        };

        // 保存到数据管理器
        window.dataManager?.saveTodo(todo);
        
        // 添加到当前列表
        this.currentTodos.unshift(todo);
        
        // 清空输入框
        input.value = '';
        
        // 重新渲染
        this.renderTodos();
        this.updateStats();
        
        window.app?.showNotification('待办事项已添加', 'success');
    }

    /**
     * 更新待办事项
     */
    updateTodo(id, updates) {
        const todo = this.currentTodos.find(t => t.id === id);
        if (!todo) return;

        // 更新属性
        Object.assign(todo, updates, {
            updatedAt: new Date().toISOString()
        });

        // 如果标记为完成，设置完成时间
        if (updates.completed && !todo.completedAt) {
            todo.completedAt = new Date().toISOString();
        } else if (updates.completed === false) {
            todo.completedAt = null;
        }

        // 保存到数据管理器
        window.dataManager?.saveTodo(todo);
        
        // 重新渲染
        this.renderTodos();
        this.updateStats();
    }

    /**
     * 删除待办事项
     */
    deleteTodo(id) {
        const index = this.currentTodos.findIndex(t => t.id === id);
        if (index === -1) return;

        const todo = this.currentTodos[index];
        
        // 确认删除
        if (confirm(`确定要删除待办事项 "${todo.title}" 吗？`)) {
            // 从数据管理器删除
            window.dataManager?.deleteTodo(id);
            
            // 从当前列表删除
            this.currentTodos.splice(index, 1);
            
            // 重新渲染
            this.renderTodos();
            this.updateStats();
            
            window.app?.showNotification('待办事项已删除', 'success');
        }
    }

    /**
     * 切换完成状态
     */
    toggleComplete(id) {
        const todo = this.currentTodos.find(t => t.id === id);
        if (!todo) return;

        this.updateTodo(id, { completed: !todo.completed });
    }

    /**
     * 设置筛选条件
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新筛选按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.renderTodos();
    }

    /**
     * 设置排序方式
     */
    setSortOrder(sort) {
        this.currentSort = sort;
        this.renderTodos();
    }

    /**
     * 获取筛选后的待办事项
     */
    getFilteredTodos() {
        let filtered = [...this.currentTodos];
        
        // 应用筛选
        switch (this.currentFilter) {
            case 'active':
                filtered = filtered.filter(todo => !todo.completed);
                break;
            case 'completed':
                filtered = filtered.filter(todo => todo.completed);
                break;
            case 'overdue':
                const now = new Date();
                filtered = filtered.filter(todo => 
                    !todo.completed && 
                    todo.dueDate && 
                    new Date(todo.dueDate) < now
                );
                break;
        }
        
        // 应用排序
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'dueDate':
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'created':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });
        
        return filtered;
    }

    /**
     * 渲染待办事项列表
     */
    renderTodos() {
        const container = document.getElementById('todos-list');
        if (!container) return;

        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>暂无待办事项</h3>
                    <p>${this.getEmptyStateMessage()}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTodos.map(todo => this.renderTodoItem(todo)).join('');
        
        // 绑定事件
        this.bindTodoEvents();
    }

    /**
     * 渲染单个待办事项
     */
    renderTodoItem(todo) {
        const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;
        const priorityClass = `priority-${todo.priority}`;
        const statusClass = todo.completed ? 'completed' : (isOverdue ? 'overdue' : '');
        
        return `
            <div class="todo-item ${statusClass} ${priorityClass}" data-id="${todo.id}">
                <div class="todo-checkbox">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="window.todoManager.toggleComplete('${todo.id}')">
                </div>
                <div class="todo-content">
                    <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                    <div class="todo-meta">
                        <span class="todo-priority priority-${todo.priority}">${this.getPriorityText(todo.priority)}</span>
                        ${todo.dueDate ? `<span class="todo-due-date ${isOverdue ? 'overdue' : ''}">
                            📅 ${this.formatDate(todo.dueDate)}
                        </span>` : ''}
                        ${todo.tags.length > 0 ? `<div class="todo-tags">
                            ${todo.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="btn-icon" onclick="window.todoManager.editTodo('${todo.id}')" title="编辑">
                        ✏️
                    </button>
                    <button class="btn-icon" onclick="window.todoManager.deleteTodo('${todo.id}')" title="删除">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 绑定待办事项事件
     */
    bindTodoEvents() {
        // 双击编辑
        document.querySelectorAll('.todo-item').forEach(item => {
            item.addEventListener('dblclick', (e) => {
                if (e.target.type !== 'checkbox') {
                    this.editTodo(item.dataset.id);
                }
            });
        });
    }

    /**
     * 编辑待办事项
     */
    editTodo(id) {
        const todo = this.currentTodos.find(t => t.id === id);
        if (!todo) return;

        this.showEditModal(todo);
    }

    /**
     * 显示编辑模态框
     */
    showEditModal(todo) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content edit-todo-modal">
                <div class="modal-header">
                    <h2>编辑待办事项</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="edit-todo-form">
                        <div class="form-group">
                            <label for="edit-todo-title">标题</label>
                            <input type="text" id="edit-todo-title" value="${this.escapeForAttribute(todo.title)}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-todo-description">描述</label>
                            <textarea id="edit-todo-description" rows="3">${this.escapeHtml(todo.description)}</textarea>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="edit-todo-priority">优先级</label>
                                <select id="edit-todo-priority">
                                    <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>低</option>
                                    <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>中</option>
                                    <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>高</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="edit-todo-due-date">截止日期</label>
                                <input type="datetime-local" id="edit-todo-due-date" 
                                       value="${todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : ''}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="edit-todo-tags">标签（用逗号分隔）</label>
                            <input type="text" id="edit-todo-tags" value="${todo.tags.join(', ')}">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.todoManager.saveEditedTodo('${todo.id}'); this.closest('.modal').remove();">保存</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 聚焦到标题输入框
        setTimeout(() => {
            document.getElementById('edit-todo-title')?.focus();
        }, 100);
    }

    /**
     * 保存编辑的待办事项
     */
    saveEditedTodo(id) {
        const title = document.getElementById('edit-todo-title')?.value.trim();
        const description = document.getElementById('edit-todo-description')?.value.trim();
        const priority = document.getElementById('edit-todo-priority')?.value;
        const dueDate = document.getElementById('edit-todo-due-date')?.value;
        const tagsInput = document.getElementById('edit-todo-tags')?.value.trim();
        
        if (!title) {
            window.app?.showNotification('请输入待办事项标题', 'warning');
            return;
        }

        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        const updates = {
            title,
            description,
            priority,
            dueDate: dueDate || null,
            tags
        };

        this.updateTodo(id, updates);
        window.app?.showNotification('待办事项已更新', 'success');
    }

    /**
     * 标记所有为已完成
     */
    markAllCompleted() {
        const activeTodos = this.currentTodos.filter(todo => !todo.completed);
        
        if (activeTodos.length === 0) {
            window.app?.showNotification('没有未完成的待办事项', 'info');
            return;
        }

        if (confirm(`确定要标记所有 ${activeTodos.length} 个待办事项为已完成吗？`)) {
            activeTodos.forEach(todo => {
                this.updateTodo(todo.id, { completed: true });
            });
            
            window.app?.showNotification(`已标记 ${activeTodos.length} 个待办事项为已完成`, 'success');
        }
    }

    /**
     * 删除已完成的待办事项
     */
    deleteCompleted() {
        const completedTodos = this.currentTodos.filter(todo => todo.completed);
        
        if (completedTodos.length === 0) {
            window.app?.showNotification('没有已完成的待办事项', 'info');
            return;
        }

        if (confirm(`确定要删除所有 ${completedTodos.length} 个已完成的待办事项吗？`)) {
            completedTodos.forEach(todo => {
                window.dataManager?.deleteTodo(todo.id);
                const index = this.currentTodos.findIndex(t => t.id === todo.id);
                if (index > -1) {
                    this.currentTodos.splice(index, 1);
                }
            });
            
            this.renderTodos();
            this.updateStats();
            
            window.app?.showNotification(`已删除 ${completedTodos.length} 个已完成的待办事项`, 'success');
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const total = this.currentTodos.length;
        const completed = this.currentTodos.filter(todo => todo.completed).length;
        const active = total - completed;
        const overdue = this.currentTodos.filter(todo => 
            !todo.completed && 
            todo.dueDate && 
            new Date(todo.dueDate) < new Date()
        ).length;

        // 更新统计显示
        const statsContainer = document.getElementById('todo-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${total}</span>
                    <span class="stat-label">总计</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${active}</span>
                    <span class="stat-label">待完成</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${completed}</span>
                    <span class="stat-label">已完成</span>
                </div>
                ${overdue > 0 ? `
                    <div class="stat-item overdue">
                        <span class="stat-number">${overdue}</span>
                        <span class="stat-label">已逾期</span>
                    </div>
                ` : ''}
            `;
        }

        // 更新进度条
        const progressBar = document.getElementById('todo-progress');
        if (progressBar && total > 0) {
            const percentage = Math.round((completed / total) * 100);
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `${percentage}%`;
        }
    }

    /**
     * 获取空状态消息
     */
    getEmptyStateMessage() {
        switch (this.currentFilter) {
            case 'active':
                return '所有待办事项都已完成！';
            case 'completed':
                return '还没有完成的待办事项';
            case 'overdue':
                return '没有逾期的待办事项';
            default:
                return '添加你的第一个待办事项吧';
        }
    }

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
        const priorityMap = {
            low: '低',
            medium: '中',
            high: '高'
        };
        return priorityMap[priority] || '中';
    }

    /**
     * 格式化日期
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '今天';
        } else if (diffDays === 1) {
            return '明天';
        } else if (diffDays === -1) {
            return '昨天';
        } else if (diffDays > 0) {
            return `${diffDays}天后`;
        } else {
            return `${Math.abs(diffDays)}天前`;
        }
    }

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 转义属性值
     */
    escapeForAttribute(text) {
        return text.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
    }

    /**
     * 搜索待办事项
     */
    searchTodos(query) {
        if (!query.trim()) {
            this.renderTodos();
            return;
        }

        const searchResults = this.currentTodos.filter(todo => 
            todo.title.toLowerCase().includes(query.toLowerCase()) ||
            todo.description.toLowerCase().includes(query.toLowerCase()) ||
            todo.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        const container = document.getElementById('todos-list');
        if (!container) return;

        if (searchResults.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>未找到相关待办事项</h3>
                    <p>尝试使用其他关键词搜索</p>
                </div>
            `;
            return;
        }

        container.innerHTML = searchResults.map(todo => this.renderTodoItem(todo)).join('');
        this.bindTodoEvents();
    }

    /**
     * 导出待办事项
     */
    exportTodos() {
        const data = {
            todos: this.currentTodos,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.app?.showNotification('待办事项已导出', 'success');
    }

    /**
     * 导入待办事项
     */
    importTodos(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const importedTodos = data.todos || [];
                
                let importCount = 0;
                importedTodos.forEach(todo => {
                    // 检查是否已存在
                    if (!this.currentTodos.find(t => t.id === todo.id)) {
                        // 重新生成ID以避免冲突
                        todo.id = window.dataManager?.generateId() || Date.now().toString();
                        todo.importedAt = new Date().toISOString();
                        
                        window.dataManager?.saveTodo(todo);
                        this.currentTodos.push(todo);
                        importCount++;
                    }
                });
                
                this.renderTodos();
                this.updateStats();
                
                window.app?.showNotification(`成功导入 ${importCount} 个待办事项`, 'success');
            } catch (error) {
                console.error('导入失败:', error);
                window.app?.showNotification('导入失败，请检查文件格式', 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * 获取当前待办事项
     */
    getCurrentTodos() {
        return this.currentTodos;
    }

    /**
     * 刷新待办事项列表
     */
    refresh() {
        this.loadTodos();
    }

    /**
     * 销毁待办事项管理器
     */
    destroy() {
        this.currentTodos = [];
        console.log('待办事项管理器已销毁');
    }
}

// 创建全局待办事项管理器实例
window.todoManager = new TodoManager();