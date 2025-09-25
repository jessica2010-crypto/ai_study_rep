/**
 * AI功能管理模块 - 负责AI相关功能
 */
class AIManager {
    constructor() {
        this.isProcessing = false;
        this.apiEndpoint = null; // 实际项目中需要配置真实的AI API
        this.mockMode = true; // 使用模拟模式
        
        this.init();
    }

    /**
     * 初始化AI管理器
     */
    init() {
        this.bindEvents();
        console.log('AI管理器已初始化');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // AI标题生成按钮
        const generateTitleBtn = document.getElementById('generate-title-btn');
        if (generateTitleBtn) {
            generateTitleBtn.addEventListener('click', () => {
                this.generateTitle();
            });
        }

        // AI内容润色按钮
        const polishContentBtn = document.getElementById('polish-content-btn');
        if (polishContentBtn) {
            polishContentBtn.addEventListener('click', () => {
                this.polishContent();
            });
        }

        // AI标签建议按钮
        const suggestTagsBtn = document.getElementById('suggest-tags-btn');
        if (suggestTagsBtn) {
            suggestTagsBtn.addEventListener('click', () => {
                this.suggestTags();
            });
        }

        // 应用润色结果按钮
        const applyPolishBtn = document.getElementById('apply-polish-btn');
        if (applyPolishBtn) {
            applyPolishBtn.addEventListener('click', () => {
                this.applyPolishedContent();
            });
        }

        // 应用标签建议按钮
        const applyTagsBtn = document.getElementById('apply-tags-btn');
        if (applyTagsBtn) {
            applyTagsBtn.addEventListener('click', () => {
                this.applyTagSuggestions();
            });
        }

        // 关闭模态框
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    /**
     * 生成标题
     */
    async generateTitle() {
        if (this.isProcessing) return;
        
        const content = document.getElementById('note-content')?.value;
        if (!content || !content.trim()) {
            window.app?.showNotification('请先输入笔记内容', 'warning');
            return;
        }

        this.isProcessing = true;
        this.showProcessingState('generate-title-btn', '生成中...');

        try {
            const generatedTitle = await this.callAI('generateTitle', {
                content: content
            });

            if (generatedTitle) {
                // 更新标题输入框
                const titleInput = document.getElementById('title-input');
                if (titleInput) {
                    titleInput.value = generatedTitle;
                    titleInput.dispatchEvent(new Event('input'));
                }
                
                window.app?.showNotification('标题已生成', 'success');
            }
        } catch (error) {
            console.error('生成标题失败:', error);
            window.app?.showNotification('生成标题失败，请重试', 'error');
        } finally {
            this.isProcessing = false;
            this.hideProcessingState('generate-title-btn', '✨ 生成标题');
        }
    }

    /**
     * 润色内容
     */
    async polishContent() {
        if (this.isProcessing) return;
        
        const content = document.getElementById('note-content')?.value;
        if (!content || !content.trim()) {
            window.app?.showNotification('请先输入笔记内容', 'warning');
            return;
        }

        this.isProcessing = true;
        this.showProcessingState('polish-content-btn', '润色中...');

        try {
            const polishedContent = await this.callAI('polishContent', {
                content: content
            });

            if (polishedContent) {
                // 显示润色结果对比
                this.showPolishResult(content, polishedContent);
            }
        } catch (error) {
            console.error('内容润色失败:', error);
            window.app?.showNotification('内容润色失败，请重试', 'error');
        } finally {
            this.isProcessing = false;
            this.hideProcessingState('polish-content-btn', '✨ 内容润色');
        }
    }

    /**
     * 建议标签
     */
    async suggestTags() {
        if (this.isProcessing) return;
        
        const title = document.getElementById('title-input')?.value || '';
        const content = document.getElementById('note-content')?.value;
        if (!content || !content.trim()) {
            window.app?.showNotification('请先输入笔记内容', 'warning');
            return;
        }

        this.isProcessing = true;
        this.showProcessingState('suggest-tags-btn', '分析中...');

        try {
            const suggestedTags = await this.callAI('suggestTags', {
                title: title,
                content: content
            });

            if (suggestedTags && suggestedTags.length > 0) {
                this.showTagSuggestions(suggestedTags);
            }
        } catch (error) {
            console.error('标签建议失败:', error);
            window.app?.showNotification('标签建议失败，请重试', 'error');
        } finally {
            this.isProcessing = false;
            this.hideProcessingState('suggest-tags-btn', '🏷️ 标签建议');
        }
    }

    /**
     * 调用AI API
     */
    async callAI(action, data) {
        if (this.mockMode) {
            return this.mockAIResponse(action, data);
        }
        
        // 实际API调用逻辑
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAPIKey()}`
            },
            body: JSON.stringify({
                action: action,
                data: data
            })
        });
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data;
    }

    /**
     * 模拟AI响应
     */
    async mockAIResponse(action, data) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        switch (action) {
            case 'generateTitle':
                return this.mockGenerateTitle(data.content);
            case 'polishContent':
                return this.mockPolishContent(data.content);
            case 'suggestTags':
                return this.mockSuggestTags(data.title, data.content);
            default:
                throw new Error('未知的AI操作');
        }
    }

    /**
     * 模拟标题生成
     */
    mockGenerateTitle(content) {
        const words = content.split(/\s+/).slice(0, 10);
        const keywords = words.filter(word => word.length > 2);
        
        const titleTemplates = [
            `关于${keywords[0] || '主题'}的思考`,
            `${keywords[0] || '重要'}笔记`,
            `${keywords[0] || '学习'}总结`,
            `${keywords[0] || '工作'}记录`,
            `${keywords.slice(0, 2).join('与') || '日常'}笔记`
        ];
        
        return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
    }

    /**
     * 模拟内容润色
     */
    mockPolishContent(content) {
        // 简单的文本改进模拟
        let polished = content
            .replace(/。。+/g, '。')
            .replace(/，，+/g, '，')
            .replace(/\s+/g, ' ')
            .replace(/([。！？])([^\s])/g, '$1 $2')
            .trim();
        
        // 添加一些改进建议
        const improvements = [
            '调整了标点符号的使用',
            '优化了语句结构',
            '改善了段落格式',
            '增强了表达的清晰度'
        ];
        
        return {
            content: polished,
            improvements: improvements.slice(0, Math.floor(Math.random() * 3) + 1)
        };
    }

    /**
     * 模拟标签建议
     */
    mockSuggestTags(title, content) {
        const text = (title + ' ' + content).toLowerCase();
        const possibleTags = {
            '工作': ['工作', '职场', '项目'],
            '学习': ['学习', '教育', '知识'],
            '生活': ['生活', '日常', '个人'],
            '技术': ['技术', '编程', '开发'],
            '思考': ['思考', '反思', '总结'],
            '计划': ['计划', '目标', '规划'],
            '会议': ['会议', '讨论', '决策'],
            '阅读': ['阅读', '书籍', '文章']
        };
        
        const suggestedTags = [];
        
        for (const [keyword, tags] of Object.entries(possibleTags)) {
            if (text.includes(keyword)) {
                suggestedTags.push(...tags);
            }
        }
        
        // 去重并限制数量
        return [...new Set(suggestedTags)].slice(0, 5);
    }

    /**
     * 显示处理状态
     */
    showProcessingState(buttonId, text) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = true;
            button.textContent = text;
            button.classList.add('processing');
        }
    }

    /**
     * 隐藏处理状态
     */
    hideProcessingState(buttonId, originalText) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
            button.classList.remove('processing');
        }
    }

    /**
     * 显示润色结果
     */
    showPolishResult(originalContent, polishedResult) {
        // 保存润色后的内容供后续使用
        this.polishedContent = polishedResult.content;
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'polish-result-modal';
        modal.innerHTML = `
            <div class="modal-content polish-result-modal">
                <div class="modal-header">
                    <h2>内容润色结果</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="polish-comparison">
                        <div class="original-content">
                            <h3>原始内容</h3>
                            <div class="content-box" id="original-content">${this.escapeHtml(originalContent)}</div>
                        </div>
                        <div class="polished-content">
                            <h3>润色后内容</h3>
                            <div class="content-box" id="polished-content">${this.escapeHtml(polishedResult.content)}</div>
                        </div>
                    </div>
                    <div class="improvements">
                        <h3>改进说明</h3>
                        <ul id="improvements-list"></ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.aiManager.applyPolishedContent(); this.closest('.modal').remove();">应用润色</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // 生成改进说明
        const improvementsList = document.getElementById('improvements-list');
        if (improvementsList) {
            improvementsList.innerHTML = '';
            const improvements = this.generateImprovements(originalContent, polishedResult.content);
            improvements.forEach(improvement => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${improvement.type}:</strong> ${improvement.description}`;
                improvementsList.appendChild(li);
            });
        }
    }

    /**
     * 应用润色后的内容
     */
    applyPolishedContent() {
        if (!this.polishedContent) return;
        
        const noteContent = document.getElementById('note-content');
        if (noteContent) {
            noteContent.value = this.polishedContent;
            
            // 如果有笔记管理器，更新当前笔记
            if (window.notesManager) {
                const currentNote = window.notesManager.getCurrentNote();
                if (currentNote) {
                    currentNote.content = this.polishedContent;
                    window.notesManager.saveNote(currentNote);
                }
            }
            
            // 关闭模态框
            const modal = document.getElementById('polish-result-modal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            window.app?.showNotification('润色内容已应用', 'success');
        }
    }

    /**
     * 显示标签建议
     */
    showTagSuggestions(suggestedTags) {
        const modal = document.getElementById('tag-suggestions-modal');
        if (!modal) return;
        
        // 保存建议的标签
        this.suggestedTags = suggestedTags;
        
        const container = document.getElementById('suggested-tags-list');
        if (!container) return;
        
        container.innerHTML = suggestedTags.map(tag => 
            `<div class="suggested-tag" data-tag="${tag}">
                <span class="tag-name">${tag}</span>
                <button class="tag-add-btn" onclick="window.aiManager.addSuggestedTag('${tag}')">
                    <i class="icon-add">+</i>
                </button>
            </div>`
        ).join('');
        
        modal.style.display = 'flex';
    }

    /**
     * 添加标签
     */
    addTag(tag) {
        const currentNote = window.notesManager?.getCurrentNote();
        if (!currentNote) return;
        
        if (!currentNote.tags.includes(tag)) {
            currentNote.tags.push(tag);
            currentNote.updatedAt = new Date().toISOString();
            
            // 保存笔记
            window.dataManager.saveNote(currentNote);
            
            // 更新UI（如果有标签显示区域）
            this.updateTagsDisplay(currentNote.tags);
            
            window.app?.showNotification(`标签 "${tag}" 已添加`, 'success');
        } else {
            window.app?.showNotification(`标签 "${tag}" 已存在`, 'info');
        }
    }

    /**
     * 添加建议的标签
     */
    addSuggestedTag(tag) {
        this.addTag(tag);
        
        // 从建议列表中移除已添加的标签
        const tagElement = document.querySelector(`[data-tag="${tag}"]`);
        if (tagElement) {
            tagElement.remove();
        }
        
        // 检查是否还有未添加的标签
        const remainingTags = document.querySelectorAll('.suggested-tag');
        if (remainingTags.length === 0) {
            const modal = document.getElementById('tag-suggestions-modal');
            if (modal) {
                modal.style.display = 'none';
            }
        }
    }

    /**
      * 应用标签建议
      */
     applyTagSuggestions() {
         if (!this.suggestedTags) return;
         
         let addedCount = 0;
         this.suggestedTags.forEach(tag => {
             if (window.notesManager) {
                 window.notesManager.addTag(tag);
                 addedCount++;
             }
         });
         
         if (addedCount > 0) {
             window.app?.showNotification(`已添加 ${addedCount} 个标签`, 'success');
         }
         
         // 关闭模态框
         const modal = document.getElementById('tag-suggestions-modal');
         if (modal) {
             modal.style.display = 'none';
         }
     }

     /**
      * 添加所有建议的标签
      */
     addAllSuggestedTags() {
         if (!this.suggestedTags) return;
         
         let addedCount = 0;
         this.suggestedTags.forEach(tag => {
             const currentNote = window.notesManager?.getCurrentNote();
             if (currentNote && !currentNote.tags.includes(tag)) {
                 currentNote.tags.push(tag);
                 addedCount++;
             }
         });
         
         if (addedCount > 0) {
             const currentNote = window.notesManager?.getCurrentNote();
             if (currentNote) {
                 currentNote.updatedAt = new Date().toISOString();
                 window.dataManager.saveNote(currentNote);
                 this.updateTagsDisplay(currentNote.tags);
             }
             
             window.app?.showNotification(`已添加 ${addedCount} 个标签`, 'success');
         }
         
         // 关闭模态框
         const modal = document.getElementById('tag-suggestions-modal');
         if (modal) {
             modal.style.display = 'none';
         }
     }

    /**
     * 更新标签显示
     */
    updateTagsDisplay(tags) {
        const tagsContainer = document.getElementById('note-tags');
        if (tagsContainer) {
            tagsContainer.innerHTML = tags.map(tag => `
                <span class="tag">
                    ${this.escapeHtml(tag)}
                    <button class="tag-remove" onclick="window.aiManager.removeTag('${this.escapeForAttribute(tag)}')">&times;</button>
                </span>
            `).join('');
        }
    }

    /**
     * 移除标签
     */
    removeTag(tag) {
        const currentNote = window.notesManager?.getCurrentNote();
        if (!currentNote) return;
        
        const index = currentNote.tags.indexOf(tag);
        if (index > -1) {
            currentNote.tags.splice(index, 1);
            currentNote.updatedAt = new Date().toISOString();
            
            // 保存笔记
            window.dataManager.saveNote(currentNote);
            
            // 更新UI
            this.updateTagsDisplay(currentNote.tags);
            
            window.app?.showNotification(`标签 "${tag}" 已移除`, 'success');
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
     * 获取API密钥
     */
    getAPIKey() {
        const settings = window.dataManager?.getSettings();
        return settings?.aiApiKey || '';
    }

    /**
     * 设置API配置
     */
    setAPIConfig(endpoint, apiKey) {
        this.apiEndpoint = endpoint;
        this.mockMode = !endpoint;
        
        const settings = window.dataManager?.getSettings() || {};
        settings.aiApiEndpoint = endpoint;
        settings.aiApiKey = apiKey;
        window.dataManager?.saveSettings(settings);
    }

    /**
     * 检查AI功能是否可用
     */
    isAIAvailable() {
        return this.mockMode || (this.apiEndpoint && this.getAPIKey());
    }

    /**
     * 获取AI使用统计
     */
    getUsageStats() {
        const settings = window.dataManager?.getSettings() || {};
        return {
            titleGenerated: settings.aiTitleGenerated || 0,
            contentPolished: settings.aiContentPolished || 0,
            tagsGenerated: settings.aiTagsGenerated || 0
        };
    }

    /**
     * 生成改进说明
     */
    generateImprovements(original, polished) {
        const improvements = [];

        if (polished.length > original.length) {
            improvements.push({
                type: '内容扩展',
                description: '添加了更详细的说明和补充信息'
            });
        }

        if (polished.includes('\n\n') && !original.includes('\n\n')) {
            improvements.push({
                type: '格式优化',
                description: '改善了段落结构，提高了可读性'
            });
        }

        if (polished.includes('##') || polished.includes('**')) {
            improvements.push({
                type: '结构化',
                description: '添加了标题和重点标记，使内容更有条理'
            });
        }

        improvements.push({
            type: '语言润色',
            description: '优化了表达方式，使语言更加流畅自然'
        });

        return improvements;
    }

    /**
     * 更新使用统计
     */
    updateUsageStats(action) {
        const settings = window.dataManager?.getSettings() || {};
        
        switch (action) {
            case 'generateTitle':
                settings.aiTitleGenerated = (settings.aiTitleGenerated || 0) + 1;
                break;
            case 'polishContent':
                settings.aiContentPolished = (settings.aiContentPolished || 0) + 1;
                break;
            case 'suggestTags':
                settings.aiTagsGenerated = (settings.aiTagsGenerated || 0) + 1;
                break;
        }
        
        window.dataManager?.saveSettings(settings);
    }

    /**
     * 批量处理笔记
     */
    async batchProcess(notes, action) {
        const results = [];
        
        for (let i = 0; i < notes.length; i++) {
            const note = notes[i];
            
            try {
                const result = await this.callAI(action, {
                    title: note.title,
                    content: note.content
                });
                
                results.push({
                    noteId: note.id,
                    success: true,
                    result: result
                });
                
            } catch (error) {
                results.push({
                    noteId: note.id,
                    success: false,
                    error: error.message
                });
            }
            
            // 显示进度
            const progress = Math.round(((i + 1) / notes.length) * 100);
            window.app?.showNotification(`处理进度: ${progress}%`, 'info', 1000);
        }
        
        return results;
    }

    /**
     * 销毁AI管理器
     */
    destroy() {
        this.isProcessing = false;
        console.log('AI管理器已销毁');
    }
}

// 创建全局AI管理器实例
window.aiManager = new AIManager();