(function() {
	/*
		Ulam Spiral Generator
		By: Zachary Cava
		Primes... they're awesome.
	*/
	var PRIMES_UP_TO = 10000;
	var CANVAS_SIZE = 400;
	var SCALE = 4;
	var primeList = [];
	window.onload = function() {
		recalc();
		document.getElementById("scale").onchange = redraw;
		document.getElementById("primeMax").onchange = recalc;
	}

	function generatePrimes() {
		// quick set of primes via sieve of Eratosthenes
		// works but horrible with memory consumption
		var primes = [];
		var numbers = [];
		for(var i = 2; i < PRIMES_UP_TO; i++) {
			numbers.push(i);
		}
		while(numbers.length > 0) {
			var prime = numbers.shift();
			primes.push(prime);
			numbers = numbers.filter(function(elm) { return elm % prime != 0 });
		}
		return primes;
	}

	function generatePrimesOptimized() {
		// optimized version of Eratosthenes, purdy
		var numbers = Array(Math.ceil(PRIMES_UP_TO / 32));
		for(var i = 0; i < numbers.length; i++) {
			numbers[i] = -1;
		}
		// drop the first two numbers, 0 and 1, obviously not prime
		numbers[0] &= (-1 << 2);
		for(var i = 2; i < PRIMES_UP_TO; i++) {
			// check if i is prime, no need to loop if it isnt
			var pos = parseInt(i / 32);
			var entry = i % 32;
			var bit = (numbers[pos] & (0x1 << entry)) >> entry;
			if(bit != 0) {
				// go to each multiple of i and remove it from the list
				for(var j = i + i; j < PRIMES_UP_TO; j += i) {
					var pos = parseInt(j / 32);
					var entry = j % 32;
					// check if j is prime, if not mark it not prime
					if(j % i == 0) {
						// build mask
						var mask = -1 << entry;
						var num = numbers[pos];
						num = (num & (mask << 1)) | (num & ~mask);
						numbers[pos] = num;
					}
				}
			}
		}
		var primes = [];
		for(var i = 2; i < PRIMES_UP_TO; i++) {
			var pos = parseInt(i / 32);
			var entry = i % 32;
			// check if prime
			var num = numbers[pos];
			var bit = (num & (0x1 << entry)) >> entry;
			if(bit == 0x1 || bit == -1) {
				primes.push(i);
			}
		}
		return primes;
	}

	function recalc() {
		PRIMES_UP_TO = parseInt(document.getElementById("primeMax").value);
		CANVAS_SIZE = parseInt(Math.sqrt(PRIMES_UP_TO)) + 1;
		primeList = generatePrimesOptimized();
		redraw();
	}

	function redraw() {
		SCALE = parseInt(document.getElementById("scale").value);
		var canvas = document.getElementById("theCanvas");
		var ctx = canvas.getContext("2d");
		canvas.setAttribute('width', CANVAS_SIZE * SCALE);
		canvas.setAttribute('height', CANVAS_SIZE * SCALE);
		canvas.style.width = CANVAS_SIZE * SCALE + "px";
		canvas.style.height = CANVAS_SIZE * SCALE + "px";
		var center = CANVAS_SIZE / 2 * SCALE;
		drawSpiral(ctx, center, center);
	}

	function drawSpiral(ctx, x, y) {
		var values = primeList;
		ctx.fillStyle = "red";
		ctx.fillRect(x, y, SCALE, SCALE);
		ctx.fillStyle = "black";
		var num = 1;
		var steps = 0;
		var level = 1;
		var dir = 3; // 0 up, 1 left, 2 down, 3 right
		var i = 0; 
		while(i < values.length) {
			if(num == values[i]) {
				ctx.fillRect(x, y, SCALE, SCALE);
				i++;
			}
			// if sqrt(num) is integer and odd, I.E. mod 2 == 1, then i need to go 1 right and the level is the sqrt + 2, direction up
			// figure out next direction
			if(Math.sqrt(num) % 2 == 1) {
				// go right
				x += SCALE;
				// setup next level stuff
				level = Math.sqrt(num) + 2;
				steps = 0;
				dir = 0;
			} else {
				var changeAt = level - 1;
				switch(dir) {
					case 0:
						y -= SCALE;
						changeAt = level - 2;
						break;
					case 1:
						x -= SCALE;
						break;
					case 2:
						y += SCALE;
						break;
					case 3:
						x += SCALE;
						break;
				}
				steps++;
				if(steps == changeAt) {
					dir = (dir + 1) % 4;
					steps = 0;
				}
			}
			num++;
		}
	}
})();
