/**
 * 项目管理器
 * 负责项目创建、任务分配、进度跟踪等功能
 */
class ProjectManager {
    constructor() {
        this.projects = [];
        this.currentProject = null;
        this.init();
    }

    init() {
        this.loadProjects();
        this.bindEvents();
        this.renderProjects();
    }

    // 事件绑定
    bindEvents() {
        // 新建项目
        const newProjectBtn = document.getElementById('newProjectBtn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => this.showNewProjectModal());
        }

        // 项目表单提交
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => this.handleProjectSubmit(e));
        }

        // 任务表单提交
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }

        // 项目筛选
        const projectFilter = document.getElementById('projectFilter');
        if (projectFilter) {
            projectFilter.addEventListener('change', (e) => this.filterProjects(e.target.value));
        }

        // 项目排序
        const projectSort = document.getElementById('projectSort');
        if (projectSort) {
            projectSort.addEventListener('change', (e) => this.sortProjects(e.target.value));
        }

        // 搜索项目
        const projectSearch = document.getElementById('projectSearch');
        if (projectSearch) {
            projectSearch.addEventListener('input', (e) => this.searchProjects(e.target.value));
        }
    }

    // 显示新建项目模态框
    showNewProjectModal() {
        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');
        const title = modal.querySelector('.modal-title');
        
        title.textContent = '新建项目';
        form.reset();
        form.dataset.mode = 'create';
        
        modal.style.display = 'flex';
    }

    // 显示编辑项目模态框
    showEditProjectModal(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const modal = document.getElementById('projectModal');
        const form = document.getElementById('projectForm');
        const title = modal.querySelector('.modal-title');
        
        title.textContent = '编辑项目';
        form.dataset.mode = 'edit';
        form.dataset.projectId = projectId;
        
        // 填充表单
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDescription').value = project.description;
        document.getElementById('projectStartDate').value = project.startDate;
        document.getElementById('projectEndDate').value = project.endDate;
        document.getElementById('projectPriority').value = project.priority;
        document.getElementById('projectStatus').value = project.status;
        
        modal.style.display = 'flex';
    }

    // 处理项目表单提交
    handleProjectSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const mode = form.dataset.mode;
        const projectId = form.dataset.projectId;
        
        const projectData = {
            name: document.getElementById('projectName').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            startDate: document.getElementById('projectStartDate').value,
            endDate: document.getElementById('projectEndDate').value,
            priority: document.getElementById('projectPriority').value,
            status: document.getElementById('projectStatus').value
        };

        if (!projectData.name) {
            alert('请输入项目名称');
            return;
        }

        if (mode === 'create') {
            this.createProject(projectData);
        } else if (mode === 'edit') {
            this.updateProject(projectId, projectData);
        }

        // 关闭模态框
        document.getElementById('projectModal').style.display = 'none';
    }

    // 创建项目
    createProject(projectData) {
        const project = {
            id: Date.now().toString(),
            ...projectData,
            tasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.projects.push(project);
        this.saveProjects();
        this.renderProjects();
        
        console.log('项目创建成功:', project.name);
    }

    // 更新项目
    updateProject(projectId, projectData) {
        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return;

        this.projects[projectIndex] = {
            ...this.projects[projectIndex],
            ...projectData,
            updatedAt: new Date().toISOString()
        };

        this.saveProjects();
        this.renderProjects();
        
        console.log('项目更新成功:', projectData.name);
    }

    // 删除项目
    deleteProject(projectId) {
        if (!confirm('确定要删除这个项目吗？')) return;

        const projectIndex = this.projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) return;

        const project = this.projects[projectIndex];
        this.projects.splice(projectIndex, 1);
        
        this.saveProjects();
        this.renderProjects();
        
        console.log('项目删除成功:', project.name);
    }

    // 显示项目详情
    showProjectDetail(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        this.currentProject = project;
        this.renderProjectDetail();
        
        // 切换到项目详情视图
        document.querySelector('.projects-list').style.display = 'none';
        document.querySelector('.project-detail').style.display = 'block';
    }

    // 返回项目列表
    backToProjectList() {
        this.currentProject = null;
        document.querySelector('.project-detail').style.display = 'none';
        document.querySelector('.projects-list').style.display = 'block';
    }

    // 添加任务
    addTask(projectId, taskData) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const task = {
            id: Date.now().toString(),
            ...taskData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        project.tasks.push(task);
        project.updatedAt = new Date().toISOString();
        
        this.saveProjects();
        this.renderProjectDetail();
        
        console.log('任务添加成功:', task.title);
    }

    // 更新任务状态
    updateTaskStatus(projectId, taskId, status) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const task = project.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.status = status;
        task.updatedAt = new Date().toISOString();
        project.updatedAt = new Date().toISOString();
        
        this.saveProjects();
        this.renderProjectDetail();
        
        console.log('任务状态更新:', task.title, status);
    }

    // 删除任务
    deleteTask(projectId, taskId) {
        if (!confirm('确定要删除这个任务吗？')) return;

        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        const taskIndex = project.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = project.tasks[taskIndex];
        project.tasks.splice(taskIndex, 1);
        project.updatedAt = new Date().toISOString();
        
        this.saveProjects();
        this.renderProjectDetail();
        
        console.log('任务删除成功:', task.title);
    }

    // 筛选项目
    filterProjects(status) {
        let filteredProjects = this.projects;
        
        if (status && status !== 'all') {
            filteredProjects = this.projects.filter(project => project.status === status);
        }
        
        this.renderProjects(filteredProjects);
    }

    // 排序项目
    sortProjects(sortBy) {
        let sortedProjects = [...this.projects];
        
        switch (sortBy) {
            case 'name':
                sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'created':
                sortedProjects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'updated':
                sortedProjects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'priority':
                const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
                sortedProjects.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'deadline':
                sortedProjects.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
                break;
        }
        
        this.renderProjects(sortedProjects);
    }

    // 搜索项目
    searchProjects(query) {
        if (!query.trim()) {
            this.renderProjects();
            return;
        }
        
        const filteredProjects = this.projects.filter(project => 
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.description.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderProjects(filteredProjects);
    }

    // 渲染项目列表
    renderProjects(projects = this.projects) {
        const container = document.getElementById('projectsList');
        if (!container) return;

        if (projects.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无项目</div>';
            return;
        }

        container.innerHTML = projects.map(project => {
            const progress = this.calculateProjectProgress(project);
            const statusClass = this.getStatusClass(project.status);
            const priorityClass = this.getPriorityClass(project.priority);
            
            return `
                <div class="project-card" data-project-id="${project.id}">
                    <div class="project-header">
                        <h3 class="project-title">${project.name}</h3>
                        <div class="project-actions">
                            <button class="btn-icon" onclick="projectManager.showEditProjectModal('${project.id}')" title="编辑">
                                <i class="icon-edit">✏️</i>
                            </button>
                            <button class="btn-icon" onclick="projectManager.deleteProject('${project.id}')" title="删除">
                                <i class="icon-delete">🗑️</i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="project-meta">
                        <span class="project-status ${statusClass}">${this.getStatusText(project.status)}</span>
                        <span class="project-priority ${priorityClass}">${this.getPriorityText(project.priority)}</span>
                    </div>
                    
                    <p class="project-description">${project.description || '暂无描述'}</p>
                    
                    <div class="project-progress">
                        <div class="progress-info">
                            <span>进度</span>
                            <span>${progress}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    
                    <div class="project-stats">
                        <div class="stat-item">
                            <span class="stat-label">任务</span>
                            <span class="stat-value">${project.tasks.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">完成</span>
                            <span class="stat-value">${project.tasks.filter(t => t.status === 'completed').length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">截止日期</span>
                            <span class="stat-value">${project.endDate ? this.formatDate(project.endDate) : '未设置'}</span>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" onclick="projectManager.showProjectDetail('${project.id}')">
                        查看详情
                    </button>
                </div>
            `;
        }).join('');
    }

    // 渲染项目详情
    renderProjectDetail() {
        if (!this.currentProject) return;

        const project = this.currentProject;
        const progress = this.calculateProjectProgress(project);
        
        // 更新项目信息
        document.getElementById('projectDetailName').textContent = project.name;
        document.getElementById('projectDetailDescription').textContent = project.description || '暂无描述';
        document.getElementById('projectDetailStatus').textContent = this.getStatusText(project.status);
        document.getElementById('projectDetailPriority').textContent = this.getPriorityText(project.priority);
        document.getElementById('projectDetailProgress').textContent = `${progress}%`;
        
        // 更新进度条
        const progressBar = document.querySelector('.project-detail .progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // 渲染任务列表
        this.renderTasks();
    }

    // 渲染任务列表
    renderTasks() {
        if (!this.currentProject) return;

        const container = document.getElementById('tasksList');
        if (!container) return;

        const tasks = this.currentProject.tasks;
        
        if (tasks.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无任务</div>';
            return;
        }

        container.innerHTML = tasks.map(task => {
            const statusClass = this.getTaskStatusClass(task.status);
            const priorityClass = this.getPriorityClass(task.priority);
            
            return `
                <div class="task-item ${statusClass}" data-task-id="${task.id}">
                    <div class="task-header">
                        <h4 class="task-title">${task.title}</h4>
                        <div class="task-actions">
                            <select class="task-status-select" onchange="projectManager.updateTaskStatus('${this.currentProject.id}', '${task.id}', this.value)">
                                <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>待处理</option>
                                <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>进行中</option>
                                <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>已完成</option>
                            </select>
                            <button class="btn-icon" onclick="projectManager.deleteTask('${this.currentProject.id}', '${task.id}')" title="删除">
                                <i class="icon-delete">🗑️</i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="task-meta">
                        <span class="task-priority ${priorityClass}">${this.getPriorityText(task.priority)}</span>
                        ${task.assignee ? `<span class="task-assignee">负责人: ${task.assignee}</span>` : ''}
                        ${task.dueDate ? `<span class="task-due-date">截止: ${this.formatDate(task.dueDate)}</span>` : ''}
                    </div>
                    
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    // 计算项目进度
    calculateProjectProgress(project) {
        if (!project.tasks || project.tasks.length === 0) return 0;
        
        const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
        return Math.round((completedTasks / project.tasks.length) * 100);
    }

    // 获取状态样式类
    getStatusClass(status) {
        const statusClasses = {
            'planning': 'status-planning',
            'active': 'status-active',
            'completed': 'status-completed',
            'on-hold': 'status-on-hold'
        };
        return statusClasses[status] || '';
    }

    // 获取优先级样式类
    getPriorityClass(priority) {
        const priorityClasses = {
            'high': 'priority-high',
            'medium': 'priority-medium',
            'low': 'priority-low'
        };
        return priorityClasses[priority] || '';
    }

    // 获取任务状态样式类
    getTaskStatusClass(status) {
        const statusClasses = {
            'pending': 'task-pending',
            'in-progress': 'task-in-progress',
            'completed': 'task-completed'
        };
        return statusClasses[status] || '';
    }

    // 获取状态文本
    getStatusText(status) {
        const statusTexts = {
            'planning': '规划中',
            'active': '进行中',
            'completed': '已完成',
            'on-hold': '暂停'
        };
        return statusTexts[status] || status;
    }

    // 获取优先级文本
    getPriorityText(priority) {
        const priorityTexts = {
            'high': '高',
            'medium': '中',
            'low': '低'
        };
        return priorityTexts[priority] || priority;
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }

    // 保存项目数据
    saveProjects() {
        try {
            localStorage.setItem('projects', JSON.stringify(this.projects));
        } catch (error) {
            console.error('保存项目数据失败:', error);
        }
    }

    // 加载项目数据
    loadProjects() {
        try {
            const saved = localStorage.getItem('projects');
            if (saved) {
                this.projects = JSON.parse(saved);
            }
        } catch (error) {
            console.error('加载项目数据失败:', error);
            this.projects = [];
        }
    }

    // 导出项目数据
    exportProjects() {
        try {
            const dataStr = JSON.stringify(this.projects, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `projects_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            console.log('项目数据导出成功');
        } catch (error) {
            console.error('导出项目数据失败:', error);
        }
    }

    // 导入项目数据
    importProjects(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedProjects = JSON.parse(e.target.result);
                
                if (Array.isArray(importedProjects)) {
                    this.projects = importedProjects;
                    this.saveProjects();
                    this.renderProjects();
                    console.log('项目数据导入成功');
                } else {
                    throw new Error('无效的项目数据格式');
                }
            } catch (error) {
                console.error('导入项目数据失败:', error);
                alert('导入失败，请检查文件格式');
            }
        };
        reader.readAsText(file);
    }
}

// 创建全局实例
window.projectManager = new ProjectManager();