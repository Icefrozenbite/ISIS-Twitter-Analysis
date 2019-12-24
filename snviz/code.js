var tip;
var width = window.innerWidth,
    height = window.innerHeight;
	


var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
	


	var simulation = d3.forceSimulation()
	// .force('link').links(lnks)
	.force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
    .force("link", 
		d3.forceLink()
		.id(function(d) { return d.id; })
		// .distance(function(d) { 
			// // var dv  = Math.round(d.value * 100) / 100;
			// // var dis = (dv*100)-40;
			// // console.log(dv, dis);
			// // //return  dis; 
			// // return  7*dis; 
			// return 10;
		// })
		.strength(.2)
	)
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

	window.addEventListener("resize", function() { 
	console.log("resize!");
	svg.attr("width", window.innerWidth).attr("height", window.innerHeight); 
	
	simulation.force("center")
    .x(window.innerWidth / 2)
    .y(window.innerHeight / 2);

simulation.alpha(1).restart();
});




d3.json("data.json").then(function (data) {
	//if (error) throw error;
	
	
	d3.csv("result.csv").then(function(indata){
	var inodes = [];
	var unames = [];
	var tweets = [];
		
	indata.forEach(function(a) {
		var b = a.time.split(' ');
		var tm = b[0].split('/');
		var mm = b[1].split(':');
		// console.log(tm[2], tm[0]-1, tm[1], mm[0], mm[1]);
		var mdate = Date.UTC(tm[2], tm[0]-1, tm[1], mm[0], mm[1])/1000;

		tweets.push({"time": mdate, "user": a.username, "cls": parseInt(a.topic)})
		
		if (!unames.includes(a.username)) {
			unames.push(a.username);			
			inodes.push({"id": a.username, "name": a.username, "cls": 1, "flw": parseInt(a.followers)});			
		}
		// 
		}); 
		
	tweets = tweets.sort(function(x, y){
		return x.time - y.time;
	});
		// console.log(unames);
	// inodes = [  {"id": "Myriel", "group": 1},
    // {"id": "Napoleon", "group": 1},
    // {"id": "Mlle.Baptistine", "group": 1},
    // {"id": "Mme.Magloire", "group": 1},
    // {"id": "CountessdeLo", "group": 1}];
	// console.log("load");
	tip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.id; });
	svg.call(tip);
	var nds  = [];
	var lnks  = [];

//var color = d3.scaleOrdinal(d3.schemeCategory20);
//var color = d3.scaleOrdinal(d3.schemeCategory10);


var colors = d3.scaleOrdinal(d3.schemeCategory10)
	.domain([0,1,2,3,4,5,6,7,8,9]);
	
	// console.log(colors(1));
	

 var link = svg.append("g")
      .attr("class", "link")
    .selectAll("line")
    .data(lnks)
    .enter().append("line")
      // .attr("stroke-width", function(d) { return Math.sqrt(d.value); });
      .attr("stroke-width", function(d) { return 5; });


	  
  var nodes = svg.append("g")
    .attr("class", "node")	  
    .selectAll("g")
    .data(inodes)
    .enter().append("g")
	.call(d3.drag()
	.on("start", dragstarted)
	.on("drag", dragged)
	.on("end", dragended))
	;
    
  var circles = nodes.append("circle")
      .attr("r", function(d) { 
		// d.followers/100
		
		if (d.flw > 1000) {
			return 50;
		}
		if (d.flw > 500) {
			return 40;
		}
		if (d.flw > 200) {
			return 30;
		}
		if (d.flw > 100) {
			return 20;
		}
		return 10; 
	 })
      //.attr("fill", function(d) { return color(d.group); })
	  .on('mouseover', tip.show)
		.on('mouseout', tip.hide)
	  .attr("class", function(d) { return "cl"+d.id; })
	  .attr("fill", "white")
	  	.on("click",function(d){
			
			tweets.forEach(function(el) {
				// console.log(el);
				console.log("!");
				
			});
		  
		})
		;

  var t = d3.interval(function(elapsed) {
    
	d3.select("circle.active")
		.attr("fill", "gray")
		.classed("active", false);
	var tw = tweets.shift();
	if (!tw) {
		t.stop();
	}
	console.log(new Date(tw.time*1000), tw.cls, colors(tw.cls));
	d3.select(".cl"+tw.user)
		.attr("fill", colors(tw.cls))
		.classed("active", true);
	// console.log(tw.user);
    // if (i ==2000) t.stop();
	
  }, 100);

  var labels = nodes.append("text")
      .text(function(d) {
        return d.username;
      })
      .attr('x', 15)
      .attr('y', 6);

  // node.append("title").text(function(d) { return d.name; });

  	  
	  

  
  simulation
      .nodes(inodes)
      .on("tick", ticked);
	  //.alphaDecay(0);

  simulation.force("link")
      .links(lnks);

  function ticked() {
  
	//node[0].x = width / 2;
    //node[0].y = height / 2;
	
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    nodes
        .attr("transform", function(d) {
			//console.log(d.flag);
          return "translate(" + d.x + "," + d.y + ")";
        })
  }
  
    // console.log(indata.username);
});

});
function dragstarted(d) { 		
console.log("drag!");
tip.hide();
  if (!d3.event.active) simulation.alphaTarget(1).restart();
  d.fx = d.x;
  d.fy = d.y;
  
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

