/**
 * 项目管理页面功能模块
 * 处理项目管理页面的UI交互和事件绑定
 */

class ProjectsPage {
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
        // 新建项目按钮
        const newProjectBtn = document.getElementById('new-project-btn');
        if (newProjectBtn) {
            newProjectBtn.addEventListener('click', () => {
                this.createNewProject();
            });
        }

        // 项目筛选
        const statusFilter = document.getElementById('project-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.handleStatusFilter(e.target.value);
            });
        }

        // 项目搜索
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // 排序功能
        const sortSelect = document.getElementById('project-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }
    }

    /**
     * 设置UI
     */
    setupUI() {
        this.updateProjectsList();
        this.updateStats();
    }

    /**
     * 创建新项目
     */
    createNewProject() {
        if (window.projectManager) {
            window.projectManager.createProject();
        }
    }

    /**
     * 处理状态筛选
     */
    handleStatusFilter(status) {
        if (window.projectManager) {
            window.projectManager.filterByStatus(status);
        }
    }

    /**
     * 处理搜索
     */
    handleSearch(query) {
        if (window.projectManager) {
            window.projectManager.searchProjects(query);
        }
    }

    /**
     * 处理排序
     */
    handleSort(sortBy) {
        if (window.projectManager) {
            window.projectManager.sortProjects(sortBy);
        }
    }

    /**
     * 更新项目列表
     */
    updateProjectsList() {
        if (window.projectManager) {
            window.projectManager.renderProjectsList();
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        if (window.projectManager) {
            const stats = window.projectManager.getStats();
            this.displayStats(stats);
        }
    }

    /**
     * 显示统计信息
     */
    displayStats(stats) {
        const totalElement = document.getElementById('total-projects');
        const activeElement = document.getElementById('active-projects');
        const completedElement = document.getElementById('completed-projects');
        const overdueElement = document.getElementById('overdue-projects');

        if (totalElement) totalElement.textContent = stats.total || 0;
        if (activeElement) activeElement.textContent = stats.active || 0;
        if (completedElement) completedElement.textContent = stats.completed || 0;
        if (overdueElement) overdueElement.textContent = stats.overdue || 0;
    }

    /**
     * 显示项目详情
     */
    showProjectDetails(projectId) {
        if (window.projectManager) {
            window.projectManager.showProjectDetails(projectId);
        }
    }

    /**
     * 编辑项目
     */
    editProject(projectId) {
        if (window.projectManager) {
            window.projectManager.editProject(projectId);
        }
    }

    /**
     * 删除项目
     */
    deleteProject(projectId) {
        if (confirm('确定要删除这个项目吗？此操作不可撤销。')) {
            if (window.projectManager) {
                window.projectManager.deleteProject(projectId);
            }
        }
    }

    /**
     * 更新项目状态
     */
    updateProjectStatus(projectId, status) {
        if (window.projectManager) {
            window.projectManager.updateProjectStatus(projectId, status);
        }
    }

    /**
     * 显示页面
     */
    show() {
        const projectsPage = document.getElementById('projects-page');
        if (projectsPage) {
            projectsPage.style.display = 'block';
        }
        this.updateProjectsList();
        this.updateStats();
    }

    /**
     * 隐藏页面
     */
    hide() {
        const projectsPage = document.getElementById('projects-page');
        if (projectsPage) {
            projectsPage.style.display = 'none';
        }
    }

    /**
     * 显示项目进度
     */
    updateProjectProgress(projectId, progress) {
        const progressBar = document.querySelector(`[data-project-id="${projectId}"] .progress-bar`);
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        const progressText = document.querySelector(`[data-project-id="${projectId}"] .progress-text`);
        if (progressText) {
            progressText.textContent = `${progress}%`;
        }
    }

    /**
     * 添加项目成员
     */
    addProjectMember(projectId, member) {
        if (window.projectManager) {
            window.projectManager.addMember(projectId, member);
        }
    }

    /**
     * 移除项目成员
     */
    removeProjectMember(projectId, memberId) {
        if (window.projectManager) {
            window.projectManager.removeMember(projectId, memberId);
        }
    }
}

// 创建全局实例
window.projectsPage = new ProjectsPage();