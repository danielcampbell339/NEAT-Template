var activationsNames = [
	"Sigmoid", 
	"Identity", 
	"Step", 
	"Tanh", 
	"ReLu",
	"LeLu",
	"SeLu",
	"Abs",
	"Cubed",
	"Exp",
	"Log",
	"Sin",
	"SoftPlus",
	"Square"
];

//The Node Class
//This is where math appends
class Node {
	constructor(num, lay, isOutput, isBias) {
		this.number = num;
		this.layer = lay;
		this.activationFunction = this.getActivationFunction(); //Number between 0 and 4
		this.bias = random(1) * 2 - 1;
		this.output = isOutput || false; //is this node an Output node?
		this.isBias = isBias || false;

		this.inputSum = 0;
		this.outputValue = 0;
		this.outputConnections = [];
	}

	getActivationFunction() {
		if (activationFunction == 'random') {
			return random(activationsNames);
		}

		return activationFunction;
	}

	engage() { //Pass down the network the calculated output value
		if (this.layer != 0) //No activation function on input nodes
			this.outputValue = this.activation(this.inputSum + this.bias);


		this.outputConnections.forEach((conn) => {
			if (conn.enabled) //Do not pass value if connection is disabled
				conn.toNode.inputSum += conn.weight * this.outputValue; //Weighted output sum
		});
	}

	mutateBias() { //Randomly mutate the bias of this node
		let rand = random(1);
		if (rand < 0.05) //5% chance of being assigned a new random value
			this.bias = random(1) * 2 - 1;
		else //95% chance of being uniformly perturbed
			this.bias += randomGaussian() / 50;
	}

	mutateActivation() { //Randomly choose a new activationFunction
		if (activationFunction !== 'random') {
			return;
		}

		this.activationFunction = random(activationsNames); //Number between 0 and 4
	}

	isConnectedTo(node) { //Check if two nodes are connected
		if (node.layer == this.layer) //nodes in the same layer cannot be connected
			return false;


		if (node.layer < this.layer) { //Check parameter node connections
			node.outputConnections.forEach((conn) => {
				if (conn.toNode == this) //Is Node connected to This?
					return true;
			});
		} else { //Check this node connections
			this.outputConnections.forEach((conn) => {
				if (conn.toNode == node) //Is This connected to Node?
					return true;
			});
		}

		return false;
	}

	clone() { //Returns a copy of this node
		let node = new Node(this.number, this.layer, this.output, this.isBias);
		node.bias = this.bias; //Same bias
		node.activationFunction = this.activationFunction; //Same activationFunction
		return node;
	}

	activation(x) { //All the possible activation Functions
		let alpha = 1.67326324;
		let scale = 1.05070098;

		switch (this.activationFunction.toLowerCase()) {
			case 'sigmoid': 
				return 1 / (1 + Math.pow(Math.E, -4.9 * x));
			case 'identity': 
				return x;
			case 'step': 
				return x > 0 ? 1 : 0;
			case 'tanh': 
				return Math.tanh(x);
			case 'relu': 
				return x < 0 ? 0 : x;
			case 'selu': 
				return x > 0 ? (scale * x) : (scale * alpha * (exp(x) - 1));
			case 'lelu':
				return x < 0 ? alpha * x : x;
			case 'abs': 
				return abs(x)
			case 'cube': 
				return sqrt(x, 3)
			case 'exp': 
				return exp(x)
			case 'log': 
				return log(x)
			case 'sin': 
				return sin(x)
			case 'softplus': 
				return log(exp(x) + 1)
			case 'square': 
				return sqrt(x, 2)
			default:
				return 1 / (1 + Math.pow(Math.E, -4.9 * x));
		}
	}
}