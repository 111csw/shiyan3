class Player {
    constructor() {
        this.health = parseInt(localStorage.getItem('health')) || 100;
        this.treasure = parseInt(localStorage.getItem('treasure')) || 0;
    }

    saveState() {
        localStorage.setItem('health', this.health);
        localStorage.setItem('treasure', this.treasure);
    }

    encounterTreasure(amount) {
        this.treasure += amount;
        this.saveState();
        return `你找到了${amount}个金币！`;
    }

    encounterThief(amount) {
        this.treasure -= amount;
        this.saveState();
        return `坏人抢走了${amount}个金币！`;
    }

    encounterSnake(damage) {
        this.health -= damage;
        this.saveState();
        return `被毒蛇咬了，失去${damage}点血！`;
    }

    encounterNPC(type) {
        let message = '';
        if (type === 'friendly') {
            const reward = Math.floor(Math.random() * 21) + 10;
            this.health += reward;
            message = `友好的NPC帮助你，恢复了${reward}点血！`;
        } else {
            const penalty = Math.floor(Math.random() * 11) + 5;
            this.treasure -= penalty;
            message = `敌对的NPC抢走了${penalty}个金币！`;
        }
        this.saveState();
        return message;
    }
}

class Game {
    constructor() {
        this.player = new Player();
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.outputElement = document.getElementById('output');
        this.choiceButtons = document.getElementById('choiceButtons');
        this.eventImageElement = document.getElementById('eventImage');

        // 获取血量和财富显示的元素
        this.healthStatus = document.getElementById('healthStatus');
        this.treasureStatus = document.getElementById('treasureStatus');

        // 初始化血量和财富显示
        this.updateStatus();

        // 添加背景音乐控制
        this.music = new Audio('images/WilliamHenRy - One Last Time  (WilliamHenRy remix).flac'); // 设置背景音乐路径

        this.musicBtn = document.getElementById('musicBtn');
        this.musicPlaying = false;

        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('leftBtn').addEventListener('click', () => this.makeChoice('左'));
        document.getElementById('rightBtn').addEventListener('click', () => this.makeChoice('右'));
        document.getElementById('straightBtn').addEventListener('click', () => this.makeChoice('直走'));

        // 添加背景音乐按钮的点击事件
        this.musicBtn.addEventListener('click', () => this.toggleMusic());
    }

    // 更新血量和财富显示
    updateStatus() {
        this.healthStatus.textContent = `血量: ${this.player.health}`;
        this.treasureStatus.textContent = `财富: ${this.player.treasure}`;
    }

    toggleMusic() {
        if (this.musicPlaying) {
            this.music.pause();
            this.musicBtn.innerText = '播放背景音乐';
        } else {
            this.music.play();
            this.music.loop = true; // 设置音乐循环播放
            this.musicBtn.innerText = '停止背景音乐';
        }
        this.musicPlaying = !this.musicPlaying;
    }

    async startGame() {
        this.outputElement.innerText = '';
        this.choiceButtons.classList.remove('hidden');
        this.currentLevel = 1;
        await this.playLevel(this.currentLevel);
    }

    async playLevel(level) {
        this.outputElement.innerText += `第${level}关: 你要选择哪个方向？\n\n`;
        if (level > this.maxLevel) {
            this.endGame();
            return;
        }
    }

    async makeChoice(choice) {
        let result = '';
        const encounterNPC = Math.random() < 0.3;

        this.eventImageElement.classList.add('hidden');

        switch (choice) {
            case '左':
                result = this.player.encounterTreasure(Math.floor(Math.random() * 41) + 10);
                this.eventImageElement.innerHTML = '<img src="images/treasure.png" alt="宝藏">';
                await this.loadLevelText('treasure.txt');
                break;
            case '右':
                result = this.player.encounterThief(Math.floor(this.player.treasure * 0.2));
                this.eventImageElement.innerHTML = '<img src="images/badman.png" alt="坏人">';
                await this.loadLevelText('thief.txt');
                break;
            case '直走':
                result = this.player.encounterSnake(Math.floor(Math.random() * 11) + 5);
                this.eventImageElement.innerHTML = '<img src="images/snake.png" alt="毒蛇">';
                await this.loadLevelText('snake.txt');
                break;
        }

        if (encounterNPC) {
            const npcType = Math.random() < 0.5 ? 'friendly' : 'hostile';
            result += `\n${this.player.encounterNPC(npcType)}`;
        }

        this.outputElement.innerText += `${result}\n当前血量: ${this.player.health}, 当前财富: ${this.player.treasure}\n\n`;
        this.eventImageElement.classList.remove('hidden');

        // 更新血量和财富显示
        this.updateStatus();

        if (this.player.health <= 0) {
            this.outputElement.innerText += "游戏结束！你被毒蛇咬死了。\n";
            this.choiceButtons.classList.add('hidden');
            return;
        }

        this.currentLevel++;
        if (this.currentLevel > this.maxLevel) {
            this.endGame();
        } else {
            this.playLevel(this.currentLevel);
        }
    }

    async loadLevelText(fileName) {
        try {
            const response = await fetch(`./${fileName}`);
            if (response.ok) {
                const text = await response.text();
                alert(text);  // 使用 alert 方法显示关卡信息
            } else {
                this.outputElement.innerText += "加载关卡信息失败。\n";
            }
        } catch (error) {
            this.outputElement.innerText += "加载关卡信息时出错。\n";
        }
    }

    endGame() {
        this.outputElement.innerText += "恭喜你通过了所有关卡！\n";
        this.outputElement.innerText += `最终血量: ${this.player.health}, 最终财富: ${this.player.treasure}\n`;
        this.choiceButtons.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();
});
