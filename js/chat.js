/**
 * AI对话页面功能模块
 * 处理AI对话页面的UI交互和事件绑定
 */

class ChatPage {
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
        // 发送消息按钮
        const sendBtn = document.getElementById('send-message-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // 消息输入框回车发送
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // 新建对话按钮
        const newChatBtn = document.getElementById('new-chat-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                this.createNewChat();
            });
        }

        // 清空对话按钮
        const clearChatBtn = document.getElementById('clear-chat-btn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => {
                this.clearCurrentChat();
            });
        }
    }

    /**
     * 设置UI
     */
    setupUI() {
        this.updateChatList();
        this.loadCurrentChat();
    }

    /**
     * 发送消息
     */
    sendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;

        const message = messageInput.value.trim();
        if (!message) return;

        if (window.chatManager) {
            window.chatManager.sendMessage(message);
            messageInput.value = '';
        }
    }

    /**
     * 创建新对话
     */
    createNewChat() {
        if (window.chatManager) {
            window.chatManager.createNewConversation();
        }
    }

    /**
     * 清空当前对话
     */
    clearCurrentChat() {
        if (window.chatManager) {
            if (confirm('确定要清空当前对话吗？此操作不可撤销。')) {
                window.chatManager.clearCurrentConversation();
            }
        }
    }

    /**
     * 更新对话列表
     */
    updateChatList() {
        if (window.chatManager) {
            window.chatManager.renderConversationsList();
        }
    }

    /**
     * 加载当前对话
     */
    loadCurrentChat() {
        if (window.chatManager) {
            window.chatManager.renderCurrentConversation();
        }
    }

    /**
     * 显示页面
     */
    show() {
        const chatPage = document.getElementById('chat-page');
        if (chatPage) {
            chatPage.style.display = 'block';
        }
        this.loadCurrentChat();
        
        // 聚焦到输入框
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.focus();
        }
    }

    /**
     * 隐藏页面
     */
    hide() {
        const chatPage = document.getElementById('chat-page');
        if (chatPage) {
            chatPage.style.display = 'none';
        }
    }

    /**
     * 滚动到消息底部
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    /**
     * 添加消息到界面
     */
    addMessageToUI(message, isUser = true) {
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        messageElement.innerHTML = `
            <div class="message-content">
                ${this.escapeHtml(message)}
            </div>
            <div class="message-time">
                ${new Date().toLocaleTimeString()}
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    /**
     * 转义HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 创建全局实例
window.chatPage = new ChatPage();