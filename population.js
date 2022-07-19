//The Population Class
//Here is where the power of all the classes
//comes together to destroy the game score records
class Population{
	constructor(size){
		this.population = [];
		this.bestPlayer;
		this.bestFitness = 0;

		this.matingPool = [];

		for(let i = 0; i < size; i++){
			this.population.push(new Player(i));
			this.population[i].brain.generateNetwork();
			this.population[i].brain.mutate();
		}
	}

	updateAlive() {
		for (let player of this.population) {
			if (!player.dead) {
				player.look();
				player.think();
				player.move();
				player.update();

				if (!showBestPlayer) {
					player.show();
				}
			}
		}

		if(showBestPlayer && this.bestPlayer && !this.bestPlayer.dead) {
			this.bestPlayer.look();
			this.bestPlayer.think();
			this.bestPlayer.move();
			this.bestPlayer.update();
			this.bestPlayer.show();

			if (this.bestPlayer.dead) {
				this.bestPlayer = this.bestPlayer.clone();
			}
		}
	}

	done(){
		for(let i = 0; i < this.population.length; i++){
			if(!this.population[i].dead){
				return false;
			}
		}
		
		return true;
	}
	
	naturalSelection(){
		this.calculateFitness();
		let children = [];
		
		this.fillMatingPool();
		for(let i = 0; i < this.population.length; i++){
			let parent1 = this.selectPlayer();
			let parent2 = this.selectPlayer();
			if(parent1.fitness > parent2.fitness) {
				children.push(parent1.crossover(parent2));
			} else {
				children.push(parent2.crossover(parent1));
			}
		}


		this.population.splice(0, this.population.length);
		this.population = children.slice(0);

		generation++;

		this.population.forEach((element) => { 
			element.brain.generateNetwork();
		});	

		this.bestPlayer.lifespan = 0;
		this.bestPlayer.dead = false;
		this.bestPlayer.score = 1;
	}

	calculateFitness(){
		let currentMax = 0;
		this.population.forEach((element) => { 
			element.calculateFitness();
			if(element.fitness > this.bestFitness) {
				this.bestFitness = element.fitness;
				this.bestPlayer = element.clone();
				this.bestPlayer.brain.id = "BestGenome";
				this.bestPlayer.brain.draw();

				document.getElementById('best_fitness').innerHTML = floor(this.bestFitness);
			}

			if(element.fitness > currentMax) {
				currentMax = element.fitness;
			}
		});

		//Normalize
		this.population.forEach((element, elementN) => { 
			element.fitness /= currentMax;
		});
	}

	fillMatingPool(){
		this.matingPool.splice(0, this.matingPool.length);
		this.population.forEach((element, elementN) => { 
			let n = element.fitness * 100;
			for(let i = 0; i < n; i++)
				this.matingPool.push(elementN);
		});
	}

	selectPlayer(){
		let rand = floor(random(1) *  this.matingPool.length);
		return this.population[this.matingPool[rand]];
	}

	getAverageScore(){
		let avSum = 0;
		this.population.forEach((element) => { 
			avSum += element.score;
		});

		return avSum / this.population.length;
	}
}
