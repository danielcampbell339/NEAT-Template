class Goal {
	constructor(){
		this.pos = createVector(random(width), height - 10);
		this.vel = createVector(0, 0);
		this.r = 15;
	}

	show(){
		fill(0, 255, 0);
		ellipse(this.pos.x, this.pos.y, this.r);
	}
}