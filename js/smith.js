'use strict';

var smith = {
  version: "0.1"
}


var point_var = null;

function chartDrawn() {
  d3.select('#add-point')
            .on('click', ()=>{
              r = d3.select('#real').property('value')
              i = d3.select('#imaginary').property('value')
              color = d3.select('#color').property('value')
              chart.addPoint(r,i,color);
            });

  document.getElementById('file').addEventListener('change', handleFileSelect, false);
  function handleFileSelect(evt) {
      var file = evt.target.files[0]; // FileList object
      var reader = new FileReader();
      reader.onload = function(theFile) {
        var text = theFile.currentTarget.result;
        var points = d3.csv.parse(text);
        points.forEach(function(point) {
          var real = parseFloat(point.real);
          var imaginary = parseFloat(point.imaginary);
          var color = '' + point.color;
          chart.addPoint(real, imaginary, color);
        });
      }
      reader.readAsText(file);
  }
}



smith.chart = function(){  
  // smith chart options
  this.radius = 1
  this.type = 'z'// 'z' or 'y' 
  this.strokeWidth = 2
  // svg options
  var pad = 40;
  var width = 1000;
  var height = width;
  var ZERO = 1e-5;
  
  this.r = [ 0 ]
  for (var i = 1 ; i < 6; i++) {
    this.r.push(i);
    this.r.push(1/i);
  }

  this.x = [ 1,-1,0.2, 0.5,  2.0 , 5.0, -0.2, -0.5,  -2.0, -5.0 ];

  var flipme = 1;
  var xyScale = d3.scale.linear()
          .domain([-this.radius, this.radius])
          .range([pad, width-pad]);

  var rScale = d3.scale.linear()
          .domain([0, this.radius])
          .range([0, (width-2*pad)/2]); 

  var Rcx = function(r){
      return xyScale(r/(1+r)*flipme)
      };

  var re_circle_text_x = function(r) {
    return xyScale(2*r/(r+1) - 1);
  };

  var re_circle_text_y = function(r) {
    return xyScale(0);
  };

  var Rcy = function(r){
      return xyScale(0)
      };
  var Rr = function(r){
      return rScale(1/(1+r))
      };
  var Xcx = function(x){
      return xyScale(1*flipme)
      };
  var Xcy = function(x){
      if (x==0){x =ZERO};
      return xyScale(1/x)
      };
  var im_circle_text_x = function(x){
      var center = xyScale(0);
      var outerRadius = rScale(1);
      var XcRadius = Xr(x);
      var angle = Math.atan(XcRadius/outerRadius);
      return xyScale(Math.cos(2*angle));
      };
  var im_circle_text_y = function(x){
      var center = xyScale(0);
      var outerRadius = rScale(1);
      var XcRadius = Xr(x);
      var angle = Math.atan(XcRadius/outerRadius);
      return xyScale(Math.sin(-2*angle*Math.sign(x)));
      };

  var Xr = function(x){
      if (x==0){x =ZERO};
        return rScale(Math.abs(1/x))
      };

  var point_x = function(real,im){
    var R = rScale(1);
    var r = Rr(real);
    var i = Xr(im);
    var angle = Math.atan(r/i);
    var normalized = 1 - r/R*(1+Math.cos(angle*2));
    return xyScale(normalized);
  } 

  var point_y = function(real,im){
    var R = rScale(1);
    var r = Rr(real);
    var i = Xr(im);
    var angle = Math.atan(r/i);
    var normalized = -Math.sign(im)*r/R*Math.sin(angle*2);
    return xyScale(normalized);
  } 

  var real_circle_radius = function(x,y){
    var R = rScale(1);
    var A = (R-x)*(R-x);
    var B = y*y;
    var C = 2*(R-x);
    var r = (A + B)/C;
    return r;
  }

  var point_real = function(x,y){
    var R = rScale(1);
    var r = real_circle_radius(x,y);
    return (R - r)/r;
  }

  var point_imaginary = function(x,y){
    var r = real_circle_radius(x,y);
    var R = rScale(1);
    var angle = Math.asin(y/r) / 2;
    var imaginary_radius = (r / Math.tan(angle));
    var normalized = imaginary_radius/R
    return 1/normalized;
  }
  smith.chart.prototype.round = function round(x, n) {
    var i = 1;
    while (--n > 0) {
      i*=10;
    }
    return Math.round(x*i)/i;
  }
                  
  smith.chart.prototype.addPoint = function(r, i, color) {
    r = parseFloat(r);
    i = parseFloat(i);
    var chart = this;
    var point = chart.svg.append('g')
                .attr('class', 'point')
                .call(d3.behavior.drag().on("drag", function(d){
                  x = d3.event.x;
                  y = d3.event.y;
                  var real = chart.round(point_real(x,y), 4);
                  var imag = chart.round(point_imaginary(x,y), 4);
                  //d3.select(this).select('text')
                  //      .attr('x', x)
                  //      .attr('y', y)
                  //      .text(real + ', ' + imag);
                  d3.select(this).select('circle')
                        .attr('cx', x)
                        .attr('cy', y);
                }))
                .on('dblclick', function(){
                  d3.event.stopPropagation();
                  this.remove();
                });

    //point.append('text')
    //            .attr('x',point_x(r,i))
    //            .attr('y',point_y(r,i))
    //            .text(this.round(r, 4) + ', ' + this.round(i, 4));

    point.append('circle')
                .attr('fill', color)
                .attr('stroke', 'none')
                .attr('cx', point_x(r,i))
                .attr('cy', point_y(r,i))
                .attr('r', 5);
      
    };
  // draw the smith chart on the given svg
  smith.chart.prototype.draw = function(svg){  
    this.svg = svg; 
    if (this.type == 'y'){flipme = -1};
    chart = this; 
    svg.attr('width',width)
      .attr('height',height)
      .attr('fill', 'rgba(0,0,0,0)')
      .attr('stroke','black')
      .attr('stroke-width',this.strokeWidth)
      .on('dblclick', function() {
        var x = d3.event.x;
        var y = d3.event.y;
        x = x - xyScale(0) - 7;
        y = -(y - xyScale(0)) + 28;
        var real = point_real(x,y);
        var imaginary = point_imaginary(x,y);
        chart.addPoint(real, imaginary);
      })


        
        
    svg.append('clipPath')
      .attr('id','chart-area')
      .append('circle')
      .attr('cx',Rcx(0))
      .attr('cy',Rcy(0))
      .attr('r',rScale(this.radius)+this.strokeWidth/2);

    var realAxis = svg.append('line')
                        .attr('stroke','grey')
                        .attr('x1', xyScale(-1))
                        .attr('y1', xyScale(0))
                        .attr('x2', xyScale(1))
                        .attr('y2', xyScale(0));
    
    var rCirclesContainer = svg.selectAll('circle.r')
                       .data(this.r)
                       .enter()
                       .append('g');
        rCirclesContainer.append('circle')
                       .attr('class','r')
                       .attr('stroke','grey')
                       .attr('cx',Rcx)
                       .attr('cy',Rcy)
                       .attr('r',Rr);
        rCirclesContainer.append('text')
                       .attr('x',re_circle_text_x)
                       .attr('y',re_circle_text_y)
                       .text((x)=>Math.round(100*x)/100)
    
    var xCirclesContainer = svg.selectAll('circle.x')
                       .data(this.x)
                       .enter()
                       .append('g');
        xCirclesContainer.append('circle')
                       .attr('class','x')
                       .attr('stroke','grey')
                       .attr('cx',Xcx)
                       .attr('cy',Xcy)
                       .attr('r',Xr);
        xCirclesContainer.append('text')
                       .attr('x', im_circle_text_x)
                       .attr('y', im_circle_text_y)
                       .text((x)=>x)
    svg.selectAll(['.x','.r'])
				.attr("clip-path", "url(#chart-area)")
        
  }
      
  smith.chart.prototype.zoom = function(radius){
    xyScale = d3.scale.linear()
        .domain([-radius, radius])
        .range([pad, width-pad]);
    rScale = d3.scale.linear()
        .domain([0, radius])
        .range([0, (width-2*pad)/2]); 
    Rcx = function(r){
        return xyScale(r/(1+r)*flipme)
        };
    Rcy = function(r){
        return xyScale(0)
        };
    Rr = function(r){
        return rScale(1/(1+r))
        };
    Xcx = function(x){
        return xyScale(1*flipme)
        };
    Xcy = function(x){
        if (x==0){x =ZERO};
        return xyScale(1/x)
        };
    Xr = function(x){
        if (x==0){x =ZERO};
        return rScale(Math.abs(1/x))
        };
    svg.selectAll('.r')
         .transition()
         .attr('cx',Rcx)
         .attr('cy',Rcy)
         .attr('r',Rr);
    svg.selectAll('.x')
         .transition()
         .attr('cx',Xcx)
         .attr('cy',Xcy)
         .attr('r',Xr);

  }
}

