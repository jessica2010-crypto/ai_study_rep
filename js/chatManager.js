/**
 * AI对话管理器
 * 负责处理AI对话功能，包括对话历史、上下文管理、消息发送等
 */
class ChatManager {
    constructor() {
        this.conversations = [];
        this.currentConversation = null;
        this.isTyping = false;
        this.init();
    }

    /**
     * 初始化对话管理器
     */
    init() {
        this.loadConversations();
        this.bindEvents();
        this.setupUI();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 发送消息
        const sendBtn = document.getElementById('send-message');
        const messageInput = document.getElementById('message-input');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // 自动调整输入框高度
            messageInput.addEventListener('input', () => {
                this.adjustInputHeight(messageInput);
            });
        }
        
        // 新建对话
        const newChatBtn = document.getElementById('new-chat');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.createNewConversation());
        }
        
        // 清空对话
        const clearChatBtn = document.getElementById('clear-chat');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearCurrentConversation());
        }
        
        // 导出对话
        const exportChatBtn = document.getElementById('export-chat');
        if (exportChatBtn) {
            exportChatBtn.addEventListener('click', () => this.exportConversation());
        }
    }

    /**
     * 设置UI
     */
    setupUI() {
        this.updateConversationsList();
        if (this.conversations.length === 0) {
            this.createNewConversation();
        } else {
            this.loadConversation(this.conversations[0].id);
        }
    }

    /**
     * 创建新对话
     */
    createNewConversation() {
        const conversation = {
            id: Date.now().toString(),
            title: '新对话',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.conversations.unshift(conversation);
        this.currentConversation = conversation;
        this.saveConversations();
        this.updateConversationsList();
        this.renderMessages();
        
        // 发送欢迎消息
        this.addSystemMessage('你好！我是你的AI助手，有什么可以帮助你的吗？');
    }

    /**
     * 加载对话
     */
    loadConversation(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (conversation) {
            this.currentConversation = conversation;
            this.renderMessages();
            this.updateConversationsList();
        }
    }

    /**
     * 发送消息
     */
    async sendMessage() {
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // 添加用户消息
        this.addMessage('user', message);
        messageInput.value = '';
        this.adjustInputHeight(messageInput);
        
        // 显示AI正在输入
        this.showTypingIndicator();
        
        try {
            // 模拟AI响应
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage('assistant', response);
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('system', '抱歉，AI服务暂时不可用，请稍后再试。');
        }
    }

    /**
     * 获取AI响应（模拟）
     */
    async getAIResponse(message) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // 简单的响应逻辑
        const responses = {
            '你好': '你好！很高兴见到你！',
            '帮助': '我可以帮助你管理笔记、待办事项，或者回答各种问题。你想了解什么？',
            '功能': '我的主要功能包括：\n1. 智能对话交流\n2. 笔记管理辅助\n3. 待办事项建议\n4. 内容创作帮助\n5. 问题解答',
            '再见': '再见！有需要随时找我聊天！'
        };
        
        // 检查关键词
        for (const [keyword, response] of Object.entries(responses)) {
            if (message.includes(keyword)) {
                return response;
            }
        }
        
        // 默认响应
        const defaultResponses = [
            '这是一个很有趣的问题！让我想想...',
            '我理解你的意思，这确实值得深入思考。',
            '从我的角度来看，这个问题可以从多个方面来分析。',
            '你提出了一个很好的观点！',
            '这让我想到了一些相关的想法...'
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    /**
     * 添加消息
     */
    addMessage(role, content) {
        if (!this.currentConversation) return;
        
        const message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        
        this.currentConversation.messages.push(message);
        this.currentConversation.updatedAt = new Date().toISOString();
        
        // 更新对话标题
        if (this.currentConversation.messages.length === 2) { // 第一条用户消息后
            const firstUserMessage = this.currentConversation.messages.find(m => m.role === 'user');
            if (firstUserMessage) {
                this.currentConversation.title = firstUserMessage.content.substring(0, 20) + '...';
            }
        }
        
        this.saveConversations();
        this.renderMessages();
        this.updateConversationsList();
    }

    /**
     * 添加系统消息
     */
    addSystemMessage(content) {
        this.addMessage('system', content);
    }

    /**
     * 显示输入指示器
     */
    showTypingIndicator() {
        this.isTyping = true;
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * 隐藏输入指示器
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * 渲染消息
     */
    renderMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer || !this.currentConversation) return;
        
        messagesContainer.innerHTML = '';
        
        this.currentConversation.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.role}`;
            
            const time = new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${this.formatMessageContent(message.content)}
                </div>
                <div class="message-time">${time}</div>
            `;
            
            messagesContainer.appendChild(messageDiv);
        });
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * 格式化消息内容
     */
    formatMessageContent(content) {
        // 处理换行
        content = content.replace(/\n/g, '<br>');
        
        // 处理代码块
        content = content.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // 处理行内代码
        content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        return content;
    }

    /**
     * 更新对话列表
     */
    updateConversationsList() {
        const conversationsList = document.getElementById('conversations-list');
        if (!conversationsList) return;
        
        conversationsList.innerHTML = '';
        
        this.conversations.forEach(conversation => {
            const conversationDiv = document.createElement('div');
            conversationDiv.className = 'conversation-item';
            if (this.currentConversation && conversation.id === this.currentConversation.id) {
                conversationDiv.classList.add('active');
            }
            
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            const preview = lastMessage ? lastMessage.content.substring(0, 30) + '...' : '暂无消息';
            
            conversationDiv.innerHTML = `
                <div class="conversation-title">${conversation.title}</div>
                <div class="conversation-preview">${preview}</div>
                <div class="conversation-time">${this.formatTime(conversation.updatedAt)}</div>
                <button class="delete-conversation" data-id="${conversation.id}">×</button>
            `;
            
            conversationDiv.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-conversation')) {
                    this.loadConversation(conversation.id);
                }
            });
            
            const deleteBtn = conversationDiv.querySelector('.delete-conversation');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteConversation(conversation.id);
            });
            
            conversationsList.appendChild(conversationDiv);
        });
    }

    /**
     * 删除对话
     */
    deleteConversation(conversationId) {
        if (this.conversations.length <= 1) {
            alert('至少需要保留一个对话');
            return;
        }
        
        if (confirm('确定要删除这个对话吗？')) {
            this.conversations = this.conversations.filter(c => c.id !== conversationId);
            
            if (this.currentConversation && this.currentConversation.id === conversationId) {
                this.currentConversation = this.conversations[0];
                this.renderMessages();
            }
            
            this.saveConversations();
            this.updateConversationsList();
        }
    }

    /**
     * 清空当前对话
     */
    clearCurrentConversation() {
        if (!this.currentConversation) return;
        
        if (confirm('确定要清空当前对话吗？')) {
            this.currentConversation.messages = [];
            this.currentConversation.updatedAt = new Date().toISOString();
            this.saveConversations();
            this.renderMessages();
            this.addSystemMessage('对话已清空，让我们重新开始吧！');
        }
    }

    /**
     * 导出对话
     */
    exportConversation() {
        if (!this.currentConversation || this.currentConversation.messages.length === 0) {
            alert('当前对话为空，无法导出');
            return;
        }
        
        let content = `对话标题: ${this.currentConversation.title}\n`;
        content += `创建时间: ${new Date(this.currentConversation.createdAt).toLocaleString('zh-CN')}\n`;
        content += `更新时间: ${new Date(this.currentConversation.updatedAt).toLocaleString('zh-CN')}\n\n`;
        
        this.currentConversation.messages.forEach(message => {
            const role = message.role === 'user' ? '用户' : message.role === 'assistant' ? 'AI助手' : '系统';
            const time = new Date(message.timestamp).toLocaleString('zh-CN');
            content += `[${time}] ${role}: ${message.content}\n\n`;
        });
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `对话_${this.currentConversation.title}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 调整输入框高度
     */
    adjustInputHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    /**
     * 格式化时间
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return Math.floor(diff / 60000) + '分钟前';
        } else if (diff < 86400000) { // 1天内
            return Math.floor(diff / 3600000) + '小时前';
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    /**
     * 加载对话数据
     */
    loadConversations() {
        try {
            const data = window.dataManager.getData('conversations');
            this.conversations = data || [];
        } catch (error) {
            console.error('加载对话数据失败:', error);
            this.conversations = [];
        }
    }

    /**
     * 保存对话数据
     */
    saveConversations() {
        try {
            window.dataManager.saveData('conversations', this.conversations);
        } catch (error) {
            console.error('保存对话数据失败:', error);
        }
    }

    /**
     * 搜索对话
     */
    searchConversations(query) {
        if (!query) {
            this.updateConversationsList();
            return;
        }
        
        const filtered = this.conversations.filter(conversation => {
            return conversation.title.toLowerCase().includes(query.toLowerCase()) ||
                   conversation.messages.some(message => 
                       message.content.toLowerCase().includes(query.toLowerCase())
                   );
        });
        
        // 临时更新显示
        const conversationsList = document.getElementById('conversations-list');
        if (conversationsList) {
            conversationsList.innerHTML = '';
            filtered.forEach(conversation => {
                // 使用相同的渲染逻辑
                // ...
            });
        }
    }

    /**
     * 获取对话统计
     */
    getStats() {
        return {
            totalConversations: this.conversations.length,
            totalMessages: this.conversations.reduce((sum, conv) => sum + conv.messages.length, 0),
            averageMessagesPerConversation: this.conversations.length > 0 ? 
                Math.round(this.conversations.reduce((sum, conv) => sum + conv.messages.length, 0) / this.conversations.length) : 0
        };
    }
}

// 创建全局实例
window.chatManager = new ChatManager();