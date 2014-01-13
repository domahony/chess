
//var blah = require('stream');
//var util = require('util');

var spawn = require('child_process').spawn;
var exec = require('child_process').execFile;
var fs = require('fs');

var DISPATCH = {};

function createReadPipe() {
	return "/tmp/gin"
}

function createWritePipe() {
	return "/tmp/gout";
}

function createReadFn(key) {
	DISPATCH[key] = {lastmove: []};
	console.log("Creating ReadFN for " + key);
	return function(buf) {
		console.log("Calling ReadFN Dispatch");
		if (DISPATCH[key] != null && DISPATCH[key].read != null) {
			DISPATCH[key].read(buf);
		} else {
			console.log("Ignoring: " + buf.toString());
		}
	};
}

function storeLastMove(key, buf, child0) {
	if (DISPATCH[key].lastmove == null) {
		DISPATCH[key].lastmove = [];
	}

	console.log("Storing Last Move: " + buf.toString());

	var found = buf.toString().match(/My move is : (\S+)/);

	if (found != null) {
		console.log("Storing: " + found[1]);
		DISPATCH[key].lastmove.push(found[1]);
	}

	populate_move_cache(child0, key, function() {
		DISPATCH[key].lastmovestatus = "Complete";
		DISPATCH[key].lastmove = found[1]; 
	});
}

function initialize(sess) {
	
	var childpath0 = createReadPipe();
	var childpath1 = createWritePipe();
	
	var child1 = fs.openSync(childpath1, "w+");
	console.log(child1);
	var child0 = fs.openSync(childpath0, "rs+");
	console.log(child0);
	
    var gnuchess = spawn("/usr/games/gnuchess", ["-x", "-q"], {detached: true, stdio: [child0, child1]});
    
	var read = fs.createReadStream(null, {fd: child1});
    
	read.on("error", function(buf) {
		console.log("READ ERROR: " + buf.toString());
	});
	
	sess.key = childpath1;
    
	read.on("data", createReadFn(sess.key));
    
    fs.close(child0, function(err) {
    	console.log("Closing fd:" + child0);
    });
    
    return {
    	"child0": childpath0,
    	"child1": childpath1,
    };
}

exports.show = function(req, res){
	req.session.value = initialize(req.session);
	populate_move_cache(req.session.value.child0, req.session.key, function() {
		res.render('board', { title: 'Chess' });
	});
};

exports.moves = function(req, res) {
	res.send(DISPATCH[req.session.key].moves);
};

exports.getmovestatus = function(req, res) {
	res.send({
		status: DISPATCH[req.session.key].lastmovestatus,
		moves: DISPATCH[req.session.key].moves,
		lastmove: DISPATCH[req.session.key].lastmove,
	});
};
	
function populate_move_cache(child0, key, callback) {
	var writefd = fs.openSync(child0, "a");
	var write = fs.createWriteStream(null, {fd: writefd});
	
	var bufferList = [];
	DISPATCH[key].read = function(buf) {
				console.log(this.name);
    			console.log("calling blah: ->" + buf.toString() + "<-");
    			bufferList.push(buf);
    			if (buf.toString().indexOf("No") >= 0) {
    				getMoves(bufferList, key);
    				callback();
    			}
	};
	
	write.on("error", function (buf) {
		console.log("WRITE ERROR: " + buf.toString());
	});
	
    var buffer = new Buffer("show moves\n");
    write.write(buffer);
    
    fs.close(writefd, function(err) {
    	console.log("Closing fd:" + writefd);
    });
    
}

function
getMoves(bufferList, key) {
	
		var moves = [];
		var b = Buffer.concat(bufferList);
		var lines = b.toString().split("\n");
	
		//skip the first 2 lines
		for (var i = 0; i < lines.length; i++) {
			
			//console.log(lines[i].length);
			if (lines[i].length == 0) {
				continue;
			}
			
			if (lines[i].indexOf("TimeLimit") >= 0) {
				console.log("Skipping: " + lines[i].toString());
				continue;
			}
			
			if (lines[i].indexOf("Chess") >= 0) {
				console.log("Skipping: " + lines[i].toString());
				continue;
			}
		
			if (lines[i].indexOf("No.") >= 0 ) {
				console.log("Skipping: " + lines[i].toString());
				continue;
			}
			
			var chunks = lines[i].trim().split("\t");
		
			for (var j = 0; j < chunks.length; j++) {
			
				var zz = chunks[j].trim().split(/\s+/);
				moves.push({move: zz[0], score: zz[1]});
			}
		}
	
		console.log(moves);
		DISPATCH[key].moves = moves;
}

exports.readmove = function(req, res)
{
	var idx = req.route.params.idx;
	console.log("Reading move: " + idx);
	
	if (DISPATCH[req.session.key].lastmove.length >= idx) {
		
		res.send(
			{
				status: "COMPLETE",
				move: DISPATCH[req.session.key].lastmove[idx-1],
			}
		);
		
	} else {
		res.send({status: "PENDING"});
	}
}

exports.makemove = function(req, res) {
	
	var writefd = fs.openSync(req.session.value.child0, "a");
	var write = fs.createWriteStream(null, {fd: writefd});
	
	//return a response of pending 
	//execute the move
	//get the list of value moves
	//store the response and the valid moves in the session 
	
	console.log(req.route.params.move);
	
	var bufferList = [];
	DISPATCH[req.session.key].read = function(buf) {
				console.log(this.name);
    			console.log("calling blah: ->" + buf.toString() + "<-");
    			bufferList.push(buf);
    			if (buf.toString().indexOf(req.route.params.move) >= 0) {
    				DISPATCH[req.session.key].lastmovestatus = "Pending";
    				DISPATCH[req.session.key].moves = [];
    				DISPATCH[req.session.key].read = function(buf) {
    					storeLastMove(req.session.key, buf, req.session.value.child0);
    				};
    			}
	};
	
	write.on("error", function (buf) {
		console.log("WRITE ERROR: " + buf.toString());
	});
	
    var buffer = new Buffer(req.route.params.move + "\n");
    write.write(buffer);
    
    fs.close(writefd, function(err) {
    	console.log("Closing fd:" + writefd);
    });
    
   res.send({status: "Pending"});
    
};
