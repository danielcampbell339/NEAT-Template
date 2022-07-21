let population;
let generation = 0;

let goal;

function setup() {
	let canvasDiv = document.getElementById('canvascontainer');
    let width = canvasDiv.offsetWidth;
    let sketchCanvas = createCanvas(width, 500);
    sketchCanvas.parent("canvascontainer");

	population = new Population(populationSize);
	goal = new Goal();
}

function draw() {
	background(51);

	cycles = select('#speedSlider').value();
	select('#speed').html(cycles);

	goal.show();

	for(let i = 0; i < cycles; i++) {
		if(!population.done()) {
			population.updateAlive();
		}
		else {
			population.naturalSelection();
		}
	}

	document.getElementById('generation').innerHTML = generation;
	document.getElementById('population').innerHTML = populationSize;
	document.getElementById('frame_rate').innerHTML = floor(frameRate());
}