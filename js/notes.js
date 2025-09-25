/**
 * 笔记页面功能模块
 * 处理笔记页面的UI交互和事件绑定
 */

class NotesPage {
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
        // 搜索功能
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // 分类筛选
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        // 排序功能
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // 新建笔记按钮
        const newNoteBtn = document.getElementById('new-note-btn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => {
                this.createNewNote();
            });
        }
    }

    /**
     * 设置UI
     */
    setupUI() {
        this.updateNotesList();
    }

    /**
     * 处理搜索
     */
    handleSearch(query) {
        if (window.notesManager) {
            window.notesManager.searchNotes(query);
        }
    }

    /**
     * 处理分类筛选
     */
    handleCategoryFilter(category) {
        if (window.notesManager) {
            window.notesManager.filterByCategory(category);
        }
    }

    /**
     * 处理排序
     */
    handleSort(sortBy) {
        if (window.notesManager) {
            window.notesManager.sortNotes(sortBy);
        }
    }

    /**
     * 创建新笔记
     */
    createNewNote() {
        if (window.notesManager) {
            window.notesManager.createNote();
        }
    }

    /**
     * 更新笔记列表
     */
    updateNotesList() {
        if (window.notesManager) {
            window.notesManager.renderNotesList();
        }
    }

    /**
     * 显示页面
     */
    show() {
        const notesPage = document.getElementById('notes-page');
        if (notesPage) {
            notesPage.style.display = 'block';
        }
        this.updateNotesList();
    }

    /**
     * 隐藏页面
     */
    hide() {
        const notesPage = document.getElementById('notes-page');
        if (notesPage) {
            notesPage.style.display = 'none';
        }
    }
}

// 创建全局实例
window.notesPage = new NotesPage();