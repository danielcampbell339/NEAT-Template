//The Genome Class
//Well.. this is the main class
//This is where all the magic appends
class Genome {
	constructor(id, offSpring = false) {
		this.inputs = inputCount; //Number of inputs
		this.outputs = outputCount; //Number of outputs
		this.id = id; //Genome id -> used for the drawing
		this.layers = 2;
		this.nextNode = 0;
		this.offSpring = offSpring;

		this.nodes = [];
		this.connections = [];

		if (offSpring) {
			return;
		}

		for (let i = 0; i < this.inputs; i++) {
			this.nodes.push(new Node(this.nextNode, 0));
			this.nextNode++;
		}

		for (let i = 0; i < this.outputs; i++) {
			let node = new Node(this.nextNode, 1, true);
			this.nodes.push(node);
			this.nextNode++;
		}
		
		let biasNode = new Node(this.nextNode, 0, false, true);
		this.nodes.push(biasNode);
		this.biasNode = this.nextNode;
		this.nextNode++;

		if (fullyConnect) {
			this.fullyConnect();
		}
	}

	addFixedConnection(node1, node2, weight = null) {
		if (!weight) {
			weight = random(1) * this.inputs * Math.sqrt(2 / this.inputs);
		}

		this.connections.push(new Connection(node1, node2, weight));
	}

	fullyConnect() {
		for (let i = 0; i < this.inputs; i++) {
			for (let j = this.inputs; j < this.outputs + this.inputs; j++) {
				this.addFixedConnection(this.nodes[i], this.nodes[j]);
			}
		}

		this.addFixedConnection(this.nodes[this.biasNode], this.nodes[this.nodes.length - 2]);
		this.addFixedConnection(this.nodes[this.biasNode], this.nodes[this.nodes.length - 3]);
	}

	//Network Core
	generateNetwork() {
		//Clear all outputConnections in the nodes
		this.nodes.forEach((node) => {
			node.outputConnections.splice(0, node.outputConnections.length);
		});

		//Add the connections to the Nodes
		this.connections.forEach((conn) => {
			conn.fromNode.outputConnections.push(conn);
		});

		//Prepare for feed forward
		this.sortByLayer();
	}

	feedForward(inputValues) {
		this.generateNetwork(); //Connect all up

		//Clear old inputs
		this.nodes.forEach((node) => { node.inputSum = 0; });

		//asin new inputs
		for (let i = 0; i < this.inputs; i++) {
			this.nodes[i].outputValue = inputValues[i];
		}
		this.nodes[this.biasNode].outputValue = 1;

		//Engage all nodes and Extract the results from the outputs
		let result = [];
		this.nodes.forEach((node) => {
			node.engage();

			if (node.output)
				result.push(node.outputValue);
		});
		return result;
	}


	//Crossover
	crossover(partner) {
		let offSpring = new Genome(0, true); //Child genome
		offSpring.nextNode = this.nextNode;
		offSpring.biasNode = this.biasNode;

		//Take all nodes from this parent - output node activation 50%-50%
		for(let i = 0; i < this.nodes.length; i++){
			let node = this.nodes[i].clone();
			if(node.output) {
				let partnerNode = partner.nodes[partner.getNode(node.number)];
				if(random(1) > 0.5) {
					node.activationFunction = partnerNode.activationFunction;
					node.bias = partnerNode.bias;
				}
			}
			offSpring.nodes.push(node);
		}

		//Randomly take connections from this or the partner network
		for(let i = 0; i < this.connections.length; i++) {
			let index = this.commonConnection(this.connections[i].getInnovationNumber(), partner.connections);

			if(index != -1) { //There is a commonConnection
				let conn = random(1) > 0.5 ? this.connections[i].clone() : partner.connections[index].clone();

				//Reassign nodes
				let fromNode = offSpring.nodes[offSpring.getNode(conn.fromNode.number)];
				let toNode = offSpring.nodes[offSpring.getNode(conn.toNode.number)];
				conn.fromNode = fromNode;
				conn.toNode = toNode;

				//Add this connection to the child
				if(fromNode && toNode)
					offSpring.connections.push(conn);
			}
			else { //No common connection -> take from this
				let conn = this.connections[i].clone();

				//Reassign nodes
				let fromNode = offSpring.nodes[offSpring.getNode(conn.fromNode.number)];
				let toNode = offSpring.nodes[offSpring.getNode(conn.toNode.number)];
				conn.fromNode = fromNode;
				conn.toNode = toNode;

				//Add this connection to the child
				if(fromNode && toNode)
					offSpring.connections.push(conn);
			}
		}

		offSpring.layers = this.layers;
		return offSpring;
	}

	//Mutation Stuff
	mutate() {
		let chance = random(1);

		if(chance < mutateConnection) { //80%
			//MOD Connections
			for (var i = 0; i < this.connections.length; i++) {
				this.connections[i].mutateWeight();
			}
		}

		if(chance < mutateBias) { //50%
			//MOD Bias
			for (var i = 0; i < this.nodes.length; i++) {
				this.nodes[i].mutateBias();
			}
		}

		if(chance < mutateNode) { //10%
			//MOD Node
			let i = floor(random(1) * this.nodes.length);
			this.nodes[i].mutateActivation();
		}

		if(chance < addConnection) { //5%
			//ADD Connections
			this.addConnection();
		}

		if(chance < addNode) { //3%
			//ADD Node
			this.addNode();
		}
	}

	addNode() { //Add a node to the network
		if (this.connections.length == 0) {
			this.addConnection();
			return;
		}

		//Get a random connection to replace with a node
		let connectionIndex = floor(random(1) * this.connections.length);

		while (
			this.connections[connectionIndex].fromNode == this.nodes[this.biasNode] && 
			this.connections.length !== 1
		) {
			connectionIndex = floor(random(this.connections.length));
		}
	  
		let pickedConnection = this.connections[connectionIndex];
		pickedConnection.enabled = false;
		this.connections.splice(connectionIndex, 1); //Delete the connection

		//Create the new node
		let newNode = new Node(this.nextNode, pickedConnection.fromNode.layer + 1);

		//New connections
		this.addFixedConnection(pickedConnection.fromNode, newNode, 1);
		this.addFixedConnection(newNode, pickedConnection.toNode, pickedConnection.weight);
		this.addFixedConnection(this.nodes[this.biasNode], newNode, 0);

		this.nodes.push(newNode); //Add node
		this.nextNode++;
	}

	addConnection() { //Add a connection to the network
		if (this.fullyConnected())
			return; //Cannot add connections if it's fullyConnected

		//Choose to nodes to connect
		let node1 = floor(random(1) * this.nodes.length);
		let node2 = floor(random(1) * this.nodes.length);

		//Search for two valid nodes
		while (this.nodes[node1].layer == this.nodes[node2].layer
			|| this.nodesConnected(this.nodes[node1], this.nodes[node2])) {
			node1 = floor(random(1) * this.nodes.length);
			node2 = floor(random(1) * this.nodes.length);
		}

		//Switch nodes based on their layer
		if (this.nodes[node1].layer > this.nodes[node2].layer) {
			let temp = node1;
			node1 = node2;
			node2 = temp;
		}

		//add the connection
		let newConnection = new Connection(this.nodes[node1], this.nodes[node2], random(1) * this.inputs * Math.sqrt(2 / this.inputs));
		this.connections.push(newConnection);
	}

	//Utilities
	commonConnection(innN, connections) {
		//Search through all connections to check for
		//one with the correct Innovation Number
		for(let i = 0; i < connections.length; i++){
			if(innN == connections[i].getInnovationNumber())
				return i;
		}

		//Found nothing
		return -1;
	}

	nodesConnected(node1, node2) {
		//Search if there is a connection between node1 & node2
		for (let i = 0; i < this.connections.length; i++) {
			let conn = this.connections[i];
			if ((conn.fromNode == node1 && conn.toNode == node2)
				|| (conn.fromNode == node2 && conn.toNode == node1)) {
				return true;
			}
		};

		return false;
	}

	fullyConnected() {
		//check if the network is fully connected
		let maxConnections = 0;
		let nodesPerLayer = [];

		//Calculate all possible connections
		this.nodes.forEach((node) => {
			if (nodesPerLayer[node.layer] != undefined)
				nodesPerLayer[node.layer]++;
			else
				nodesPerLayer[node.layer] = 1;
		});

		for (let i = 0; i < this.layers - 1; i++)
			for (let j = i + 1; j < this.layers; j++)
				maxConnections += nodesPerLayer[i] * nodesPerLayer[j];

		//Compare
		return maxConnections == this.connections.length;
	}

	sortByLayer(){
		//Sort all nodes by layer
		this.nodes.sort((a, b) => {
			return a.layer - b.layer;
		});
	}

	clone() { //Returns a copy of this genome
		let clone = new Genome(this.id);
		clone.nodes = this.nodes.slice(0, this.nodes.length);
		clone.connections = this.connections.slice(0, this.connections.length);

		return clone;
	}

	getNode(x){ //Returns the index of a node with that Number
		for(let i = 0; i < this.nodes.length; i++)
			if(this.nodes[i].number == x)
				return i;

		return -1;
	}

	calculateWeight() { //Computational weight of the network
		return this.connections.length + this.nodes.length;
	}

	draw() {		  
		let data = this.buildGraph();

		console.log(data);

		this.createGraph(data);
	}

	createGraph(graph) {
		let parent = document.getElementById('neuralNet')
		parent.innerHTML = '';

	var width = parent.offsetWidth,
    height = 500,
    nodeSize = 30;

var color = d3.scale.category20();

var svg = d3.select("#neuralNet").append("svg")
    .attr("width", width)
    .attr("height", height);

    var nodes = graph.nodes;

    // get network size
    var netsize = {};
    nodes.forEach(function (d) {
      if(d.layer in netsize) {
          netsize[d.layer] += 1;
      } else {
          netsize[d.layer] = 1;
      }
      d["lidx"] = netsize[d.layer];
    });

    // calc distances between nodes
    var largestLayerSize = Math.max.apply(
        null, Object.keys(netsize).map(function (i) { return netsize[i]; }));

    var xdist = width / Object.keys(netsize).length,
        ydist = height / largestLayerSize;

    // create node locations
    nodes.map(function(d) {
      d["x"] = (d.layer + 1 - 0.5) * xdist;
      d["y"] = (d.lidx - 0.5) * ydist;
    });

    // draw links
    svg.selectAll(".link")
        .data(graph.connections)
      	.enter().append("line")
        .attr("x1", function(d) { return nodes[d.source].x; })
        .attr("y1", function(d) { return nodes[d.source].y; })
        .attr("x2", function(d) { return nodes[d.target].x; })
        .attr("y2", function(d) { return nodes[d.target].y; })
		.style("stroke", function (d) { return d.weight > 0 ? "#0f0" : "#f00"; })
		.style("stroke-width", function (d) { return d.enabled ? (d.weight > 0 ? 0.3 + d.weight : 0.3 + d.weight*-1) : 0 })
		.style("stroke-width", function(d) { return Math.sqrt(d.value); });

    // draw nodes
    var node = svg.selectAll(".node")
        .data(nodes)
      .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; }
        );

    node.append("circle")
        .attr("class", "node")
        .attr("r", nodeSize)
        .style("fill", function(d) { return color(d.layer); });

    node.append("text")
        .attr("dx", "-.35em")
        .attr("dy", ".35em")
		.text(function(d) { 
			return (!d.isBias ? d.number : 'b') + (d.layer > 0 ? "(" + d.activationFunction + ")" : "") });
	}

	buildGraph() {
		let data = {
			nodes: [],
			connections: []
		};

		let maxLayer = -1;
		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i].output) {
				continue;
			}

			let node = this.nodes[i].clone();

			node.label = node.number;
			node.layer;

			if (node.layer > maxLayer) {
				maxLayer = node.layer;
			}

			data.nodes.push(node);
		}

		for (let i = 0; i < this.nodes.length; i++) {
			if (!this.nodes[i].output) {
				continue;
			}

			let node = this.nodes[i].clone();

			node.label = node.number;
			node.layer = maxLayer + 1;

			data.nodes.push(node);
		}

		this.connections.forEach(conn => {
			data.connections.push({ source: this.getNode(conn.fromNode.number), target: this.getNode(conn.toNode.number), weight: conn.weight, enabled: conn.enabled });
		});

		return data;
	}
}
