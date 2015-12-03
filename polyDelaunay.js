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
		ctx.fillStyle = getRandomColor();
		ctx.fill();
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
	var dB = Bx*Bx + Bx*By;
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
	console.log(center);
	var dist1 = dist(t.p1, center);
	var dist2 = dist(p, center);
	if (dist2 > dist1) {
		return false;
	} else {
		return true;
	}
}	

function nonSharedEdges(t, triangles) {
	var nonShared = [];
	for(var i = 0; i < triangles.length; i++) {
		var points = triangles[i].points;
		if(points.indexOf(t.p1) == -1) {
			nonShared.push(new Edge(t.p1, t.p2));
			nonShared.push(new Edge(t.p1, t.p3));
		}
		if (points.indexOf(t.p2) == -1) {
			nonShared.push(new Edge(t.p2, t.p1));
			nonShared.push(new Edge(t.p2, t.p3));
		}
		if (points.indexOf(t.p3) == -1) {
			nonShared.push(new Edge(t.p3, t.p2));
			nonShared.push(new Edge(t.p3, t.p1));
		}
	}
	return nonShared;
}

function pushFirstPoint(point, triangulation) {
	var supertri = triangulation[0];
	var tri1 = new Triangle(point, supertri.p1, supertri.p2);
	var tri2 = new Triangle(point, supertri.p1, supertri.p3);
	var tri3 = new Triangle(point, supertri.p2, supertri.p3);
	triangulation.push(tri1);
	triangulation.push(tri2);
	triangulation.push(tri3);
}

function bowyerWatson(pointlist) {
	var triangulation = [];
	var superTri = createSuper(pointlist);
	triangulation.push(superTri);
	pushFirstPoint(pointlist[0], triangulation);
	for (var i = 1; i < pointlist.length -3 ; i++) {
		var	badTriangles = [];
		for (var j = 1; j < triangulation.length; j++) {
			if (pointInside(pointlist[i], triangulation[j])) {
				badTriangles.push(triangulation[j]);
			}
		}
		for (var k = 0; k < badTriangles.length; k++) {
			var index = triangulation.indexOf(badTriangles[k]);
			if(index > -1) {
				triangulation.splice(index,1);
			}
		}
		var	polygon = [];
		for (var n = 0; n < badTriangles.length; n++) {
			var nonShared = nonSharedEdges(badTriangles[n], badTriangles);
			for (var k = 0; k < nonShared.length; k++) {
				polygon.push(nonShared[k]);
			}
		}
		for(var l = 0; l < polygon.length; l++) {
			var p1 = polygon[l].start;
			var p2 = polygon[l].end;
			var p3 = pointlist[i];
			var	newTri = new Triangle(p1,p2,p3);
			triangulation.push(newTri);
		}

	}
	var toBeCleaned = [];
	for (var i = 0; i < triangulation.length; i++) {
		if (superTri.points.indexOf(triangulation[i].p1) > -1 || superTri.points.indexOf(triangulation[i].p2) > -1 || superTri.points.indexOf(triangulation[i].p3) > -1) {
			triangulation[i] = null;
		}
	}
	return triangulation;

}


$(document).ready(function(){

	var pointlist = [];

	for (var i = 0; i < 6; i++) {
		var x = rInt(50, 850);
		var y = rInt(50,x);
		pointlist.push(new Point(x,y));
	}

	pointlist.push(new Point(50,50));
	pointlist.push(new Point(850,50));
	pointlist.push(new Point(850,850));

	for (var i = 0; i < pointlist.length; i++) {
		ctx.fillRect(pointlist[i].x,pointlist[i].y,2,2);
	}

	var triangulations= bowyerWatson(pointlist);
	for (var i = 0; i < triangulations.length; i++) {
		if (triangulations[i] != null) {

			triangulations[i].draw();
		}
	}	
});
