// slack-calc
// by James Vaughan

// Make DOM queries nicer
const $ = selector => document.querySelector(selector)

// Setup the canvas
const canvas = $("#canvas")
const ctx = canvas.getContext("2d")
onresize = () => {
  canvas.width = innerWidth
	canvas.height = 2 * innerHeight / 3
}

// Display the tension
function updateTension() {
	const length = parseFloat($("#length").value) || 0
	const sag = parseFloat($("#sag").value) || 0
	const weight = parseFloat($("#weight").value) || 0
  const lbf = Math.ceil(weight
		* Math.sqrt(Math.pow(length / 2, 2) + Math.pow(sag, 2))
    / (2 * sag))
  const kn = lbf * 0.004448221615
	$("#tensionValue").innerHTML = `${lbf} lbf (${kn.toFixed(2)} kn)`
}

// Make the input scrubbable
// inspired by Nicky Case (ncase.me) and his Matrix visualizer
let scrubbing = null
let scrubPosition = 0
let scrubStartValue = 0
Array.from(document.querySelectorAll("input")).forEach(input => {
	input.oninput = updateTension
	input.onmousedown = e => {
		scrubbing = e.target
		scrubPosition = e.clientX
		scrubStartValue = parseFloat(input.value)
	}
})
onmousemove = e => {
	if (scrubbing) {
		scrubbing.blur()
		const delta = Math.round((e.clientX - scrubPosition) / 5)
		scrubbing.value = Math.floor(scrubStartValue + delta)
		updateTension()
	}
}
onmouseup = () => scrubbing = null

// Draw the scene
ctx.fillCircle = function (x, y, radius) {
  this.beginPath()
  this.arc(x, y, radius, 0, 2 * Math.PI)
  this.fill()
}

ctx.fillCloud = function (x, y, s) {
  this.beginPath()
  this.arc(x, y, 10 * s, Math.PI / 2, 3 * Math.PI / 2)
  this.arc(x + 20 * s, y - 10 * s, 20 * s, Math.PI, 9 * Math.PI / 5)
  this.arc(x + 40 * s, y - 7.5 * s, 15 * s, 7 * Math.PI / 5, 0)
  this.arc(x + 55 * s, y, 10 * s, 3 * Math.PI / 2, Math.PI / 2)
  this.closePath()
  this.fill()
}

// Get started!
onresize()
updateTension()
requestAnimationFrame(function draw(timestamp) {
	const lineSag = parseInt($("#sag").value)
	let lineLength = parseInt($("#length").value)
	lineLength = lineLength < 10 ? 10
		: lineLength > 300 ? 300
		: lineLength || 50
	const sag = lineSag < 1 ? 1 : lineSag > 10 ? 10 : lineSag || 1
  const length = (lineLength - 10) / (290)

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw sky
  ctx.fillStyle = "skyblue"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw sun
  ctx.fillStyle = "yellow"
  ctx.fillCircle(4 * canvas.width / 5, canvas.height / 3,
    Math.sqrt(canvas.width * canvas.height) / 7)

  // Draw cloud
  const cloudPosition = (speed, start) =>
    ((start + speed * timestamp / 20) % (canvas.width + 550)) - 400
  ctx.fillStyle = "ghostwhite"
  ctx.fillCloud(cloudPosition(1.2, 1000), 200, 2)
  ctx.fillCloud(cloudPosition(0.2, 0), 200, 0.2)
  ctx.fillCloud(cloudPosition(0.2, 700), 200, 0.2)
  ctx.fillCloud(cloudPosition(0.5, 200), 100, 0.5)
  ctx.fillCloud(cloudPosition(0.5, 900), 100, 0.5)
  ctx.fillCloud(cloudPosition(0.75, 400), 300, 0.75)
  ctx.fillCloud(cloudPosition(1, 600), 250, 1)

  // Draw grass
  ctx.fillStyle = "lawngreen"
  ctx.fillRect(0, 3 * canvas.height / 4, canvas.width, canvas.height / 4)

  // Draw trees
  const treeScale = (1 - length)
  const treeSideMargin = 20 + treeScale * canvas.width / 5
  const treeBottom = canvas.height - 20
  const treeWidth = 30 + treeScale * 80
  const treeHeight = 100 + treeScale * 200
  const treeRadius = treeWidth
  ctx.fillStyle = "peru"
  ctx.fillRect(treeSideMargin, treeBottom, treeWidth, -treeHeight)
  ctx.fillRect(canvas.width - treeSideMargin - treeWidth,
               treeBottom, treeWidth, -treeHeight)
  ctx.fillStyle = "forestgreen"
  ctx.fillCircle(treeSideMargin + (treeWidth / 2), treeBottom - treeHeight,
          treeRadius)
  ctx.fillCircle(canvas.width - treeSideMargin - (treeWidth / 2),
          treeBottom - treeHeight, treeRadius)

  // Draw line
  const lineHeight = (treeBottom - 60) - (100 * treeScale)
  ctx.strokeStyle = "ghostwhite"
  ctx.lineJoin = "round"
  ctx.lineWidth = 3 + 10 * (1 - length)
  ctx.beginPath()
  ctx.moveTo(treeSideMargin, lineHeight)
  ctx.lineTo(treeSideMargin + treeWidth, lineHeight)
	ctx.lineTo(canvas.width / 2, lineHeight + 12 * sag)
  ctx.lineTo(canvas.width - treeSideMargin - treeWidth, lineHeight)
  ctx.lineTo(canvas.width - treeSideMargin, lineHeight)
  ctx.stroke()

  // animate
  requestAnimationFrame(draw)
})
