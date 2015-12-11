var c = document.getElementById("mycanvas");
var ctx = c.getContext("2d")

function getRandomColor() {
  var r = Math.floor(Math.random() * 256);
  var g = Math.floor(Math.random() * 256);
  var b = Math.floor(Math.random() * 256);
 
  var hexR = r.toString(16);
  var hexG = g.toString(16);
  var hexB = b.toString(16);
 
  if (hexR.length == 1) {
    hexR = "0" + hexR;
  }
 
  if (hexG.length == 1) {
    hexG = "0" + hexG;
  }
 
  if (hexB.length == 1) {
    hexB = "0" + hexB;
  }
 
  var hexColor = "#" + hexR + hexG + hexB;
   
  return hexColor.toUpperCase();
}

function ColorScheme(colors) {
	var colors = colors;

	this.getRandom = function() {
		var randomIndex = rInt(0, colors.length-1);
		return colors[randomIndex];
	}

	this.addColor = function(color) {
		colors.push(color);
	}

	this.getAll = function() {
		return colors;
	}
}

function Point(x,y) {
	this.x = x;
	this.y = y;	
	this.draw = function() {
		ctx.fillStyle = 'Black';
		ctx.fillRect(x,y,3,3);
	}
}

function dist(p1,p2) {
	var a = Math.abs(p1.x - p2.x);
	var b = Math.abs(p1.y - p2.y);
	return Math.sqrt(a*a + b*b);
}

function Edge(start, end) {
	this.start = start;
	this.end = end;
	this.draw = function() {
		this.start.draw();
		this.end.draw();
		ctx.strokeStyle = 'Black';
		ctx.beginPath();
		var x = start.x;
		var y = start.y;
		ctx.moveTo(x,y);
		x = end.x;
		y = end.y;
		ctx.lineTo(x,y);
		ctx.stroke();
	}
}

function Triangle(p1, p2, p3) {
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;
	this.points = [p1,p2,p3];
	this.e1 = new Edge(p1,p2);
	this.e2 = new Edge(p1,p3);
	this.e3 = new Edge(p2,p3);
	this.edges = [this.e1,this.e2,this.e3];
	this.circum = circumCenter(this);
	this.neighbors = [];

	this.draw = function(colorScheme) {
	//	ctx.lineJoin = 'round';
		ctx.lineWidth = 1;
		ctx.beginPath();
		var x = p1.x;
		var y = p1.y;
		ctx.moveTo(x,y);
		x = p2.x;
		y = p2.y;
		ctx.lineTo(x,y);
		x = p3.x;
		y = p3.y;
		ctx.lineTo(x,y);
		var grd=ctx.createLinearGradient(p1.x,p1.y,p2.x,p2.y);
		var c1 = colorScheme.getRandom();
		var c2 = colorScheme.getRandom();
		grd.addColorStop(0,c1);
		grd.addColorStop(1,c2);
		ctx.closePath();
		ctx.fillStyle = grd;
		ctx.strokeStyle = grd;
		ctx.stroke();
		ctx.fill();
		this.circum.draw();
	}

	this.drawLine = function() {
		ctx.beginPath();
		var x = p1.x;
		var y = p1.y;
		ctx.moveTo(x,y);
		x = p2.x;
		y = p2.y;
		ctx.lineTo(x,y);
		x = p3.x;
		y = p3.y;
		ctx.lineTo(x,y);
		ctx.closePath();
		ctx.stroke();
	}

	this.sharesEdge = function(triangle) {
		var edges = triangle.edges;
		for (var i = 0; i < edges.length; i++) {
			if (compareEdge(edges[i], this.e1) || compareEdge(edges[i], this.e2) || compareEdge(edges[i], this.e3)) {
				return true;
			}
		}
		return false;
	}

	this.addNeighbor = function(triangle) {
		this.neighbors.push(triangle);
	}
}

function rInt(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function createSuper(pointlist) {
	var p1 = pointlist[pointlist.length-3];
	var p2 = pointlist[pointlist.length-2];   
	var p3 = pointlist[pointlist.length-1];
	var tri = new Triangle(p1,p2,p3);
	return tri;
}

function circumCenter(t) {
	var Ax = t.p1.x;
	var Ay = t.p1.y;
	var Bx = t.p2.x;
	var By = t.p2.y;
	var Cx = t.p3.x;
	var Cy = t.p3.y;
	var dA = Ax*Ax + Ay*Ay;
	var dB = Bx*Bx + By*By;
	var dC = Cx*Cx + Cy*Cy;

	var x = ((dA*(Cy-By) + dB*(Ay-Cy) + dC*(By-Ay))) /  (2*(Ax*(Cy-By) + Bx*(Ay-Cy) + Cx*(By-Ay)))
	var y =  (-(dA*(Cx-Bx) + dB*(Ax-Cx) + dC*(Bx-Ax))) / (2*(Ax*(Cy-By) + Bx*(Ay-Cy) + Cx*(By-Ay))) 
	return new Point(x,y);
}

function circumRadius(t) {
	var a = t.e1;
	var b = t.e2;
	var c = t.e3;
	return (a * b * c)/(Math.sqrt((a+b+c) * (b+c-a) * (c+a-b) * (a+b-c)));
}	

function pointInside(p, t) {
	var center = t.circum;
	var dist1 = dist(t.p1, center);
	var dist2 = dist(p, center);
	if (dist2 > dist1) {
		return false;
	} else {
		return true;
	}
}	

function comparePoint(p1,p2) {
	if (p1.x == p2.x && p1.y == p2.y) {
		return true;
	} else {
		return false;
	}
}

function compareEdge(e1,e2) {
	if ((comparePoint(e1.start, e2.start) && comparePoint(e1.end, e2.end)) || (comparePoint(e1.end, e2.start) && comparePoint(e1.start, e2.end))) {
		return true;
	} else {
		return false;
	}
}

function removeDuplicates(array) {
	var unique = [];
	for( var i = 0; i < array.length; i++) {
		var match = 0;
		for (var j = 0; j < array.length; j++) {
			if(i != j) {
				if (compareEdge(array[i],array[j])) {
					match++;
				}
			}
		}
		if (match == 0) {
			unique.push(array[i]);
		}
	}
	return unique;
}

function handleBadTriangles(badTriangles) {
	var allEdges = [];
	for (var i = 0; i < badTriangles.length; i++) {
		for (var j = 0; j < 3; j++) {
			allEdges.push(badTriangles[i].edges[j]);
		}
	}
	uniqueEdges = removeDuplicates(allEdges);
	return uniqueEdges;
}

function bowyerWatson(pointlist) {
	var triangulation = [];
	var superTri = createSuper(pointlist);
	triangulation.push(superTri);
	for (var i = 0; i < pointlist.length -3 ; i++) {
		var	badTriangles = [];
		for (var j = triangulation.length-1; j >= 0; j--) {
			if (pointInside(pointlist[i], triangulation[j])) {
				badTriangles.push(triangulation[j]);
				triangulation.splice(j,1);
			}
		}			this.triangulation = [];
		var	polygon = handleBadTriangles(badTriangles);
		var toBeAdded = [];
		for(var l = 0; l < polygon.length; l++) {
			var p1 = polygon[l].start;
			var p2 = polygon[l].end;
			var p3 = pointlist[i];
			var	newTri = new Triangle(p1,p2,p3);
			triangulation.push(newTri);
			toBeAdded.push(newTri);
		}

	}
	for (var i = triangulation.length -1; i >= 0; i--) {
		if (superTri.points.indexOf(triangulation[i].p1) > -1 || superTri.points.indexOf(triangulation[i].p2) > -1 || superTri.points.indexOf(triangulation[i].p3) > -1) {
			triangulation.splice(i,1);
		}
	}
	return triangulation;
}

function buildNeighbors(toBeAdded) {
	for (var k = 0; k < toBeAdded.length; k++) {
		for (var m = 0; m < toBeAdded.length; m++) {
			if (m != k && (toBeAdded[k].neighbors.length < 3 || toBeAdded[m].neighbors.length < 3)) {
				if (toBeAdded[k].sharesEdge(toBeAdded[m])) {
					toBeAdded[k].addNeighbor(toBeAdded[m]);
					toBeAdded[m].addNeighbor(toBeAdded[k]);
				}
			}
		}
	}
	return toBeAdded;
}

function voronoi(triangulation) {
	var triangulation = buildNeighbors(triangulation);
	var voronoiDiagram = [];
	for (var i = 0; i < triangulation.length; i++) {
		console.log(triangulation[i].neighbors);
		for (var j = 0; j < triangulation[i].neighbors.length; j++) {
			voronoiDiagram.push(new Edge(triangulation[i].circum, triangulation[i].neighbors[j].circum));
			triangulation[i].neighbors[j].neighbors.splice(triangulation[i],1);
		}
	}
	return voronoiDiagram;
}

$(document).ready(function(){
	var Delaunay = function(pts){
		this.points = pts;
		this.triangulation = [];
		this.globalTriangles = [];
		this.accentedTriangles = [];
		
		this.colorGlobal1 = '#eef3f3';
		this.colorGlobal2 = '#7cbee6';
		this.colorGlobal3 = '#d1e0f3';
		this.colorGlobal4 = '#e1f1f6';
		this.colorAccent1 = '#fd5e62';
		this.colorAccent2 = '#cb3f47';
		this.colorAccent3 = '#ffd2b8';
		this.colorAccent4 = '#4b77ad';
		this.colorAccent5 = '#3d3b6e';

		this.triangulate = function() {
			this.triangulation = [];
			this.list = [];
			this.globalTriangles=[];
			this.accentedTriangles = [];

			for (var i = 0; i < this.points; i++){
				var x = rInt(0, c.width);
				var y = rInt(0,c.height);
				this.list.push(new Point(x,y));
			}
			
			this.list.push(new Point(-1000,-100));
			this.list.push(new Point(3900,-100));
			this.list.push(new Point(850,12850));

			this.triangulation = bowyerWatson(pointlist.list);
			for (var i = 0; i < this.triangulation.length; i++) {
				if(rInt(1,10) > 1) {
					this.globalTriangles.push(this.triangulation[i]);
				} else {
					this.accentedTriangles.push(this.triangulation[i]);
				}
			}
			this.colorFill();
		};

		this.colorFill = function(random) {
			ctx.clearRect(0, 0, c.width, c.height);	
			var globalColors, accentColors;
			if (random) {
				var globals = [];
				var accents = [];
				for (var i = 0; i < 4; i++) {
					globals.push(getRandomColor());
				}
				globalColors = new ColorScheme(globals);
				for (var i = 0; i < 5; i++) {
					accents.push(getRandomColor());
				}
				accentColors = new ColorScheme(accents);
			} else {
				globalColors = new ColorScheme([this.colorGlobal1,this.colorGlobal2, this.colorGlobal3, this.colorGlobal4]);
				accentColors = new ColorScheme([this.colorAccent1,this.colorAccent2, this.colorAccent3, this.colorAccent4, this.colorAccent5]);
			}

			for (var i = 0; i < this.globalTriangles.length;i++) {
				this.globalTriangles[i].draw(globalColors);
			}
			for (var i = 0; i < this.accentedTriangles.length; i++) {
				this.accentedTriangles[i].draw(accentColors);
			}
		};

		this.randomFill = function() {
			this.colorFill(true);
		};

		this.voronoi = function() {
			ctx.clearRect(0,0,c.width,c.height);
			var vorDia = voronoi(this.triangulation);
			for (var i = 0; i < vorDia.length; i++) {
				vorDia[i].draw();
			}
		}

	};

	var pointlist = new Delaunay(400);
	pointlist.triangulate();
	var gui = new dat.GUI();
	var triangleFolder = gui.addFolder("Triangles");
	var colorFolder = gui.addFolder("Colors");
	var voroFolder = gui.addFolder("Voronoi");
	voroFolder.add(pointlist, 'voronoi');
   	triangleFolder.add(pointlist, 'points');
	triangleFolder.add(pointlist, 'triangulate');
	colorFolder.addColor(pointlist, 'colorGlobal1');
	colorFolder.addColor(pointlist, 'colorGlobal2');
	colorFolder.addColor(pointlist, 'colorGlobal3');
	colorFolder.addColor(pointlist, 'colorGlobal4');
	colorFolder.addColor(pointlist, 'colorAccent1');
	colorFolder.addColor(pointlist, 'colorAccent2');
	colorFolder.addColor(pointlist, 'colorAccent3');
	colorFolder.addColor(pointlist, 'colorAccent4');
	colorFolder.addColor(pointlist, 'colorAccent5');
	colorFolder.add(pointlist, 'colorFill');
	colorFolder.add(pointlist, 'randomFill');
}); 
