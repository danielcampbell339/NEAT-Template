class Brain {
    constructor(actions) {
        this.actions = actions;

        this.epsilon = 0.1;
        this.discountFactor = 0.9;
        this.learningRate = 0.9;
        this.episodes = 0;
        this.maxEpisodes = 1000;
        this.memory = {};
    }
    
    decide() {
        if (this.episodes > this.maxEpisodes) {
            console.log('USING MAX EPSILON')
            this.eplison = 1;
        }

        // Add current position to memory
        this.addToMemory();

        // Get action
        let action = this.chooseAction();
        let oldQKey = this.getQValueKey();
                
        player[action]();

        // Add current position to memory
        this.addToMemory();

        let reward = this.getReward();

        let oldQValue = this.memory[oldQKey][action];
        let bestQValue = this.getBestQValue();
        let temporalDifference = reward + (this.discountFactor * bestQValue) - oldQValue;
        let newQValue = oldQValue + (this.learningRate * temporalDifference);

        this.memory[oldQKey][action] = newQValue;

        if ([100, -100].includes(reward)) {
            this.episodes++;
            player.reset();
        }
    }

    chooseAction() {
        return random(1) < this.epsilon ? this.getBestAction() : this.getRandomAction()
    }

    getBestAction() {
        let qKey = this.getQValueKey();
        let qIndex = this.memory[qKey];

        let maxVal = -Number.MIN_VALUE;
        let maxAction = null;
        for (let actionName in qIndex) {
            if (qIndex[actionName] > maxVal) {
                maxAction = actionName;
                maxVal = qIndex[actionName];
            }
        }

        return maxAction
    }

    getRandomAction() {
        return random(this.actions);
    }

    getReward() {
        let distToGoal = p5.Vector.dist(player.pos, goal.pos);
        let r = (1 / distToGoal) * 1000;
        
        if (player.pos.x < 0 || player.pos.y < 0) {
            r = -100;
        }

        if (player.pos.x > width || player.pos.y > height) {
            r = -100;
        }

        if (distToGoal < goal.r) {
            r = 1000;
        }

        return r;
    }

    getBestQValue() {
        let qKey = this.getQValueKey();
        let qIndex = this.memory[qKey];

        let maxVal = -Number.MIN_VALUE;
        for (let actionName in qIndex) {
            if (qIndex[actionName] > maxVal) {
                maxVal = qIndex[actionName];
            }
        }

        return maxVal;
    }

    addToMemory() {
        let key = this.getQValueKey();

        if (this.memory[key] === undefined) {
            this.memory[key] = {};

            for (let action of this.actions) {
                this.memory[key][action] = 0.0;
            }
        }
    }

    getQValueKey() {
        let playerPos = player.pos.copy();

        return playerPos.y * width + playerPos.x;
    }
}