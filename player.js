//The Player Class
//The interface between our 
//NeuralNetwork and the game 
class Player{
	constructor(id){
		this.pos = createVector(10, 10);
		this.vel = createVector(0, 0);
		this.r = 15;

		this.brain = new Genome(id);
		this.fitness;

		this.score = 1;
		this.lifespan = 0;
		this.dead = false;
		this.decisions = [];
		this.vision = [];
	}

	clone() { //Returns a copy of this player
		let clone = new Player();
		clone.brain = this.brain.clone();
		return clone;
	}

	crossover(parent){ //Produce a child
		let child = new Player();
		if(parent.fitness < this.fitness)
			child.brain = this.brain.crossover(parent.brain);
		else
			child.brain = parent.brain.crossover(this.brain);

		child.brain.mutate()
		return child;
	}

	look() {
		this.vision = [
			this.pos.x,
			this.pos.y
		];
	}

	think(){
		this.decisions = this.brain.feedForward(this.vision);
	}

	move() {
		let maxIndex = 0;
		for(let i = 0; i < this.decisions.length; i++) {
			if(this.decisions[i] > this.decisions[maxIndex]) {
				maxIndex = i;
			}
		}

		// Up
		if (maxIndex == 0) {
			this.vel.x += 0;
			this.vel.y += -1;
		}

		// Down
		if (maxIndex == 1) {
			this.vel.x += 0;
			this.vel.y += 1;
		}

		// Left
		if (maxIndex == 2) {
			this.vel.x += -1;
			this.vel.y += 0;
		}

		// Right
		if (maxIndex == 3) {
			this.vel.x += 1;
			this.vel.y += 0;
		}

		// Right
		if (maxIndex == 4) {
			this.vel.x = 0;
			this.vel.y = 0;
		}

		this.vel.limit(2);
		this.pos.add(this.vel);
	}

	update() {
		this.checkBounds();
		this.lifespan++;
	}

	checkBounds() {
		if (this.pos.x < 0 || this.pos.y < 0) {
			this.dead = true;
		}

		if (this.pos.x > width || this.pos.y > height) {
			this.dead = true;
		}

		if (this.lifespan > 500) {
			this.dead = true;
		}

		if (p5.Vector.dist(this.pos, goal.pos) < goal.r) {
			this.dead = true;
		}
	}

	show(){
		fill(255, 0, 0);
		ellipse(this.pos.x, this.pos.y, this.r);
	}

	calculateFitness(){ //Fitness function : adapt it to the needs of the
		let distToGoal = p5.Vector.dist(this.pos, goal.pos)
		this.score = 1 / distToGoal * 1000;

		if (distToGoal < goal.r) {
			this.score = 9999;
		}

		this.fitness = this.score;
		this.fitness /= this.brain.calculateWeight();
	}
}