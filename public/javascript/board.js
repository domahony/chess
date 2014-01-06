
function createStyle(d) {
	return function() {
		var ret = d.createElementNS("http://www.w3.org/2000/svg", "style");
		ret.setAttribute("type", "text/css");
		var g = d.createTextNode("g {pointer-events: none;} ");
		var path = d.createTextNode("path {pointer-events: none;} ");
		var selected = d.createTextNode("rect.selected {fill: none; stroke-width: 15; stroke: yellow; } ");
		var targeted = d.createTextNode("rect.targeted {fill: none; stroke-width: 15; stroke: green; } ");
		var unselected = d.createTextNode("rect.unselected {fill: none; stroke-width: 1; stroke: none; } ");
		ret.appendChild(g);
		ret.appendChild(path);
		ret.appendChild(selected);
		ret.appendChild(unselected);
		ret.appendChild(targeted);
		return ret;
	};
}

var VALID_MOVES = [];

function isValid(move)
{
	for (var i = 0; i < VALID_MOVES.length; i++) {
		
		if (move == VALID_MOVES[i].move) {
			return true;
		}
		
	}
	
	return false;
}

function getLocation(rect)
{
	var l = /rect([A-H])([1-8])/.exec(rect);
	return {
		file: l[1],
		rank: l[2]
	};
}

function pawnmove() {
	var loc = getLocation(this.rect);
	
	if (loc.rank == 1 || loc.rank == 8) {
		return [];
	}
	
	console.log("LOCATION: " + loc);
	
	var dir = 1;
	if (this.color == "BLACK") {
		dir = -1;
	}
	
	var ret = [];
	
	var home = 2;
	if (this.color == "BLACK") {
		home = 7;
	}
	
	var f = loc.file;
	var move = {
			target: "rect" + f + (+loc.rank + dir),
			id: f.toLowerCase() + (+loc.rank + dir),
			piece: this.svgid,
	};
	
	if (isValid(move.id)) {
		ret.push(move);
	}
	
	move = {
			target: "rect" + f + (+loc.rank + dir + dir),
			id: f.toLowerCase() + (+loc.rank + dir + dir),
			piece: this.svgid,
	};
	if (isValid(move.id)) {
		ret.push(move);
	}
	
	var files = [];
	var f = +FILE_MAP[loc.file] + 1;   
	if (FILE_ARRAY[f] != null) {
		files.push(FILE_ARRAY[f]);
	}
	
	f = +FILE_MAP[loc.file] - 1;   
	if (FILE_ARRAY[f] != null) {
		files.push(FILE_ARRAY[f]);
	}
	
	for (var i = 0; i < files.length; i++) {
		move = {
			target: "rect" + files[i] + (+loc.rank + dir),
			id: loc.file + "x" + files[i].toLowerCase() + (+loc.rank + dir),
			piece: this.svgid,
		};
		if (isValid(move.id)) {
			ret.push(move);
		}
		
	}
	
	return ret;
}


function unselectTargets(wrapper, targets) {
	
	if (targets == null) {
		return;
	}
	for (var i = 0; i < targets.length; i++) {
		console.log("Unselected Move: " + targets[i]);
		targets[i].className.baseVal = 'unselected';
	}
}

function selectRect(rect, wrapper, piece) {
	wrapper.className.baseVal = 'selected';
	
	if (GAME.selected != null) {
		var previous = $("rect[id='" + GAME.selected.id + "']", wrapper.ownerDocument.documentElement).get(0); 
		previous.className.baseVal = "unselected";
		unselectTargets(previous, GAME.targets);
	}
				
	selectTargets(wrapper, piece.movefn());
	GAME.selected = wrapper;
}			

var FILE_MAP = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, };
var FILE_ARRAY = ["A", "B", "C", "D", "E", "F", "G", "H"];

var WHITE = [
             { color: "WHITE", type: "ROOK", svgid: "g3218", rect: "rectA1", movefn: null , clickfn: null}, 
             { color: "WHITE", type: "KNIGHT", svgid: "g60673", rect: "rectB1", movefn: null, clickfn: null },
             { color: "WHITE", type: "BISHOP", svgid: "g3010", rect: "rectC1", movefn: null, clickfn: null },
             { color: "WHITE", type: "KING", svgid: "g82263", rect: "rectD1", movefn: null, clickfn: null },
             { color: "WHITE", type: "QUEEN", svgid: "g80246", rect: "rectE1", movefn: null, clickfn: null },
             { color: "WHITE", type: "BISHOP", svgid: "g3388", rect: "rectF1", movefn: null, clickfn: null },
             { color: "WHITE", type: "KNIGHT", svgid: "g60695", rect: "rectG1", movefn: null, clickfn: null },
             { color: "WHITE", type: "ROOK", svgid: "g3416", rect: "rectH1", movefn: null, clickfn: null },
             { color: "WHITE", type: "PAWN", svgid: "path3444", rect: "rectA2", movefn: pawnmove, clickfn: selectRect },
             { color: "WHITE", type: "PAWN", svgid: "path3442", rect: "rectB2", movefn: pawnmove, clickfn: selectRect },
             { color: "WHITE", type: "PAWN", svgid: "path3440", rect: "rectC2", movefn: pawnmove, clickfn: selectRect },
             { color: "WHITE", type: "PAWN", svgid: "path3438", rect: "rectD2", movefn: pawnmove, clickfn: selectRect },
             { color: "WHITE", type: "PAWN", svgid: "path3436", rect: "rectE2", movefn: pawnmove, clickfn: selectRect },
             { color: "WHITE", type: "PAWN", svgid: "path3434", rect: "rectF2", movefn: pawnmove, clickfn: selectRect },
             { color: "WHITE", type: "PAWN", svgid: "path3432", rect: "rectG2", movefn: pawnmove, clickfn: selectRect },
             { color: "WHITE", type: "PAWN", svgid: "path2575", rect: "rectH2", movefn: pawnmove, clickfn: selectRect },
];

var BLACK = [
             { color: "BLACK", type: "ROOK", svgid: "g46309", rect: "rectA8", movefn: null, clickfn: null }, 
             { color: "BLACK", type: "KNIGHT", svgid: "g60728", rect: "rectB8", movefn: null, clickfn: null },
             { color: "BLACK", type: "BISHOP", svgid: "g63721", rect: "rectC8", movefn: null, clickfn: null },
             { color: "BLACK", type: "KING", svgid: "g70004", rect: "rectD8", movefn: null, clickfn: null },
             { color: "BLACK", type: "QUEEN", svgid: "g67023", rect: "rectE8", movefn: null, clickfn: null },
             { color: "BLACK", type: "BISHOP", svgid: "g63818", rect: "rectF8", movefn: null, clickfn: null },
             { color: "BLACK", type: "KNIGHT", svgid: "g49858", rect: "rectG8", movefn: null, clickfn: null },
             { color: "BLACK", type: "ROOK", svgid: "g46345", rect: "rectH8", movefn: null, clickfn: null },
             { color: "BLACK", type: "PAWN", svgid: "path3194", rect: "rectA7", movefn: pawnmove, clickfn: selectRect },
             { color: "BLACK", type: "PAWN", svgid: "path17042", rect: "rectB7", movefn: pawnmove, clickfn: selectRect },
             { color: "BLACK", type: "PAWN", svgid: "path17044", rect: "rectC7", movefn: pawnmove, clickfn: selectRect },
             { color: "BLACK", type: "PAWN", svgid: "path17046", rect: "rectD7", movefn: pawnmove, clickfn: selectRect },
             { color: "BLACK", type: "PAWN", svgid: "path17048", rect: "rectE7", movefn: pawnmove, clickfn: selectRect },
             { color: "BLACK", type: "PAWN", svgid: "path17050", rect: "rectF7", movefn: pawnmove, clickfn: selectRect },
             { color: "BLACK", type: "PAWN", svgid: "path17052", rect: "rectG7", movefn: pawnmove, clickfn: selectRect },
             { color: "BLACK", type: "PAWN", svgid: "path17054", rect: "rectH7", movefn: pawnmove, clickfn: selectRect },
];

function noop()
{
}

var BOARD = [];
function generateBoard()
{
	var P = [];
	
	for (var i = 0; i < BLACK.length; i++) {
		P[BLACK[i].rect] = BLACK[i];
	}
	
	for (var i = 0; i < WHITE.length; i++) {
		P[WHITE[i].rect] = WHITE[i];
	}
	
	for (var file = 0; file <= 7; file++) {
		for (var rank = 1; rank <= 8; rank++) {
			var rect = "rect" + FILE_ARRAY[file] + rank;
			BOARD.push({
				rect: rect, 
				piece: P[rect],
				clickfn:P[rect] != null ? P[rect].clickfn : noop,
			});
		}
	}
}

function makemove(move, rect) {
	
				return function() {
					console.log(move);
					var rect =  rect;	
					var piece = move.piece;
					$.get( "/makemove/" + move.id, function( data ) {
						console.log(data);
					});
					
				};
}

function selectTargets(wrapper, moves) {
	GAME.targets = [];
	for (var i = 0; i < moves.length; i++) {
		var move = $("rect[id='" + moves[i].target + "']", wrapper.ownerDocument.documentElement).get(0); 
		
		var move_wrapper = createWrapper(move);
		move_wrapper.className.baseVal = "targeted";
		
		for (var key in BOARD) {
			
			if (BOARD[key].rect == moves[i].target) {
				BOARD[key].clickfn = makemove(moves[i], BOARD[key]);
			}	
		}	
		GAME.targets.push(move_wrapper);
	}
}

function swapFN(obj, d)
{
	
	return function(e) {
		console.log(obj, ", " + e.rect);
	};
	/*
		  var transformList = g.transform.baseVal;
		  
		  var t = transformList.consolidate();
		  
		  if (t == null) {
			 t = g.ownerSVGElement.createSVGTransform();
		  }
		  
		  var transform = transformList.createSVGTransformFromMatrix(g.getCTM()
				  .rotate(180, 600,600));
		  console.log(transformList.numberOfItems);
		  
		  if (transformList.numberOfItems == 0) {
			  transformList.appendItem(transform);
		  } else {
			  transformList.replaceItem(transform, 0);
		  }
	 */
}

var GAME = {
		turn: "WHITE",
		selected: null,
};
	
function rotate(docE)
{
	WHITE.forEach(swapFN(this, docE));
	BLACK.forEach(swapFN(this, docE));
}

function calculateCell(x, y, start) {
	var file = start.substr(4,1);
	var rank = start.substr(5,1);
	var pref = start.substr(0,4);
	
	console.log(start + ", " + file + ", " + rank);
	
	rank = parseInt(rank, 10) + parseInt(y, 10);
	file = FILE_ARRAY[FILE_MAP[file] + x];
	
	var ret = pref + file + rank;
	console.log(ret);
	
	return ret;
}

function createWrapper(rect) {
	
	var id = rect.id + "-wrapper";
	var wrapper = $("rect[id='" + id + "']", rect.ownerDocument.documentElement).get(0);
	
	if (wrapper != null) {
		return wrapper;
	} 
	
	$("svg", rect.ownerDocument.documentElement).append(
	function() {
		var ret = rect.cloneNode(true);
		ret.setAttribute("class", "unselected");
		ret.setAttribute("id", rect.id + "-wrapper");
		ret.removeAttribute("style");
		return ret;
	});
	
	return  $("rect[id='" + id + "']", rect.ownerDocument.documentElement).get(0);
}

function createWrapper2(rect) {
	//$("svg", wrapper.ownerDocument.documentElement).append(createWrapper(move));
	return function() {
		var ret = rect.cloneNode(true);
		ret.setAttribute("class", "unselected");
		ret.setAttribute("id", rect.id + "-wrapper");
		ret.removeAttribute("style");
		return ret;
	};
}

function clickDispatch(o, docE) {
	
	return function(e) {
		if (o.id == e.rect) {
			var piece;
			if (e.piece != null) {
				console.log("SVG: " + e.piece.svgid);
				if (e.piece.type == "PAWN") {
					piece = $("path[id='" + e.piece.svgid + "']", docE).get(0);
				} else {
					piece = $("g[id='" + e.piece.svgid + "']", docE).get(0);
				}
			}
				
			var rect = $("rect[id='" + e.rect + "']", docE).get(0); 
			
			console.log("The document: " + docE);
			
			var wrapper = $("rect[id='" + e.rect + "-wrapper']", docE).get(0); 
			
			if (wrapper == null) {
				wrapper = createWrapper(rect);
			} 
				
			console.log("BOARD square: " + e.piece);
			e.clickfn(rect, wrapper, e.piece);
		}	
	};
}

			/*
		  var transformList = g.transform.baseVal;
		  
		  var t = transformList.consolidate();
		  
		  if (t == null) {
			 t = g.ownerSVGElement.createSVGTransform();
		  }
		  
		  var transform = transformList.createSVGTransformFromMatrix(g.getCTM()
				  .translate((150 * x)/t.matrix.a,(-1 * 150 * y)/t.matrix.d));
		  console.log(transformList.numberOfItems);
		  
		  if (transformList.numberOfItems == 0) {
			  transformList.appendItem(transform);
		  } else {
			  transformList.replaceItem(transform, 0);
		  }
		  
		  e.rect = calculateCell(x, -1 * y, e.rect);
			 */

$(document).ready( function () {
	
		generateBoard();
	
		$.get( "resources/AAA_SVG_Chessboard_and_chess_pieces_06.svg", function( data ) {
			
			$( "div" ).html(data.documentElement);
			$("defs", data.documentElement).append(createStyle(data));
			$("svg", data.documentElement).get(0).currentScale = .50;
			console.log(data.documentElement);
			
			$("rect", data.documentElement).click(this, function(evt) {
				console.log(this.id + " Clicked! " + this + " " + evt.target);
				//WHITE.forEach(clickDispatch(this, data.documentElement));
				//BLACK.forEach(clickDispatch(this, data.documentElement));
				//BOARD.forEach(clickDispatch(this, data.documentElement));
				BOARD.forEach(clickDispatch(this, data.documentElement));
				
			
			});
			
		});
		
		$.get( "/getmoves", function( data ) {
			VALID_MOVES = data;
		});
			
		//rotate($("g[id='board']", data.documentElement).get(0));
	}
);