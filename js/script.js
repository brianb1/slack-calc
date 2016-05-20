// slack-calc
// by James Vaughan


// Setup the canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
function resize() {
  canvas.width = innerWidth;
	canvas.height = 2 * innerHeight / 3;
}
resize();
onresize = resize;


// Display the tension
const lengthInput = document.getElementById("length");
const sagInput = document.getElementById("sag");
const weightInput = document.getElementById("weight");
const tension = document.getElementById("tensionValue");
function updateTension() {
	let length = parseFloat(lengthInput.value) || 0;
	let sag = parseFloat(sagInput.value) || 0;
	let weight = parseFloat(weightInput.value) || 0;
	tension.innerHTML = Math.ceil(weight
		* Math.sqrt(Math.pow(length / 2, 2) + Math.pow(sag, 2))
    / (2 * sag));
}
updateTension();
lengthInput.oninput = updateTension;
sagInput.onkeydown = updateTension;
weightInput.onkeydown = updateTension;


// Draw the scene
ctx.fillCircle = function (x, y, radius) {
  this.beginPath();
  this.arc(x, y, radius, 0, 2 * Math.PI);
  this.fill();
};

ctx.fillCloud = function (x, y, s) {
  ctx.beginPath()
	ctx.arc(x, y, 10 * s, Math.PI / 2, 3 * Math.PI / 2);
	ctx.arc(x + 20 * s, y - 10 * s, 20 * s, Math.PI, 9 * Math.PI / 5);
	ctx.arc(x + 40 * s, y - 7.5 * s, 15 * s, 7 * Math.PI / 5, 0);
  ctx.arc(x + 55 * s, y, 10 * s, 3 * Math.PI / 2, Math.PI / 2);
	ctx.closePath();
  ctx.fill();
};

function draw(timestamp) {
	let lineLength = parseInt(document.getElementById("length").value);
	let lineSag = parseInt(document.getElementById("sag").value);
	lineLength = lineLength < 10 ? 10 : lineLength > 300 ? 300 : lineLength || 50;
	lineSag = lineSag < 1 ? 1 : lineSag > 10 ? 10 : lineSag || 1;
  let length = (lineLength - 10) / (290);
  let sag = (lineSag - 10) / (290);
	//lineSag = 1 + (9 * (1 + Math.cos(timestamp / 100)) / 2);

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw sky
  ctx.fillStyle = "skyblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw sun
  ctx.fillStyle = "yellow";
  ctx.fillCircle(4 * canvas.width / 5, canvas.height / 3,
          Math.sqrt(canvas.width * canvas.height) / 7);

  // Draw cloud
	let cloudPosition = function (speed, start) {
		return ((speed * (timestamp / 20) + start) % (canvas.width + 550)) - 400;
	}

  ctx.fillStyle = "ghostwhite";
  ctx.fillCloud(300, 200, 2);
  ctx.fillCloud(cloudPosition(0.2, 0), 200, 0.2);
  ctx.fillCloud(cloudPosition(0.2, 700), 200, 0.2);
  ctx.fillCloud(cloudPosition(0.5, 200), 100, 0.5);
  ctx.fillCloud(cloudPosition(0.5, 900), 100, 0.5);
  ctx.fillCloud(cloudPosition(0.75, 400), 300, 0.75);
  ctx.fillCloud(cloudPosition(1, 600), 250, 1);

  // Draw grass
  ctx.fillStyle = "lawngreen";
  ctx.fillRect(0, 3 * canvas.height / 4, canvas.width, canvas.height / 4);

  // Draw trees
  let treeScale = (1 - length);
  const treeSideMarginPercent = 20 * treeScale;
  const treeSideMargin = 20 + treeSideMarginPercent * canvas.width / 100;
  const treeBottom = canvas.height - 20;
  const treeWidth = 30 + treeScale * 80;
  const treeHeight = 100 + treeScale * 200;
  const treeRadius = treeWidth;
  ctx.fillStyle = "peru";
  ctx.fillRect(treeSideMargin, treeBottom, treeWidth, -treeHeight);
  ctx.fillRect(canvas.width - treeSideMargin - treeWidth,
               treeBottom, treeWidth, -treeHeight);
  ctx.fillStyle = "forestgreen";
  ctx.fillCircle(treeSideMargin + (treeWidth / 2), treeBottom - treeHeight,
          treeRadius);
  ctx.fillCircle(canvas.width - treeSideMargin - (treeWidth / 2),
          treeBottom - treeHeight, treeRadius);

  // Draw line
  let lineHeight = (treeBottom - 60) - (100 * treeScale);
  ctx.strokeStyle = "ghostwhite";
  ctx.lineJoin = "round";
  ctx.lineWidth = 3 + 10 * (1 - length);
  ctx.beginPath();
  ctx.moveTo(treeSideMargin, lineHeight);
  ctx.lineTo(treeSideMargin + treeWidth, lineHeight);
	ctx.lineTo(canvas.width / 2, lineHeight + 12 * lineSag);
  ctx.lineTo(canvas.width - treeSideMargin - treeWidth, lineHeight);
  ctx.lineTo(canvas.width - treeSideMargin, lineHeight);
  ctx.stroke();

  // animate
  requestAnimationFrame(draw);
}
requestAnimationFrame(draw);