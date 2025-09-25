/**
 * 番茄钟管理器
 * 负责处理番茄钟计时功能，包括工作时间、休息时间、统计分析等
 */
class PomodoroManager {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentSession = null;
        this.timeRemaining = 0;
        this.timer = null;
        this.sessions = [];
        this.settings = {
            workDuration: 25 * 60, // 25分钟工作时间
            shortBreakDuration: 5 * 60, // 5分钟短休息
            longBreakDuration: 15 * 60, // 15分钟长休息
            sessionsUntilLongBreak: 4, // 4个番茄钟后长休息
            autoStartBreaks: false,
            autoStartPomodoros: false,
            soundEnabled: true,
            notificationsEnabled: true
        };
        this.currentCycle = 0;
        this.init();
    }

    /**
     * 初始化番茄钟管理器
     */
    init() {
        this.loadSettings();
        this.loadSessions();
        this.bindEvents();
        this.updateUI();
        this.requestNotificationPermission();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 开始/暂停按钮
        const startBtn = document.getElementById('pomodoro-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.toggleTimer());
        }

        // 重置按钮
        const resetBtn = document.getElementById('pomodoro-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetTimer());
        }

        // 跳过按钮
        const skipBtn = document.getElementById('pomodoro-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipSession());
        }

        // 设置按钮
        const settingsBtn = document.getElementById('pomodoro-settings');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // 统计按钮
        const statsBtn = document.getElementById('pomodoro-stats');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.showStats());
        }

        // 设置表单
        const settingsForm = document.getElementById('pomodoro-settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    this.toggleTimer();
                    break;
                case 'r':
                case 'R':
                    this.resetTimer();
                    break;
                case 's':
                case 'S':
                    this.skipSession();
                    break;
            }
        });
    }

    /**
     * 开始新的番茄钟会话
     */
    startNewSession(type = 'work') {
        this.currentSession = {
            id: Date.now().toString(),
            type: type, // 'work', 'shortBreak', 'longBreak'
            startTime: new Date().toISOString(),
            duration: this.getSessionDuration(type),
            completed: false,
            interrupted: false
        };
        
        this.timeRemaining = this.currentSession.duration;
        this.isRunning = true;
        this.isPaused = false;
        
        this.updateUI();
        this.startTimer();
        
        // 发送通知
        this.sendNotification(`开始${this.getSessionTypeName(type)}`, `时长：${this.formatTime(this.timeRemaining)}`);
    }

    /**
     * 切换计时器状态
     */
    toggleTimer() {
        if (!this.currentSession) {
            this.startNewSession('work');
            return;
        }

        if (this.isRunning && !this.isPaused) {
            this.pauseTimer();
        } else {
            this.resumeTimer();
        }
    }

    /**
     * 暂停计时器
     */
    pauseTimer() {
        this.isPaused = true;
        this.stopTimer();
        this.updateUI();
    }

    /**
     * 恢复计时器
     */
    resumeTimer() {
        if (this.currentSession && this.isPaused) {
            this.isPaused = false;
            this.isRunning = true;
            this.startTimer();
            this.updateUI();
        }
    }

    /**
     * 重置计时器
     */
    resetTimer() {
        this.stopTimer();
        
        if (this.currentSession && this.isRunning) {
            this.currentSession.interrupted = true;
            this.currentSession.endTime = new Date().toISOString();
            this.sessions.push(this.currentSession);
            this.saveSessions();
        }
        
        this.currentSession = null;
        this.isRunning = false;
        this.isPaused = false;
        this.timeRemaining = this.settings.workDuration;
        
        this.updateUI();
    }

    /**
     * 跳过当前会话
     */
    skipSession() {
        if (!this.currentSession) return;
        
        this.completeSession(true);
    }

    /**
     * 开始计时
     */
    startTimer() {
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateUI();
            
            if (this.timeRemaining <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    /**
     * 停止计时
     */
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * 完成会话
     */
    completeSession(skipped = false) {
        this.stopTimer();
        
        if (this.currentSession) {
            this.currentSession.completed = !skipped;
            this.currentSession.skipped = skipped;
            this.currentSession.endTime = new Date().toISOString();
            this.currentSession.actualDuration = this.currentSession.duration - this.timeRemaining;
            
            this.sessions.push(this.currentSession);
            this.saveSessions();
            
            // 播放完成音效
            if (this.settings.soundEnabled) {
                this.playSound();
            }
            
            // 发送通知
            const sessionName = this.getSessionTypeName(this.currentSession.type);
            this.sendNotification(
                `${sessionName}${skipped ? '已跳过' : '完成'}！`,
                this.getNextSessionMessage()
            );
            
            // 自动开始下一个会话
            this.handleSessionTransition();
        }
    }

    /**
     * 处理会话转换
     */
    handleSessionTransition() {
        const nextSessionType = this.getNextSessionType();
        
        if (this.shouldAutoStart(nextSessionType)) {
            setTimeout(() => {
                this.startNewSession(nextSessionType);
            }, 1000);
        } else {
            this.currentSession = null;
            this.isRunning = false;
            this.isPaused = false;
            this.timeRemaining = this.getSessionDuration(nextSessionType);
            this.updateUI();
        }
    }

    /**
     * 获取下一个会话类型
     */
    getNextSessionType() {
        if (!this.currentSession) return 'work';
        
        if (this.currentSession.type === 'work') {
            this.currentCycle++;
            if (this.currentCycle % this.settings.sessionsUntilLongBreak === 0) {
                return 'longBreak';
            } else {
                return 'shortBreak';
            }
        } else {
            return 'work';
        }
    }

    /**
     * 判断是否应该自动开始
     */
    shouldAutoStart(sessionType) {
        if (sessionType === 'work') {
            return this.settings.autoStartPomodoros;
        } else {
            return this.settings.autoStartBreaks;
        }
    }

    /**
     * 获取会话持续时间
     */
    getSessionDuration(type) {
        switch (type) {
            case 'work':
                return this.settings.workDuration;
            case 'shortBreak':
                return this.settings.shortBreakDuration;
            case 'longBreak':
                return this.settings.longBreakDuration;
            default:
                return this.settings.workDuration;
        }
    }

    /**
     * 获取会话类型名称
     */
    getSessionTypeName(type) {
        switch (type) {
            case 'work':
                return '专注时间';
            case 'shortBreak':
                return '短休息';
            case 'longBreak':
                return '长休息';
            default:
                return '专注时间';
        }
    }

    /**
     * 获取下一个会话消息
     */
    getNextSessionMessage() {
        const nextType = this.getNextSessionType();
        const nextDuration = this.getSessionDuration(nextType);
        return `下一个：${this.getSessionTypeName(nextType)} (${this.formatTime(nextDuration)})`;
    }

    /**
     * 更新UI
     */
    updateUI() {
        this.updateTimer();
        this.updateButtons();
        this.updateProgress();
        this.updateSessionInfo();
        this.updateStats();
    }

    /**
     * 更新计时器显示
     */
    updateTimer() {
        const timerDisplay = document.getElementById('pomodoro-timer');
        if (timerDisplay) {
            timerDisplay.textContent = this.formatTime(this.timeRemaining);
        }
        
        // 只在番茄钟页面时更新页面标题
        const isOnPomodoroPage = window.router && window.router.isCurrentPage('timer');
        if (isOnPomodoroPage) {
            if (this.isRunning && !this.isPaused) {
                document.title = `${this.formatTime(this.timeRemaining)} - ${this.getSessionTypeName(this.currentSession?.type || 'work')}`;
            } else {
                document.title = 'AI助手 - 番茄钟';
            }
        }
    }

    /**
     * 更新按钮状态
     */
    updateButtons() {
        const startBtn = document.getElementById('pomodoro-start');
        const resetBtn = document.getElementById('pomodoro-reset');
        const skipBtn = document.getElementById('pomodoro-skip');
        
        if (startBtn) {
            if (!this.currentSession) {
                startBtn.textContent = '开始';
                startBtn.disabled = false;
            } else if (this.isPaused) {
                startBtn.textContent = '继续';
                startBtn.disabled = false;
            } else if (this.isRunning) {
                startBtn.textContent = '暂停';
                startBtn.disabled = false;
            }
        }
        
        if (resetBtn) {
            resetBtn.disabled = !this.currentSession;
        }
        
        if (skipBtn) {
            skipBtn.disabled = !this.currentSession || !this.isRunning;
        }
    }

    /**
     * 更新进度条
     */
    updateProgress() {
        const progressBar = document.getElementById('pomodoro-progress');
        if (progressBar && this.currentSession) {
            const totalDuration = this.currentSession.duration;
            const elapsed = totalDuration - this.timeRemaining;
            const progress = (elapsed / totalDuration) * 100;
            progressBar.style.width = `${progress}%`;
        } else if (progressBar) {
            progressBar.style.width = '0%';
        }
    }

    /**
     * 更新会话信息
     */
    updateSessionInfo() {
        const sessionType = document.getElementById('pomodoro-session-type');
        const sessionCount = document.getElementById('pomodoro-session-count');
        
        if (sessionType) {
            const type = this.currentSession?.type || 'work';
            sessionType.textContent = this.getSessionTypeName(type);
            sessionType.className = `session-type ${type}`;
        }
        
        if (sessionCount) {
            sessionCount.textContent = `第 ${this.currentCycle + 1} 个番茄钟`;
        }
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const todayStats = this.getTodayStats();
        
        const completedCount = document.getElementById('pomodoro-completed-today');
        if (completedCount) {
            completedCount.textContent = todayStats.completed;
        }
        
        const totalTime = document.getElementById('pomodoro-total-time');
        if (totalTime) {
            totalTime.textContent = this.formatTime(todayStats.totalTime);
        }
    }

    /**
     * 显示设置对话框
     */
    showSettings() {
        const modal = document.getElementById('pomodoro-settings-modal');
        if (modal) {
            // 填充当前设置值
            document.getElementById('work-duration').value = this.settings.workDuration / 60;
            document.getElementById('short-break-duration').value = this.settings.shortBreakDuration / 60;
            document.getElementById('long-break-duration').value = this.settings.longBreakDuration / 60;
            document.getElementById('sessions-until-long-break').value = this.settings.sessionsUntilLongBreak;
            document.getElementById('auto-start-breaks').checked = this.settings.autoStartBreaks;
            document.getElementById('auto-start-pomodoros').checked = this.settings.autoStartPomodoros;
            document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
            document.getElementById('notifications-enabled').checked = this.settings.notificationsEnabled;
            
            modal.style.display = 'block';
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        this.settings.workDuration = parseInt(document.getElementById('work-duration').value) * 60;
        this.settings.shortBreakDuration = parseInt(document.getElementById('short-break-duration').value) * 60;
        this.settings.longBreakDuration = parseInt(document.getElementById('long-break-duration').value) * 60;
        this.settings.sessionsUntilLongBreak = parseInt(document.getElementById('sessions-until-long-break').value);
        this.settings.autoStartBreaks = document.getElementById('auto-start-breaks').checked;
        this.settings.autoStartPomodoros = document.getElementById('auto-start-pomodoros').checked;
        this.settings.soundEnabled = document.getElementById('sound-enabled').checked;
        this.settings.notificationsEnabled = document.getElementById('notifications-enabled').checked;
        
        // 保存到本地存储
        try {
            window.dataManager.saveData('pomodoroSettings', this.settings);
        } catch (error) {
            console.error('保存番茄钟设置失败:', error);
        }
        
        // 如果当前没有会话，更新默认时间
        if (!this.currentSession) {
            this.timeRemaining = this.settings.workDuration;
            this.updateUI();
        }
        
        // 关闭设置对话框
        const modal = document.getElementById('pomodoro-settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        this.showNotification('设置已保存');
    }

    /**
     * 显示统计信息
     */
    showStats() {
        const modal = document.getElementById('pomodoro-stats-modal');
        if (modal) {
            this.renderStats();
            modal.style.display = 'block';
        }
    }

    /**
     * 渲染统计信息
     */
    renderStats() {
        const todayStats = this.getTodayStats();
        const weekStats = this.getWeekStats();
        const allTimeStats = this.getAllTimeStats();
        
        // 今日统计
        document.getElementById('stats-today-completed').textContent = todayStats.completed;
        document.getElementById('stats-today-time').textContent = this.formatTime(todayStats.totalTime);
        document.getElementById('stats-today-interrupted').textContent = todayStats.interrupted;
        
        // 本周统计
        document.getElementById('stats-week-completed').textContent = weekStats.completed;
        document.getElementById('stats-week-time').textContent = this.formatTime(weekStats.totalTime);
        document.getElementById('stats-week-average').textContent = Math.round(weekStats.completed / 7 * 10) / 10;
        
        // 总计统计
        document.getElementById('stats-total-completed').textContent = allTimeStats.completed;
        document.getElementById('stats-total-time').textContent = this.formatTime(allTimeStats.totalTime);
        document.getElementById('stats-total-days').textContent = allTimeStats.activeDays;
    }

    /**
     * 获取今日统计
     */
    getTodayStats() {
        const today = new Date().toDateString();
        const todaySessions = this.sessions.filter(session => 
            new Date(session.startTime).toDateString() === today
        );
        
        return {
            completed: todaySessions.filter(s => s.completed && s.type === 'work').length,
            interrupted: todaySessions.filter(s => s.interrupted && s.type === 'work').length,
            totalTime: todaySessions
                .filter(s => s.type === 'work')
                .reduce((sum, s) => sum + (s.actualDuration || 0), 0)
        };
    }

    /**
     * 获取本周统计
     */
    getWeekStats() {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekSessions = this.sessions.filter(session => 
            new Date(session.startTime) >= weekStart
        );
        
        return {
            completed: weekSessions.filter(s => s.completed && s.type === 'work').length,
            totalTime: weekSessions
                .filter(s => s.type === 'work')
                .reduce((sum, s) => sum + (s.actualDuration || 0), 0)
        };
    }

    /**
     * 获取总计统计
     */
    getAllTimeStats() {
        const workSessions = this.sessions.filter(s => s.type === 'work');
        const uniqueDays = new Set(
            workSessions.map(s => new Date(s.startTime).toDateString())
        ).size;
        
        return {
            completed: workSessions.filter(s => s.completed).length,
            totalTime: workSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
            activeDays: uniqueDays
        };
    }

    /**
     * 格式化时间
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * 播放音效
     */
    playSound() {
        // 创建音频上下文播放提示音
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.log('无法播放音效:', error);
        }
    }

    /**
     * 请求通知权限
     */
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    /**
     * 发送通知
     */
    sendNotification(title, body) {
        if (!this.settings.notificationsEnabled) return;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }

    /**
     * 显示应用内通知
     */
    showNotification(message) {
        // 可以调用全局通知系统
        if (window.app && window.app.showNotification) {
            window.app.showNotification(message);
        }
    }

    /**
     * 加载设置
     */
    loadSettings() {
        try {
            const savedSettings = window.dataManager.getData('pomodoroSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...savedSettings };
            }
            this.timeRemaining = this.settings.workDuration;
        } catch (error) {
            console.error('加载番茄钟设置失败:', error);
        }
    }

    /**
     * 加载会话数据
     */
    loadSessions() {
        try {
            const savedSessions = window.dataManager.getData('pomodoroSessions');
            this.sessions = savedSessions || [];
        } catch (error) {
            console.error('加载番茄钟会话数据失败:', error);
            this.sessions = [];
        }
    }

    /**
     * 保存会话数据
     */
    saveSessions() {
        try {
            window.dataManager.saveData('pomodoroSessions', this.sessions);
        } catch (error) {
            console.error('保存番茄钟会话数据失败:', error);
        }
    }

    /**
     * 导出统计数据
     */
    exportStats() {
        const stats = {
            settings: this.settings,
            sessions: this.sessions,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pomodoro-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 清除所有数据
     */
    clearAllData() {
        if (confirm('确定要清除所有番茄钟数据吗？此操作不可恢复。')) {
            this.resetTimer();
            this.sessions = [];
            this.currentCycle = 0;
            this.saveSessions();
            this.updateUI();
            this.showNotification('所有数据已清除');
        }
    }
}

// 创建全局实例
window.pomodoroManager = new PomodoroManager();