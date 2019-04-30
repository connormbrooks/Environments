/* 
					Container Class
*/
//class for creating the game box and establishing contact with DOM elements
function Container(width, height){
	let dpi = window.devicePixelRatio;
	this.canvas = document.getElementById("canvas");
	this.context = canvas.getContext("2d");
	this.fix_dpi(dpi, height, width);
	this.update_list = [];
	this.draw_list = [];
}
Container.prototype.fix_dpi = function(dpi, height, width){
	this.canvas.setAttribute('height', height*dpi);
	this.canvas.setAttribute('width', width*dpi);
}
Container.prototype.getContext = function(){ return this.context; }
Container.prototype.clear = function(){ this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); }
Container.prototype.update = function(){
	this.update_list.forEach(function(c){ c.update(); }.bind(this));
}
Container.prototype.draw = function(){
	this.clear();
	this.draw_list.forEach(function(c){
		this.context.save();
		c.draw(this.context);
		this.context.restore();
	}.bind(this));
}
Container.prototype.add_update_object = function(o){ this.update_list.push(o); }
Container.prototype.add_draw_object = function(o){ this.draw_list.push(o); }
Container.prototype.get_width = function(){ return this.canvas.width; }
Container.prototype.get_height = function(){ return this.canvas.height; }
/*
					End Container Class
*/