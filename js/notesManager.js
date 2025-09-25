/**
 * 笔记管理模块 - 负责笔记的CRUD操作
 */
class NotesManager {
    constructor() {
        this.currentNote = null;
        this.notes = [];
        this.searchQuery = '';
        this.currentFilter = 'all'; // all, recent, favorites
        this.currentSort = 'updated'; // updated, created, title, wordCount
        this.unsavedChanges = false;
        this.autoSaveTimer = null;
        
        this.init();
    }

    /**
     * 初始化笔记管理器
     */
    init() {
        this.loadNotes();
        this.bindEvents();
        this.setupAutoSave();
        this.renderNotesList();
        
        // 如果没有笔记，创建欢迎笔记
        if (this.notes.length === 0) {
            this.createWelcomeNote();
        } else {
            // 加载最近编辑的笔记
            const recentNote = this.notes[0];
            this.loadNote(recentNote.id);
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 新建笔记按钮
        const newNoteBtn = document.getElementById('new-note-btn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => this.createNewNote());
        }

        // 笔记标题输入
        const noteTitle = document.getElementById('note-title');
        if (noteTitle) {
            noteTitle.addEventListener('input', (e) => {
                this.updateNoteTitle(e.target.value);
            });
        }

        // 笔记内容输入
        const noteContent = document.getElementById('note-content');
        if (noteContent) {
            noteContent.addEventListener('input', (e) => {
                this.updateNoteContent(e.target.value);
            });
        }

        // 搜索输入
        const searchInput = document.getElementById('notes-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchNotes(e.target.value);
            });
        }

        // 排序选择
        const sortSelect = document.getElementById('notes-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortNotes(e.target.value);
            });
        }

        // 筛选按钮
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.filterNotes(filter);
            });
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.createNewNote();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveCurrentNote();
                        break;
                    case 'f':
                        e.preventDefault();
                        const searchInput = document.getElementById('notes-search');
                        if (searchInput) searchInput.focus();
                        break;
                }
            }
        });
    }

    /**
     * 设置自动保存
     */
    setupAutoSave() {
        // 每30秒自动保存
        setInterval(() => {
            if (this.unsavedChanges && this.currentNote) {
                this.saveCurrentNote();
            }
        }, 30000);
    }

    /**
     * 加载所有笔记
     */
    loadNotes() {
        this.notes = window.dataManager.getAllNotes();
        this.sortNotes(this.currentSort);
    }

    /**
     * 创建新笔记
     */
    createNewNote() {
        // 保存当前笔记
        if (this.currentNote && this.unsavedChanges) {
            this.saveCurrentNote();
        }

        const newNote = {
            id: window.dataManager.generateId(),
            title: '新笔记',
            content: '',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: 0,
            isFavorite: false
        };

        // 保存到数据库
        window.dataManager.saveNote(newNote);
        
        // 更新本地数组
        this.notes.unshift(newNote);
        
        // 加载新笔记
        this.loadNote(newNote.id);
        
        // 刷新列表
        this.renderNotesList();
        
        // 聚焦标题输入框
        setTimeout(() => {
            const titleInput = document.getElementById('note-title');
            if (titleInput) {
                titleInput.select();
            }
        }, 100);
    }

    /**
     * 加载指定笔记
     */
    loadNote(noteId) {
        // 保存当前笔记
        if (this.currentNote && this.unsavedChanges) {
            this.saveCurrentNote();
        }

        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        this.currentNote = note;
        this.unsavedChanges = false;

        // 更新UI
        const titleInput = document.getElementById('note-title');
        const contentTextarea = document.getElementById('note-content');
        const wordCountSpan = document.getElementById('word-count');
        const lastModifiedSpan = document.getElementById('last-modified');

        if (titleInput) titleInput.value = note.title;
        if (contentTextarea) contentTextarea.value = note.content;
        if (wordCountSpan) wordCountSpan.textContent = note.wordCount;
        if (lastModifiedSpan) {
            lastModifiedSpan.textContent = window.dataManager.formatDate(note.updatedAt);
        }

        // 更新列表中的选中状态
        this.updateNoteSelection(noteId);
    }

    /**
     * 更新笔记标题
     */
    updateNoteTitle(title) {
        if (!this.currentNote) return;
        
        this.currentNote.title = title || '无标题';
        this.currentNote.updatedAt = new Date().toISOString();
        this.unsavedChanges = true;
        
        // 更新列表显示
        this.updateNoteInList(this.currentNote);
        
        // 延迟保存
        this.scheduleAutoSave();
    }

    /**
     * 更新笔记内容
     */
    updateNoteContent(content) {
        if (!this.currentNote) return;
        
        this.currentNote.content = content;
        this.currentNote.updatedAt = new Date().toISOString();
        this.currentNote.wordCount = window.dataManager.countWords(content);
        this.unsavedChanges = true;
        
        // 更新字数统计
        const wordCountSpan = document.getElementById('word-count');
        if (wordCountSpan) {
            wordCountSpan.textContent = this.currentNote.wordCount;
        }
        
        // 更新列表显示
        this.updateNoteInList(this.currentNote);
        
        // 延迟保存
        this.scheduleAutoSave();
    }

    /**
     * 计划自动保存
     */
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveCurrentNote();
        }, 2000); // 2秒后自动保存
    }

    /**
     * 保存当前笔记
     */
    saveCurrentNote() {
        if (!this.currentNote || !this.unsavedChanges) return;
        
        // 保存到数据库
        window.dataManager.saveNote(this.currentNote);
        
        // 更新本地数组
        const index = this.notes.findIndex(n => n.id === this.currentNote.id);
        if (index !== -1) {
            this.notes[index] = { ...this.currentNote };
        }
        
        this.unsavedChanges = false;
        
        // 更新最后修改时间显示
        const lastModifiedSpan = document.getElementById('last-modified');
        if (lastModifiedSpan) {
            lastModifiedSpan.textContent = window.dataManager.formatDate(this.currentNote.updatedAt);
        }
        
        // 重新排序（如果按更新时间排序）
        if (this.currentSort === 'updated') {
            this.sortNotes('updated');
            this.renderNotesList();
        }
    }

    /**
     * 删除笔记
     */
    deleteNote(noteId) {
        if (!confirm('确定要删除这条笔记吗？此操作无法撤销。')) {
            return;
        }
        
        // 从数据库删除
        window.dataManager.deleteNote(noteId);
        
        // 从本地数组删除
        this.notes = this.notes.filter(n => n.id !== noteId);
        
        // 如果删除的是当前笔记
        if (this.currentNote && this.currentNote.id === noteId) {
            this.currentNote = null;
            this.unsavedChanges = false;
            
            // 加载下一条笔记或创建新笔记
            if (this.notes.length > 0) {
                this.loadNote(this.notes[0].id);
            } else {
                this.createWelcomeNote();
            }
        }
        
        // 刷新列表
        this.renderNotesList();
    }

    /**
     * 切换笔记收藏状态
     */
    toggleNoteFavorite(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        note.isFavorite = !note.isFavorite;
        note.updatedAt = new Date().toISOString();
        
        // 保存到数据库
        window.dataManager.saveNote(note);
        
        // 如果是当前笔记，更新当前笔记对象
        if (this.currentNote && this.currentNote.id === noteId) {
            this.currentNote.isFavorite = note.isFavorite;
        }
        
        // 更新列表显示
        this.updateNoteInList(note);
    }

    /**
     * 搜索笔记
     */
    searchNotes(query) {
        this.searchQuery = query.toLowerCase();
        this.renderNotesList();
    }

    /**
     * 筛选笔记
     */
    filterNotes(filter) {
        this.currentFilter = filter;
        
        // 更新筛选按钮状态
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        this.renderNotesList();
    }

    /**
     * 排序笔记
     */
    sortNotes(sortBy) {
        this.currentSort = sortBy;
        
        this.notes.sort((a, b) => {
            switch (sortBy) {
                case 'updated':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'wordCount':
                    return b.wordCount - a.wordCount;
                default:
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
        });
        
        this.renderNotesList();
    }

    /**
     * 获取筛选后的笔记列表
     */
    getFilteredNotes() {
        let filteredNotes = [...this.notes];
        
        // 应用搜索筛选
        if (this.searchQuery) {
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(this.searchQuery) ||
                note.content.toLowerCase().includes(this.searchQuery) ||
                note.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // 应用分类筛选
        switch (this.currentFilter) {
            case 'recent':
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                filteredNotes = filteredNotes.filter(note => 
                    new Date(note.updatedAt) > oneWeekAgo
                );
                break;
            case 'favorites':
                filteredNotes = filteredNotes.filter(note => note.isFavorite);
                break;
            case 'all':
            default:
                // 不需要额外筛选
                break;
        }
        
        return filteredNotes;
    }

    /**
     * 渲染笔记列表
     */
    renderNotesList() {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;
        
        const filteredNotes = this.getFilteredNotes();
        
        if (filteredNotes.length === 0) {
            notesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <div class="empty-text">
                        ${this.searchQuery ? '没有找到匹配的笔记' : '还没有笔记'}
                    </div>
                    ${!this.searchQuery ? '<button class="btn btn-primary" onclick="window.notesManager.createNewNote()">创建第一条笔记</button>' : ''}
                </div>
            `;
            return;
        }
        
        notesList.innerHTML = filteredNotes.map(note => `
            <div class="note-item ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''}" 
                 data-note-id="${note.id}" 
                 onclick="window.notesManager.loadNote('${note.id}')">
                <div class="note-item-header">
                    <div class="note-title">${this.escapeHtml(note.title)}</div>
                    <div class="note-actions">
                        <button class="btn-icon ${note.isFavorite ? 'active' : ''}" 
                                onclick="event.stopPropagation(); window.notesManager.toggleNoteFavorite('${note.id}')" 
                                title="${note.isFavorite ? '取消收藏' : '收藏'}">
                            ${note.isFavorite ? '★' : '☆'}
                        </button>
                        <button class="btn-icon" 
                                onclick="event.stopPropagation(); window.notesManager.deleteNote('${note.id}')" 
                                title="删除">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="note-preview">${this.escapeHtml(note.content.substring(0, 100))}${note.content.length > 100 ? '...' : ''}</div>
                <div class="note-meta">
                    <span class="note-date">${window.dataManager.formatDate(note.updatedAt)}</span>
                    <span class="note-word-count">${note.wordCount} 字</span>
                    ${note.tags.length > 0 ? `<span class="note-tags">${note.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * 更新笔记选中状态
     */
    updateNoteSelection(noteId) {
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            if (item.getAttribute('data-note-id') === noteId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * 更新列表中的笔记显示
     */
    updateNoteInList(note) {
        const noteItem = document.querySelector(`[data-note-id="${note.id}"]`);
        if (noteItem) {
            // 更新标题
            const titleElement = noteItem.querySelector('.note-title');
            if (titleElement) {
                titleElement.textContent = note.title;
            }
            
            // 更新预览
            const previewElement = noteItem.querySelector('.note-preview');
            if (previewElement) {
                const preview = note.content.substring(0, 100);
                previewElement.textContent = preview + (note.content.length > 100 ? '...' : '');
            }
            
            // 更新元数据
            const dateElement = noteItem.querySelector('.note-date');
            if (dateElement) {
                dateElement.textContent = window.dataManager.formatDate(note.updatedAt);
            }
            
            const wordCountElement = noteItem.querySelector('.note-word-count');
            if (wordCountElement) {
                wordCountElement.textContent = `${note.wordCount} 字`;
            }
        }
    }

    /**
     * 创建欢迎笔记
     */
    createWelcomeNote() {
        const welcomeNote = {
            id: window.dataManager.generateId(),
            title: '欢迎使用智能笔记',
            content: `欢迎使用智能笔记应用！\n\n这是一个功能丰富的笔记应用，具有以下特性：\n\n📝 **笔记管理**\n- 创建、编辑、删除笔记\n- 实时自动保存\n- 搜索和筛选功能\n\n🤖 **AI功能**\n- 自动生成标题\n- 内容润色\n- 智能标签建议\n\n✅ **待办事项**\n- 任务管理\n- 优先级设置\n- 完成状态跟踪\n\n💬 **AI对话**\n- 智能助手\n- 问题解答\n- 创意灵感\n\n🍅 **番茄钟**\n- 专注计时\n- 休息提醒\n- 效率统计\n\n📊 **项目管理**\n- 项目组织\n- 进度跟踪\n- 团队协作\n\n开始使用快捷键：\n- Ctrl+N：新建笔记\n- Ctrl+S：保存笔记\n- Ctrl+F：搜索笔记\n\n现在就开始创建你的第一条笔记吧！`,
            tags: ['欢迎', '使用指南'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            wordCount: 0,
            isFavorite: false
        };
        
        welcomeNote.wordCount = window.dataManager.countWords(welcomeNote.content);
        
        // 保存到数据库
        window.dataManager.saveNote(welcomeNote);
        
        // 更新本地数组
        this.notes.unshift(welcomeNote);
        
        // 加载欢迎笔记
        this.loadNote(welcomeNote.id);
        
        // 刷新列表
        this.renderNotesList();
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
     * 刷新笔记列表
     */
    refreshNotesList() {
        this.loadNotes();
        this.renderNotesList();
    }

    /**
     * 预加载笔记
     */
    preloadNotes() {
        // 预加载逻辑（如果需要）
        this.loadNotes();
    }

    /**
     * 检查是否有未保存的更改
     */
    hasUnsavedChanges() {
        return this.unsavedChanges;
    }

    /**
     * 获取当前笔记
     */
    getCurrentNote() {
        return this.currentNote;
    }

    /**
     * 获取所有笔记
     */
    getAllNotes() {
        return this.notes;
    }

    /**
     * 导出笔记
     */
    exportNote(noteId, format = 'txt') {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        let content = '';
        let filename = '';
        
        switch (format) {
            case 'txt':
                content = `${note.title}\n\n${note.content}`;
                filename = `${note.title}.txt`;
                break;
            case 'md':
                content = `# ${note.title}\n\n${note.content}`;
                filename = `${note.title}.md`;
                break;
            case 'json':
                content = JSON.stringify(note, null, 2);
                filename = `${note.title}.json`;
                break;
        }
        
        // 创建下载链接
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 导入笔记
     */
    importNotes(files) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let noteData;
                    
                    if (file.name.endsWith('.json')) {
                        noteData = JSON.parse(e.target.result);
                    } else {
                        // 文本文件
                        const content = e.target.result;
                        const lines = content.split('\n');
                        const title = lines[0] || file.name.replace(/\.[^/.]+$/, '');
                        const noteContent = lines.slice(1).join('\n').trim();
                        
                        noteData = {
                            title: title,
                            content: noteContent,
                            tags: [],
                            isFavorite: false
                        };
                    }
                    
                    // 创建新笔记
                    const newNote = {
                        id: window.dataManager.generateId(),
                        title: noteData.title || '导入的笔记',
                        content: noteData.content || '',
                        tags: noteData.tags || [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        wordCount: window.dataManager.countWords(noteData.content || ''),
                        isFavorite: noteData.isFavorite || false
                    };
                    
                    // 保存笔记
                    window.dataManager.saveNote(newNote);
                    this.notes.unshift(newNote);
                    
                    // 刷新列表
                    this.renderNotesList();
                    
                } catch (error) {
                    console.error('导入笔记失败:', error);
                    alert(`导入文件 ${file.name} 失败：${error.message}`);
                }
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * 获取笔记统计信息
     */
    getNotesStats() {
        const totalNotes = this.notes.length;
        const totalWords = this.notes.reduce((sum, note) => sum + note.wordCount, 0);
        const favoriteNotes = this.notes.filter(note => note.isFavorite).length;
        const recentNotes = this.notes.filter(note => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(note.updatedAt) > oneWeekAgo;
        }).length;
        
        return {
            totalNotes,
            totalWords,
            favoriteNotes,
            recentNotes,
            averageWords: totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0
        };
    }

    /**
     * 销毁笔记管理器
     */
    destroy() {
        // 保存当前笔记
        if (this.currentNote && this.unsavedChanges) {
            this.saveCurrentNote();
        }
        
        // 清除定时器
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        // 清除数据
        this.currentNote = null;
        this.notes = [];
        this.unsavedChanges = false;
    }
}

// 创建全局笔记管理器实例
window.notesManager = new NotesManager();