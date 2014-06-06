!function() {
	var RAF = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame    ||
		function( callback ){
			window.setTimeout(callback, 1000/60);
		};

	function createTetronimoPath(type, size) {
		return [
			[// O
				[0, 0],
				[0, 2*size],
				[2*size, 2*size],
				[2*size, 0]
			], [// L
				[0, 0],
				[0, 3*size],
				[2*size, 3*size],
				[2*size, 2*size],
				[1*size, 2*size],
				[1*size, 0]
			], [// Z
				[0, 0],
				[1*size, 0],
				[1*size, 1*size],
				[2*size, 1*size],
				[2*size, 3*size],
				[1*size, 3*size],
				[1*size, 2*size],
				[0, 2*size]
			], [// T
				[0, 0],
				[0, 3*size],
				[1*size, 3*size],
				[1*size, 2*size],
				[2*size, 2*size],
				[2*size, 1*size],
				[1*size, 1*size],
				[1*size, 0*size]
			], [// I
				[0, 0],
				[0, 4*size],
				[1*size, 4*size],
				[1*size, 0]
			]
		][type];
	}

	function Tetromino(type, pos) {
		this.type = type;
		this.body = new p2.Body({ position: pos, mass: 10 });
		this.body.fromPolygon(
			createTetronimoPath(type, 20)
		);
		this.body.shapes.forEach(function(shape) {
			shape.material = Tetromino.Material;
		});
		this.body.tetro = this;
	}
	Tetromino.material = new p2.Material();

	Tetromino.prototype.render = function (ctx) {
		ctx.save();
		ctx.translate(this.body.position[0], this.body.position[1]);
		ctx.rotate(this.body.angle);

		ctx.lineWidth = 2;
		ctx.lineJoin = 'round';
		ctx.fillStyle = ["red", "limegreen", "blue", "yellow", "orange"][this.type];

		ctx.beginPath();
		this.body.concavePath.forEach(function (p) {
			ctx.lineTo(p[0], p[1]);
		});
		ctx.lineTo(this.body.concavePath[0][0], this.body.concavePath[0][1]);
		ctx.fill();
		ctx.stroke();

		ctx.restore();
	};

	function TetrisGame(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		this.width = canvas.width;
		this.height = canvas.height;
		this.mouse = [0, 0];

		this.toRemove = [];
		this.tetros = [];

		this.world = new p2.World({gravity: [0, -200]});

        var lrect = new p2.Rectangle(3, this.height);
        var lrectb = new p2.Body({position: [-this.width/2, this.height/2]});
        lrectb.addShape(lrect);
        this.world.addBody(lrectb);

        var rrect = new p2.Rectangle(3, this.height);
        var rrectb = new p2.Body({position: [this.width/2, this.height/2]});
        rrectb.addShape(rrect);
        this.world.addBody(rrectb);



		this.world.addContactMaterial(
			Tetromino.Material, Tetromino.Material, {friction: 100}
		);

		// alternate base
		var baseBody = new p2.Body({position: [0, world.width/2]});

		var points = [];
		for (var i=0; i >= -Math.PI-0.001; i -= Math.PI/8) {
			points.push( [Math.cos(i)*this.width/2, Math.sin(i)*this.width/2] );
		}

		points.push([-this.width/2, -this.width/2-50]);
		points.push([0, -this.width*2]);
		points.push([+this.width/2, -this.width/2-50]);

		baseBody.fromPolygon(points);
		baseBody.shapes.forEach(function(shape) {
			shape.material = Tetromino.Material;
		});
        this.world.addBody(baseBody);




		var myself = this;
		this.world.on("beginContact", function(evt) {
			if (evt.bodyA.tetro && evt.bodyB.tetro
				&& evt.bodyA.tetro.type == evt.bodyB.tetro.type) {
				myself.toRemove.push(evt.bodyA);
				myself.toRemove.push(evt.bodyB);
			}
		});

		canvas.addEventListener("click", function(evt) {
			var x = evt.clientX - this.offsetLeft + document.body.scrollLeft;
			var y = evt.clientY - this.offsetTop + document.body.scrollTop;
			myself.mouse = [x, y];

			var t = new Tetromino(Math.floor(Math.random() * 5), [x - myself.width/2, myself.height - y]);
			myself.tetros.push(t);
			myself.world.addBody(t.body);
		});

		RAF(function() {myself.step(); });
	}






	TetrisGame.prototype.render = function (ctx) {
		// clear
		this.canvas.width = this.canvas.width + 0;

		// Transform to the right coordinate system
		// nothing too fancy...
		ctx.save();
		ctx.translate(this.width/2, this.height);
		ctx.scale(1, -1);

		// Render all my tetrahedrons
		this.tetros.forEach(function (t) {
			t.render(ctx);
		});

		ctx.restore();
	};







	// Step renderer, world
	TetrisGame.prototype.step = function (time) {
		this.world.step(1/60);
		this.render(this.ctx);

		this.tetros.forEach(function(t) {
			if (t.body.position[1] > this.height - 50) {
				console.log("lost");
			}
		});

		var myself = this;
		RAF(function() {myself.step(); });
	};

	// Start a new game on a new canvas
	window.addEventListener("load", function () {
		var can = document.getElementById("world");
		var game = new TetrisGame(can);
	});
}();
