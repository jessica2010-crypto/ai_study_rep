/**
 * 番茄钟页面功能模块
 * 处理番茄钟页面的UI交互和事件绑定
 */

class TimerPage {
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
        // 开始/暂停按钮
        const startPauseBtn = document.getElementById('start-pause-btn');
        if (startPauseBtn) {
            startPauseBtn.addEventListener('click', () => {
                this.toggleTimer();
            });
        }

        // 重置按钮
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetTimer();
            });
        }

        // 设置按钮
        const settingsBtn = document.getElementById('timer-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // 模式切换按钮
        const modeBtns = document.querySelectorAll('.mode-btn');
        modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });
    }

    /**
     * 设置UI
     */
    setupUI() {
        this.updateTimerDisplay();
        this.updateStats();
    }

    /**
     * 切换计时器状态
     */
    toggleTimer() {
        if (window.pomodoroManager) {
            if (window.pomodoroManager.isRunning) {
                window.pomodoroManager.pauseTimer();
            } else {
                window.pomodoroManager.startTimer();
            }
        }
    }

    /**
     * 重置计时器
     */
    resetTimer() {
        if (window.pomodoroManager) {
            window.pomodoroManager.resetTimer();
        }
    }

    /**
     * 切换模式
     */
    switchMode(mode) {
        if (window.pomodoroManager) {
            window.pomodoroManager.switchMode(mode);
        }
        
        // 更新模式按钮状态
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');
    }

    /**
     * 显示设置
     */
    showSettings() {
        const settingsModal = document.getElementById('timer-settings-modal');
        if (settingsModal) {
            settingsModal.style.display = 'flex';
        }
    }

    /**
     * 更新计时器显示
     */
    updateTimerDisplay() {
        if (window.pomodoroManager) {
            const timeLeft = window.pomodoroManager.getTimeLeft();
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            const timerDisplay = document.getElementById('timer-display');
            if (timerDisplay) {
                timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // 更新按钮文本
            const startPauseBtn = document.getElementById('start-pause-btn');
            if (startPauseBtn) {
                startPauseBtn.textContent = window.pomodoroManager.isRunning ? '暂停' : '开始';
            }
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        if (window.pomodoroManager) {
            const stats = window.pomodoroManager.getStats();
            this.displayStats(stats);
        }
    }

    /**
     * 显示统计信息
     */
    displayStats(stats) {
        const todaySessionsElement = document.getElementById('today-sessions');
        const totalSessionsElement = document.getElementById('total-sessions');
        const focusTimeElement = document.getElementById('focus-time');

        if (todaySessionsElement) todaySessionsElement.textContent = stats.todaySessions || 0;
        if (totalSessionsElement) totalSessionsElement.textContent = stats.totalSessions || 0;
        if (focusTimeElement) focusTimeElement.textContent = this.formatTime(stats.totalFocusTime || 0);
    }

    /**
     * 格式化时间
     */
    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }

    /**
     * 显示页面
     */
    show() {
        const timerPage = document.getElementById('timer-page');
        if (timerPage) {
            timerPage.style.display = 'block';
        }
        this.updateTimerDisplay();
        this.updateStats();
    }

    /**
     * 隐藏页面
     */
    hide() {
        const timerPage = document.getElementById('timer-page');
        if (timerPage) {
            timerPage.style.display = 'none';
        }
    }

    /**
     * 显示完成通知
     */
    showCompletionNotification(type) {
        const message = type === 'work' ? '工作时间结束！休息一下吧。' : '休息时间结束！开始下一个番茄钟。';
        
        if (window.app) {
            window.app.showNotification(message, 'success');
        }
        
        // 播放提示音（如果支持）
        this.playNotificationSound();
    }

    /**
     * 播放提示音
     */
    playNotificationSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.play().catch(() => {});
        } catch (e) {
            // 忽略音频播放错误
        }
    }
}

// 创建全局实例
window.timerPage = new TimerPage();