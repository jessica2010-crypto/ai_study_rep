/**
 * 数据管理模块 - 负责所有localStorage操作
 */
class DataManager {
    constructor() {
        this.storageKeys = {
            notes: 'smart_notes_data',
            todos: 'smart_todos_data',
            projects: 'smart_projects_data',
            chatHistory: 'smart_chat_history',
            settings: 'smart_app_settings'
        };
        
        // 初始化默认设置
        this.initializeSettings();
    }

    /**
     * 初始化应用设置
     */
    initializeSettings() {
        const defaultSettings = {
            workDuration: 25,
            breakDuration: 5,
            notificationsEnabled: true,
            theme: 'light',
            autoSave: true,
            autoSaveInterval: 30000 // 30秒
        };
        
        if (!this.getSettings()) {
            this.saveSettings(defaultSettings);
        }
    }

    /**
     * 通用存储方法
     */
    save(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            
            // 检查数据大小（localStorage限制约5MB）
            if (jsonData.length > 5 * 1024 * 1024) {
                throw new Error('数据过大，超出存储限制');
            }
            
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    /**
     * 通用读取方法
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    }

    /**
     * 通用数据获取方法（兼容性方法）
     */
    getData(key, defaultValue = null) {
        return this.load(key, defaultValue);
    }

    /**
     * 通用数据保存方法（兼容性方法）
     */
    saveData(key, data) {
        return this.save(key, data);
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 获取当前时间戳
     */
    getCurrentTimestamp() {
        return Date.now();
    }

    /**
     * 格式化日期
     */
    formatDate(timestamp, format = 'YYYY-MM-DD HH:mm') {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    }

    /**
     * 计算字数
     */
    countWords(text) {
        if (!text) return 0;
        // 中文字符和英文单词分别计算
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
        return chineseChars + englishWords;
    }

    // ==================== 笔记相关方法 ====================

    /**
     * 获取所有笔记
     */
    getNotes() {
        return this.load(this.storageKeys.notes, []);
    }

    /**
     * 获取所有笔记（别名方法）
     */
    getAllNotes() {
        return this.getNotes();
    }

    // ==================== 待办事项管理 ====================
    
    /**
     * 获取所有待办事项（别名）
     */
    getAllTodos() {
        return this.getTodos();
    }
    
    /**
     * 根据ID获取待办事项
     */
    getTodoById(id) {
        return this.getTodos().find(todo => todo.id === id);
    }
    
    /**
     * 批量删除待办事项
     */
    deleteTodos(ids) {
        if (!Array.isArray(ids)) return 0;
        
        let deletedCount = 0;
        ids.forEach(id => {
            if (this.deleteTodo(id)) {
                deletedCount++;
            }
        });
        
        return deletedCount;
    }
    
    /**
     * 搜索待办事项
     */
    searchTodos(query) {
        if (!query) return [];
        
        const todos = this.getTodos();
        const lowerQuery = query.toLowerCase();
        
        return todos.filter(todo => 
            todo.content.toLowerCase().includes(lowerQuery) ||
            (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );
    }
    
    /**
     * 根据标签获取待办事项
     */
    getTodosByTag(tag) {
        const todos = this.getTodos();
        return todos.filter(todo => 
            todo.tags && todo.tags.includes(tag)
        );
    }
    
    /**
     * 根据优先级获取待办事项
     */
    getTodosByPriority(priority) {
        const todos = this.getTodos();
        return todos.filter(todo => todo.priority === priority);
    }
    
    /**
     * 获取逾期的待办事项
     */
    getOverdueTodos() {
        const todos = this.getTodos();
        const now = new Date();
        
        return todos.filter(todo => 
            !todo.completed && 
            todo.dueDate && 
            new Date(todo.dueDate) < now
        );
    }
    
    /**
     * 获取待办事项统计
     */
    getTodoStats() {
        const todos = this.getTodos();
        const total = todos.length;
        const completed = todos.filter(todo => todo.completed).length;
        const active = total - completed;
        const overdue = this.getOverdueTodos().length;
        
        const priorityStats = {
            high: todos.filter(todo => todo.priority === 'high').length,
            medium: todos.filter(todo => todo.priority === 'medium').length,
            low: todos.filter(todo => todo.priority === 'low').length
        };
        
        return {
            total,
            completed,
            active,
            overdue,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            priorityStats
        };
    }

    /**
     * 保存笔记
     */
    saveNote(note) {
        const notes = this.getNotes();
        const now = this.getCurrentTimestamp();
        
        if (note.id) {
            // 更新现有笔记
            const index = notes.findIndex(n => n.id === note.id);
            if (index !== -1) {
                notes[index] = {
                    ...note,
                    updatedAt: now,
                    wordCount: this.countWords(note.content)
                };
            }
        } else {
            // 创建新笔记
            const newNote = {
                id: this.generateId(),
                title: note.title || '无标题',
                content: note.content || '',
                tags: note.tags || [],
                createdAt: now,
                updatedAt: now,
                wordCount: this.countWords(note.content || '')
            };
            notes.unshift(newNote); // 新笔记放在最前面
        }
        
        return this.save(this.storageKeys.notes, notes);
    }

    /**
     * 删除笔记
     */
    deleteNote(noteId) {
        const notes = this.getNotes();
        const filteredNotes = notes.filter(note => note.id !== noteId);
        return this.save(this.storageKeys.notes, filteredNotes);
    }

    /**
     * 根据ID获取笔记
     */
    getNoteById(noteId) {
        const notes = this.getNotes();
        return notes.find(note => note.id === noteId);
    }

    /**
     * 搜索笔记
     */
    searchNotes(query) {
        const notes = this.getNotes();
        const lowerQuery = query.toLowerCase();
        
        return notes.filter(note => 
            note.title.toLowerCase().includes(lowerQuery) ||
            note.content.toLowerCase().includes(lowerQuery) ||
            note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * 按条件排序笔记
     */
    sortNotes(notes, sortBy = 'updated') {
        return [...notes].sort((a, b) => {
            switch (sortBy) {
                case 'created':
                    return b.createdAt - a.createdAt;
                case 'updated':
                    return b.updatedAt - a.updatedAt;
                case 'title':
                    return a.title.localeCompare(b.title);
                default:
                    return b.updatedAt - a.updatedAt;
            }
        });
    }

    // ==================== 待办事项相关方法 ====================

    /**
     * 获取所有待办事项
     */
    getTodos() {
        return this.load(this.storageKeys.todos, []);
    }

    /**
     * 保存待办事项
     */
    saveTodo(todo) {
        const todos = this.getTodos();
        const now = this.getCurrentTimestamp();
        
        if (todo.id) {
            // 更新现有待办
            const index = todos.findIndex(t => t.id === todo.id);
            if (index !== -1) {
                todos[index] = {
                    ...todo,
                    updatedAt: now
                };
            }
        } else {
            // 创建新待办
            const newTodo = {
                id: this.generateId(),
                content: todo.content,
                completed: false,
                dueDate: todo.dueDate || null,
                createdAt: now,
                updatedAt: now,
                completedAt: null
            };
            todos.unshift(newTodo);
        }
        
        return this.save(this.storageKeys.todos, todos);
    }

    /**
     * 切换待办完成状态
     */
    toggleTodo(todoId) {
        const todos = this.getTodos();
        const todo = todos.find(t => t.id === todoId);
        
        if (todo) {
            todo.completed = !todo.completed;
            todo.completedAt = todo.completed ? this.getCurrentTimestamp() : null;
            todo.updatedAt = this.getCurrentTimestamp();
            return this.save(this.storageKeys.todos, todos);
        }
        
        return false;
    }

    /**
     * 删除待办事项
     */
    deleteTodo(todoId) {
        const todos = this.getTodos();
        const filteredTodos = todos.filter(todo => todo.id !== todoId);
        return this.save(this.storageKeys.todos, filteredTodos);
    }

    /**
     * 获取活跃的待办事项
     */
    getActiveTodos() {
        return this.getTodos().filter(todo => !todo.completed);
    }

    /**
     * 获取已完成的待办事项
     */
    getCompletedTodos() {
        return this.getTodos().filter(todo => todo.completed);
    }

    // ==================== 项目管理相关方法 ====================

    /**
     * 获取所有项目
     */
    getProjects() {
        return this.load(this.storageKeys.projects, []);
    }

    /**
     * 保存项目
     */
    saveProject(project) {
        const projects = this.getProjects();
        const now = this.getCurrentTimestamp();
        
        if (project.id) {
            // 更新现有项目
            const index = projects.findIndex(p => p.id === project.id);
            if (index !== -1) {
                projects[index] = {
                    ...project,
                    updatedAt: now
                };
            }
        } else {
            // 创建新项目
            const newProject = {
                id: this.generateId(),
                name: project.name,
                description: project.description || '',
                progress: 0,
                members: project.members || [],
                tasks: project.tasks || [],
                createdAt: now,
                updatedAt: now
            };
            projects.unshift(newProject);
        }
        
        return this.save(this.storageKeys.projects, projects);
    }

    /**
     * 删除项目
     */
    deleteProject(projectId) {
        const projects = this.getProjects();
        const filteredProjects = projects.filter(project => project.id !== projectId);
        return this.save(this.storageKeys.projects, filteredProjects);
    }

    /**
     * 根据ID获取项目
     */
    getProjectById(projectId) {
        const projects = this.getProjects();
        return projects.find(project => project.id === projectId);
    }

    /**
     * 添加项目任务
     */
    addProjectTask(projectId, task) {
        const projects = this.getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            const newTask = {
                id: this.generateId(),
                title: task.title,
                completed: false,
                assignee: task.assignee || '',
                createdAt: this.getCurrentTimestamp()
            };
            
            project.tasks.push(newTask);
            project.updatedAt = this.getCurrentTimestamp();
            
            // 重新计算进度
            this.updateProjectProgress(projectId);
            
            return this.save(this.storageKeys.projects, projects);
        }
        
        return false;
    }

    /**
     * 切换任务完成状态
     */
    toggleProjectTask(projectId, taskId) {
        const projects = this.getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            const task = project.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                project.updatedAt = this.getCurrentTimestamp();
                
                // 重新计算进度
                this.updateProjectProgress(projectId);
                
                return this.save(this.storageKeys.projects, projects);
            }
        }
        
        return false;
    }

    /**
     * 更新项目进度
     */
    updateProjectProgress(projectId) {
        const projects = this.getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project && project.tasks.length > 0) {
            const completedTasks = project.tasks.filter(task => task.completed).length;
            project.progress = Math.round((completedTasks / project.tasks.length) * 100);
        } else if (project) {
            project.progress = 0;
        }
    }

    /**
     * 添加项目成员
     */
    addProjectMember(projectId, memberName) {
        const projects = this.getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project && !project.members.includes(memberName)) {
            project.members.push(memberName);
            project.updatedAt = this.getCurrentTimestamp();
            return this.save(this.storageKeys.projects, projects);
        }
        
        return false;
    }

    /**
     * 移除项目成员
     */
    removeProjectMember(projectId, memberName) {
        const projects = this.getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            project.members = project.members.filter(member => member !== memberName);
            project.updatedAt = this.getCurrentTimestamp();
            return this.save(this.storageKeys.projects, projects);
        }
        
        return false;
    }

    // ==================== 聊天历史相关方法 ====================

    /**
     * 获取聊天历史
     */
    getChatHistory() {
        return this.load(this.storageKeys.chatHistory, []);
    }

    /**
     * 添加聊天消息
     */
    addChatMessage(message, isUser = true) {
        const chatHistory = this.getChatHistory();
        const newMessage = {
            id: this.generateId(),
            content: message,
            isUser: isUser,
            timestamp: this.getCurrentTimestamp()
        };
        
        chatHistory.push(newMessage);
        
        // 限制聊天历史长度（最多保存1000条消息）
        if (chatHistory.length > 1000) {
            chatHistory.splice(0, chatHistory.length - 1000);
        }
        
        return this.save(this.storageKeys.chatHistory, chatHistory);
    }

    /**
     * 清空聊天历史
     */
    clearChatHistory() {
        return this.save(this.storageKeys.chatHistory, []);
    }

    // ==================== 设置相关方法 ====================

    /**
     * 获取应用设置
     */
    getSettings() {
        return this.load(this.storageKeys.settings);
    }

    /**
     * 保存应用设置
     */
    saveSettings(settings) {
        return this.save(this.storageKeys.settings, settings);
    }

    /**
     * 更新单个设置项
     */
    updateSetting(key, value) {
        const settings = this.getSettings() || {};
        settings[key] = value;
        return this.saveSettings(settings);
    }

    // ==================== 数据导出导入方法 ====================

    /**
     * 导出所有数据
     */
    exportAllData() {
        return {
            notes: this.getNotes(),
            todos: this.getTodos(),
            projects: this.getProjects(),
            chatHistory: this.getChatHistory(),
            settings: this.getSettings(),
            exportDate: this.getCurrentTimestamp(),
            version: '1.0.0'
        };
    }

    /**
     * 导入数据
     */
    importData(data) {
        try {
            if (data.notes) this.save(this.storageKeys.notes, data.notes);
            if (data.todos) this.save(this.storageKeys.todos, data.todos);
            if (data.projects) this.save(this.storageKeys.projects, data.projects);
            if (data.chatHistory) this.save(this.storageKeys.chatHistory, data.chatHistory);
            if (data.settings) this.save(this.storageKeys.settings, data.settings);
            
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    /**
     * 清空所有数据
     */
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // 重新初始化设置
            this.initializeSettings();
            
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }

    /**
     * 获取存储使用情况
     */
    getStorageInfo() {
        let totalSize = 0;
        const info = {};
        
        Object.entries(this.storageKeys).forEach(([key, storageKey]) => {
            const data = localStorage.getItem(storageKey);
            const size = data ? data.length : 0;
            info[key] = {
                size: size,
                sizeFormatted: this.formatBytes(size)
            };
            totalSize += size;
        });
        
        return {
            ...info,
            total: {
                size: totalSize,
                sizeFormatted: this.formatBytes(totalSize)
            },
            available: {
                size: 5 * 1024 * 1024 - totalSize, // 假设5MB限制
                sizeFormatted: this.formatBytes(5 * 1024 * 1024 - totalSize)
            }
        };
    }

    /**
     * 格式化字节大小
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// 创建全局数据管理实例
window.dataManager = new DataManager();