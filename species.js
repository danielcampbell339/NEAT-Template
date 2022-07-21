class Species {

    constructor(p) {
      this.players = [];
      this.bestFitness = 0;
      this.champ;
      this.averageFitness = 0;
      this.staleness = 0; //how many generations the species has gone without an improvement
      this.rep;
  
      //--------------------------------------------
      //coefficients for testing compatibility
      this.excessCoeff = 1;
      this.weightDiffCoeff = 0.5;
      this.compatibilityThreshold = 1;  

      if (p) {
        this.players.push(p);
        //since it is the only one in the species it is by default the best
        this.bestFitness = p.fitness;
        this.rep = p.brain.clone();
        this.champ = p.clone();
      }
    }
  
    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //returns whether the parameter genome is in this species
    sameSpecies(g) {
      var compatibility;
      var excessAndDisjoint = this.getExcessDisjoint(g, this.rep); //get the number of excess and disjoint connections between this player and the current species this.rep
      var averageWeightDiff = this.averageWeightDiff(g, this.rep); //get the average weight difference between matching connections
  
  
      var largeGenomeNormaliser = g.connections.length - 20;
      if (largeGenomeNormaliser < 1) {
        largeGenomeNormaliser = 1;
      }
  
      compatibility = (this.excessCoeff * excessAndDisjoint / largeGenomeNormaliser) + (this.weightDiffCoeff * averageWeightDiff); //compatibility formula
      return (this.compatibilityThreshold > compatibility);
    }
  
    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //add a player to the species
    addToSpecies(p) {
      this.players.push(p);
    }
  
    //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //returns the number of excess and disjoint connections between the 2 input genomes
    //i.e. returns the number of connections which dont match
    getExcessDisjoint(brain1, brain2) {
        var matching = 0.0;
        for (var i = 0; i < brain1.connections.length; i++) {
          for (var j = 0; j < brain2.connections.length; j++) {
            if (brain1.connections[i].innovationNo == brain2.connections[j].innovationNo) {
              matching++;
              break;
            }
          }
        }
        return (brain1.connections.length + brain2.connections.length - 2 * (matching)); //return no of excess and disjoint connections
      }
      //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      //returns the avereage weight difference between matching connections in the input genomes
    averageWeightDiff(brain1, brain2) {
        if (brain1.connections.length == 0 || brain2.connections.length == 0) {
          return 0;
        }
  
  
        var matching = 0;
        var totalDiff = 0;
        for (var i = 0; i < brain1.connections.length; i++) {
          for (var j = 0; j < brain2.connections.length; j++) {
            if (brain1.connections[i].innovationNo == brain2.connections[j].innovationNo) {
              matching++;
              totalDiff += abs(brain1.connections[i].weight - brain2.connections[j].weight);
              break;
            }
          }
        }
        if (matching == 0) { //divide by 0 error
          return 100;
        }
        return totalDiff / matching;
      }
      //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      //sorts the species by fitness
    sortSpecies() {
  
      var temp = []; // new ArrayList < Player > ();
  
      //selection short
      for (var i = 0; i < this.players.length; i++) {
        var max = 0;
        var maxIndex = 0;
        for (var j = 0; j < this.players.length; j++) {
          if (this.players[j].fitness > max) {
            max = this.players[j].fitness;
            maxIndex = j;
          }
        }
        temp.push(this.players[maxIndex]);
  
        this.players.splice(maxIndex, 1);
        // this.players.remove(maxIndex);
        i--;
      }
  
      // this.players = (ArrayList) temp.clone();
      arrayCopy(temp, this.players);
      if (this.players.length == 0) {
        this.staleness = 200;
        return;
      }
      //if new best player
      if (this.players[0].fitness > this.bestFitness) {
        this.staleness = 0;
        this.bestFitness = this.players[0].fitness;
        this.rep = this.players[0].brain.clone();
        this.champ = this.players[0].clone();
      } else { //if no new best player
        this.staleness++;
      }
    }
  
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //simple stuff
    setAverage() {
        var sum = 0;
        for (var i = 0; i < this.players.length; i++) {
          sum += this.players[i].fitness;
        }

        this.averageFitness = sum / this.players.length;
      }
      //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  
    //gets baby from the this.players in this species
    giveMeBaby(innovationHistory) {
      var baby;
      if (random(1) < 0.25) { //25% of the time there is no crossover and the child is simply a clone of a random(ish) player
        baby = this.selectPlayer().clone();
      } else { //75% of the time do crossover
  
        //get 2 random(ish) parents
        var parent1 = this.selectPlayer();
        var parent2 = this.selectPlayer();
  
        //the crossover function expects the highest fitness parent to be the object and the lowest as the argument
        if (parent1.fitness < parent2.fitness) {
          baby = parent2.crossover(parent1);
        } else {
          baby = parent1.crossover(parent2);
        }
      }
      
      baby.brain.mutate(innovationHistory); //mutate that baby brain
      return baby;
    }
  
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //selects a player based on it fitness
    selectPlayer() {
      return random(this.players);
    }

      //------------------------------------------------------------------------------------------------------------------------------------------
      //in order to protect unique this.players, the fitnesses of each player is divided by the number of this.players in the species that that player belongs to
    fitnessSharing() {
      for (var i = 0; i < this.players.length; i++) {
        this.players[i].fitness /= this.players.length;
      }
    }
  }