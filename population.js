//The Population Class
//Here is where the power of all the classes
//comes together to destroy the game score records
class Population{
	constructor(size){
		this.population = [];
		this.species = [];
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

	setBestPlayer() {
		let element = this.species[0].players[0];

		if(element.fitness > this.bestFitness) {
			this.bestFitness = element.fitness;
			this.bestPlayer = element.clone();
			this.bestPlayer.brain.id = "BestGenome";
			this.bestPlayer.brain.draw();

			document.getElementById('best_fitness').innerHTML = this.bestFitness;
		}
	}
	
	naturalSelection() {
		this.speciate();
		this.calculateFitness();
		this.sortSpecies();
		this.cullSpecies();
		this.setBestPlayer();
		this.killStaleSpecies();
		this.killBadSpecies();
		this.fillMatingPool();

		let children = [];
		for(let i = 0; i < this.population.length; i++){
			let parent1 = this.selectPlayer();
			let parent2 = this.selectPlayer();
			if(parent1.fitness > parent2.fitness) {
				children.push(parent1.crossover(parent2));
			} else {
				children.push(parent2.crossover(parent1));
			}
		}


		this.population = [...children];

		generation++;

		this.population.forEach((element) => { 
			element.brain.generateNetwork();
		});	

		this.bestPlayer.dead = false;
	}

	calculateFitness(){
		let currentMax = 0;
		this.population.forEach((element) => { 
			element.calculateFitness();

			if(element.fitness > currentMax) {
				currentMax = element.fitness;
			}
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

	speciate() {
		for (var s of this.species) {
		  s.players = [];
		}

		for (var i = 0; i < this.population.length; i++) { //for each player
		  var speciesFound = false;
		  for (var s of this.species) { //for each this.species
			if (s.sameSpecies(this.population[i].brain)) { //if the player is similar enough to be considered in the same this.species
			  s.addToSpecies(this.population[i]); //add it to the this.species
			  speciesFound = true;
			  break;
			}
		  }
		  if (!speciesFound) { //if no this.species was similar enough then add a new this.species with this as its champion
			this.species.push(new Species(this.population[i]));
		  }
		}
	}

	sortSpecies() {
		//sort the players within a this.species
		for (var s of this.species) {
			s.sortSpecies();
		}

		//sort the this.species by the fitness of its best player
		//using selection sort like a loser
		var temp = []; //new ArrayList<Species>();
		for (var i = 0; i < this.species.length; i++) {
			var max = 0;
			var maxIndex = 0;
			for (var j = 0; j < this.species.length; j++) {
				if (this.species[j].bestFitness > max) {
					max = this.species[j].bestFitness;
					maxIndex = j;
				}
			}
			temp.push(this.species[maxIndex]);
			this.species.splice(maxIndex, 1);
			i--;
		}
		this.species = [];
		arrayCopy(temp, this.species);
	}

	cullSpecies() {
		for (let i = 0; i < this.species.length; i++) {
			if (this.species[i].players.length == 0) {
				this.species.splice(i, 1);
				continue;
			}

			this.species[i].fitnessSharing();
			this.species[i].setAverage();
		}
	}

	killStaleSpecies() {
		for (var i = 2; i < this.species.length; i++) {
			if (this.species[i].staleness >= 15) {
				this.species.splice(i, 1);
				i--;
			}
		}
	}

	killBadSpecies() {
		var averageSum = this.getAvgFitnessSum();

		for (var i = 1; i < this.species.length; i++) {
			if (this.species[i].averageFitness / averageSum * this.population.length < 1) {
				this.species.splice(i, 1);
				i--;
			}
		}
	}

	getAvgFitnessSum() {
		let averageSum = 0;

		for (var s of this.species) {
			averageSum += s.averageFitness;
		}

		return averageSum;
	}

	// naturalSelection_v2() {
	// 	let previousBest = this.population[0];

	// 	this.speciate();
	// 	this.calculateFitness();
	// 	this.sortSpecies();
	// 	this.cullSpecies();
	// 	this.setBestPlayer();
	// 	this.killStaleSpecies();
	// 	this.killBadSpecies();
	// 	this.fillMatingPool();

	// 	let averageSum = this.getAvgFitnessSum();
    // 	let children = [];

	// 	for (let j = 0; j < this.species.length; j++) { //for each this.species
	// 		children.push(this.species[j].champ.clone()); //add champion without any mutation
	// 		let NoOfChildren = ceil(this.species[j].averageFitness / averageSum * this.population.length) - 1;

	// 		for (let i = 0; i < NoOfChildren; i++) { //get the calculated amount of children from this this.species
	// 			children.push(this.species[j].giveMeBaby());
	// 		}
	// 	}

	// 	if (children.length < this.population.length) {
	// 		children.push(previousBest.clone());
	// 	}

	// 	while (children.length < this.population.length) {
	// 		children.push(this.species[0].giveMeBaby());
	// 	}
		
	// 	this.population = [...children];

	// 	this.gen++;

	// 	this.population.forEach((element) => { 
	// 		element.brain.generateNetwork();
	// 	});	

	// 	this.bestPlayer.lifespan = 0;
	// 	this.bestPlayer.dead = false;
	// 	this.bestPlayer.score = 1;
	// }
}
