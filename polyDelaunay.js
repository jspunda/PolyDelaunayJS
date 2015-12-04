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

function Point(x,y) {
	this.x = x;
	this.y = y;	
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
	this.draw = function() {
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
		var c1 = getRandomColor();
		var c2 = getRandomColor();
		grd.addColorStop(0,c1);
		grd.addColorStop(1,c2);
		ctx.fillStyle = grd;
		ctx.fill();
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
	var center = circumCenter(t);
	var dist1 = dist(t.p1, center);
	var dist2 = dist(p, center);
	if (dist2 > dist1) {
		return false;
	} else {
		return true;
	}
}	

function equalPoint(p1,p2) {
	if (p1.x == p2.x && p1.y == p2.y) {
		return true;
	} else {
		return false;
	}
}

function equalEdge(e1,e2) {
	if ((equalPoint(e1.start, e2.start) && equalPoint(e1.end, e2.end)) || (equalPoint(e1.end, e2.start) && equalPoint(e1.start, e2.end))) {
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
				if (equalEdge(array[i],array[j])) {
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
		}
		var	polygon = handleBadTriangles(badTriangles);
		for(var l = 0; l < polygon.length; l++) {
			var p1 = polygon[l].start;
			var p2 = polygon[l].end;
			var p3 = pointlist[i];
			var	newTri = new Triangle(p1,p2,p3);
			triangulation.push(newTri);
		}

	}
	for (var i = triangulation.length -1; i >= 0; i--) {
		if (superTri.points.indexOf(triangulation[i].p1) > -1 || superTri.points.indexOf(triangulation[i].p2) > -1 || superTri.points.indexOf(triangulation[i].p3) > -1) {
			triangulation.splice(i,1);

		}
	}
	return triangulation;

}


$(document).ready(function(){

	var pointlist = [];

	for (var i = 0; i < 500; i++){
		var x = rInt(0, 1920);
		var y = rInt(0,1080);
		pointlist.push(new Point(x,y));
	}

	pointlist.push(new Point(-1000,-100));
	pointlist.push(new Point(3900,-100));
	pointlist.push(new Point(850,12850));


	for (var i = 0; i < pointlist.length; i++) {
		//ctx.fillRect(pointlist[i].x,pointlist[i].y,4,4);
	}

	var triangulations= bowyerWatson(pointlist);
	console.log(triangulations.length);
	for (var i = 0; i < triangulations.length; i++) {
		if (triangulations[i] != null) {

			triangulations[i].drawLine();
		}
	}	
});
