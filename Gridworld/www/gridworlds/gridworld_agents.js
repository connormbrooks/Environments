/*
A Canvas-based JavaScript GridWorld environment


Created by Connor Brooks


For questions or comments, email connor.brooks@colorado.edu

*/

/*
					Agent Class
*/
//note: parent class for all agents. Ideally, this would be an interface, but JavaScript.
function Agent(environment, startX, startY, observation_function, ID){
	this.environment = environment;
	this.state = [startX, startY];
	this.ID = ID;
	this.observation_function = observation_function;
	this.environment.addAgent(this);
}
Agent.prototype.init = function(){ return; }
Agent.prototype.getID = function(){ return this.ID; }
Agent.prototype.getState = function(){ return this.state; }
Agent.prototype.setAction = function(action){ this.environment.setAgentMove(this, action); }
Agent.prototype.transition = function(new_state, reward, observations){ this.state = new_state; }
Agent.prototype.chooseAction = function(observations){ }
/*
					End Agent Class
*/



/*
					KeyboardAgent Class
*/
function KeyboardAgent(environment, startX, startY, observation_function, ID, keyDict){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.setupKeyListeners(keyDict);
}
KeyboardAgent.prototype.setupKeyListeners = function(keyDict){
	var existing_func = window.onkeyup;
	var this_object = this;
	if(!document.hasFocus()){ window.focus(); }
	window.onkeyup = function(e){
		var key = e.keyCode ? e.keyCode : e.which;
		for(var keyDictKey in keyDict){
			if(key == parseInt(keyDictKey)){
				this_object.setAction(keyDict[keyDictKey]);
				break;
			}
		}
		if(existing_func){
			existing_func(e);	
		}
	}
}
/*
					End KeyboardAgent Class
*/

/*
					ButtonAgent Class
*/
function ButtonAgent(environment, startX, startY, observation_function, ID, buttonDict){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.buttonDict = buttonDict;
}
ButtonAgent.prototype = Object.create(Agent.prototype);
ButtonAgent.prototype.buttonReceiver = function(buttonID){
	for(var key in this.buttonDict){
		if(key == buttonID){
			this.setAction(this.buttonDict[buttonID]);
			break;
		}
	}
}
/*
					End ButtonAgent Class
*/

/*
					StationaryAgent Class
*/
function StationaryAgent(environment, startX, startY, observation_function, ID, action_dimension){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.dimension = action_dimension
}
StationaryAgent.prototype = Object.create(Agent.prototype);
StationaryAgent.prototype.init = function(){
	this.transition(this.state, 0, []);
}
StationaryAgent.prototype.transition = function(new_state, reward, observations){
	this.setAction("0".repeat(this.dimension).split("").map(parseFloat));
}
/*
					End StationaryAgent Class
*/


/*
					RandomAgent Class
*/

function RandomAgent(environment, startX, startY, observation_function, ID, action_set){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.action_set = action_set;
}
RandomAgent.prototype = Object.create(Agent.prototype);
RandomAgent.prototype.init = function(){
	this.transition(this.state, 0, []);
}
RandomAgent.prototype.transition = function(new_state, reward, observations){
	this.state = new_state;
	this.chooseAction(observations);
}
RandomAgent.prototype.chooseAction = function(observations){
	var valid_actions = [];
	//check which actions are valid
	for(var i = 0; i < this.action_set.length; i++){
		if (this.environment.simulateAgentMove(this, this.action_set[i]) != this.state){
			valid_actions.push(this.action_set[i]);
		}
	}
	var chosen_action = this.action_set[0]; //set an arbitrary action in case no actions are valid
	if(valid_actions.length != 0){
		//randomize among valid actions
		chosen_action = valid_actions[Math.floor(Math.random() * valid_actions.length)];
	}
	this.setAction(chosen_action);
}

/*
					End RandomAgent Class
*/


/*
					GoalBasedAgent Class
*/

function GoalBasedAgent(environment, startX, startY, observation_function, ID, action_set, goal_location){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.action_set = action_set;
	this.goal_location = goal_location;
}
GoalBasedAgent.prototype = Object.create(Agent.prototype);
GoalBasedAgent.prototype.init = function(){
	this.transition(this.state, 0, []);
}
GoalBasedAgent.prototype.transition = function(new_state, reward, observations){
	this.state = new_state;
	this.chooseAction(observations);
}
GoalBasedAgent.prototype.chooseAction = function(observations){
	var current_distance = Math.abs(this.state[0] - this.goal_location[0]) + Math.abs(this.state[1] - this.goal_location[1]);
	var optimal_actions = [];
	var optimal_score = 1;
	//first pass: find optimal score
	for(var i = 0; i < this.action_set.length; i++){
		var resulting_state = this.environment.simulateAgentMove(this, this.action_set[i]);
		var new_score = (Math.abs(resulting_state[0] - this.goal_location[0]) + Math.abs(resulting_state[1] - this.goal_location[1])) - current_distance;
		if(new_score < optimal_score){
			optimal_score = new_score;
		}
	}
	//second pass: check which actions are optimal for moving toward the goal
	for(var i = 0; i < this.action_set.length; i++){
		var resulting_state = this.environment.simulateAgentMove(this, this.action_set[i]);
		var new_score = (Math.abs(resulting_state[0] - this.goal_location[0]) + Math.abs(resulting_state[1] - this.goal_location[1])) - current_distance;
		if (new_score == optimal_score){
			optimal_actions.push(this.action_set[i]);
		}
	}
	var chosen_action = this.action_set[0]; //set an arbitrary action in case no actions are valid
	if(optimal_actions.length != 0){
		//randomize among valid actions
		chosen_action = optimal_actions[Math.floor(Math.random() * optimal_actions.length)];
	}
	this.setAction(chosen_action);
}

/*
					End GoalbasedAgent Class
*/

/*
					ChasingAgent Class
*/

function ChasingAgent(environment, startX, startY, observation_function, ID, action_set, human_location){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.action_set = action_set;
	this.goal_location = human_location;
}
ChasingAgent.prototype = Object.create(Agent.prototype);
ChasingAgent.prototype.init = function(){
	this.transition(this.state, 0, [this.goal_location]);
}
ChasingAgent.prototype.transition = function(new_state, reward, observations){
	this.state = new_state;
	this.goal_location = observations[0] //only observation for this type of agent should be the location of the human
	this.chooseAction(observations);
}
ChasingAgent.prototype.chooseAction = function(observations){
	this.goal_location = observations[0]
	var current_distance = Math.abs(this.state[0] - this.goal_location[0]) + Math.abs(this.state[1] - this.goal_location[1]);
	var optimal_actions = [];
	var optimal_score = 1;
	//first pass: find optimal score
	for(var i = 0; i < this.action_set.length; i++){
		var resulting_state = this.environment.simulateAgentMove(this, this.action_set[i]);
		var new_score = (Math.abs(resulting_state[0] - this.goal_location[0]) + Math.abs(resulting_state[1] - this.goal_location[1])) - current_distance;
		if(new_score < optimal_score){
			optimal_score = new_score;
		}
	}
	//second pass: check which actions are optimal for moving toward the goal
	for(var i = 0; i < this.action_set.length; i++){
		var resulting_state = this.environment.simulateAgentMove(this, this.action_set[i]);
		var new_score = (Math.abs(resulting_state[0] - this.goal_location[0]) + Math.abs(resulting_state[1] - this.goal_location[1])) - current_distance;
		if (new_score == optimal_score){
			optimal_actions.push(this.action_set[i]);
		}
	}
	var chosen_action = this.action_set[0]; //set an arbitrary action in case no actions are valid
	if(optimal_actions.length != 0){
		//randomize among valid actions
		chosen_action = optimal_actions[Math.floor(Math.random() * optimal_actions.length)];
	}
	this.setAction(chosen_action);
}

/*
					End ChasingAgent Class
*/


/*
					BlockingAgent Class
*/
function BlockingAgent(environment, startX, startY, observation_function, ID, action_set, human_agent_ID, human_goal){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.action_set = action_set;
	this.human_agent_ID = human_agent_ID;
	this.human_goal = human_goal;
}
BlockingAgent.prototype = Object.create(Agent.prototype);
BlockingAgent.prototype.init = function(){
	this.transition(this.state, 0, [this.environment.getAgentState(this.human_agent_ID)]);
}
BlockingAgent.prototype.transition = function(new_state, reward, observations){
	this.state = new_state;
	this.chooseAction(observations);
}
BlockingAgent.prototype.chooseAction = function(observations){
	var min_distance = Number.MAX_VALUE;
	var best_action = -1;
	console.log(observations);
	for(var i = 0; i < this.action_set.length; i++){
		action_distance = this.distanceFunction(this.environment.simulateAgentMove(this, this.action_set[i]), observations[0]);
		if(action_distance < min_distance){
			min_distance = action_distance;
			best_action = i;
		}
	}
	console.log(best_action);
	this.setAction(this.action_set[best_action]);
}
BlockingAgent.prototype.distanceFunction = function(new_state, human_state){
	//code here modified from: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
	var A = new_state[0] - human_state[0];
	var B = new_state[1] - human_state[1];
	var C = this.human_goal[0] - human_state[0];
	var D = this.human_goal[1] - human_state[1];

	var dot = A * C + B * D;
	var len_sq = C * C + D * D;
	var param = -1;
	if (len_sq != 0) //in case of 0 length line
	  param = dot / len_sq;

	var xx, yy;

	if (param < 0) {
		xx = human_state[0];
		yy = human_state[1];
	}
	else if (param > 1) {
		xx = this.human_goal[0];
		yy = this.human_goal[1];
	}
	else {
		xx = human_state[0] + param * C;
		yy = human_state[1] + param * D;
	}

	var dx = new_state[0] - xx;
	var dy = new_state[1] - yy;
	return Math.sqrt(dx * dx + dy * dy);
}
/*
					End BlockingAgent Class
*/



/*
					AntiBlockingAgent Class
*/
function AntiBlockingAgent(environment, startX, startY, observation_function, ID, action_set, human_agent_ID, human_goal){
	BlockingAgent.call(this, environment, startX, startY, observation_function, ID, action_set, human_agent_ID, human_goal);
}
AntiBlockingAgent.prototype = Object.create(BlockingAgent.prototype);
AntiBlockingAgent.prototype.transition = function(new_state, reward, observations){
	this.state = new_state;
	this.chooseAction(observations);
}
AntiBlockingAgent.prototype.chooseAction = function(observations){
	var max_distance = Number.MIN_VALUE;
	var best_action = -1;
	for(var i = 0; i < this.action_set.length; i++){
		action_distance = this.distanceFunction(this.environment.simulateAgentMove(this, this.action_set[i]), observations[0]);
		if(action_distance > max_distance){
			max_distance = action_distance;
			best_action = i;
		}
	}
	this.setAction(this.action_set[best_action]);
}
/*
					End AntiBlockingAgent Class
*/

/*
					PlaybackAgent Class
*/

function PlaybackAgent(environment, startX, startY, observation_function, ID, move_dict){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.move_index = 0;
	this.move_dict = move_dict;
}
PlaybackAgent.prototype = Object.create(Agent.prototype);
PlaybackAgent.prototype.init = function(){
	this.transition(this.state, 0, []);
}
PlaybackAgent.prototype.transition = function(new_state, reward, observations){
	this.state = new_state;
	this.move_index += 1;
	this.chooseAction(observations);
}
PlaybackAgent.prototype.chooseAction = function(observations){
	if(this.move_dict >= this.move_dict.length){
		//do nothing
		return;
	}
	var next_state = this.move_dict[this.move_index][this.ID];
	var x_action = next_state[0] - this.state[0];
	var y_action = next_state[1] - this.state[1];
	this.setAction([x_action, y_action]);
}

/*
					End PlaybackAgent Class
*/



/*

					PYTHON AGENTS

					Agent classes below use a python script running on the server to determine move selection

					NOTE: this basic framework is complete, but the other side (setting up server to run python scripts) has not been completed

*/


/*
					PythonAgent Class
*/
function PythonAgent(environment, startX, startY, observation_function, ID, action_set, request_url){
	Agent.call(this, environment, startX, startY, observation_function, ID);
	this.request_url = request_url;
	this.agent_state = "NONE"
}
PythonAgent.prototype = Object.create(Agent.prototype);
PythonAgent.prototype.init = function(){ this.transition(this.state, 0, this.observation_function(this.environment)); }
PythonAgent.prototype.transition = function(new_state, reward, observations){ 
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function(){
		if(xmlhttp.readyState == XMLHttpRequest.DONE){
			if(xmlhttp.status == 200){
				//Successful return
				console.log(xmlhttp.responseText);
				control_signal = xmlhttp.responseText["Action"];
				this.agent_state = xmlhttp.responseText["Agent_State"];
				this.setAction(control_signal);
			}
			else{
				//failure, try again(?)
				;
			}
		}
	}
	data = {"State" : new_state, "Reward" : reward, "Observations" : observations, "Agent_State" : this.agent_state};
	xmlhttp.open("GET", this.request_url+JSON.stringify(data), true);
	xmlhttp.send();

}

/*

					END PYTHON AGENTS CLASSES

*/



/*
					AgentGUI Class
*/
function AgentGUI(gridworld, agent, style, color){
	this.gridworld = gridworld;
	this.agent = agent;
	this.style = style;
	this.color = color;
}
AgentGUI.prototype.draw = function(context){
	state = this.agent.getState();
	pos = this.gridworld.getCenterPosition(state[0], state[1]);
	scale = [this.gridworld.col_width, this.gridworld.row_height];
	switch(this.style){
		case "basic":
			this.drawBasic(context, pos, scale);
			break;
		case "cross":
			this.drawCross(context, pos, scale);
			break;
		default:
			this.drawBasic(context, pos, scale);
			break;
	}
}
AgentGUI.prototype.drawBasic = function(context, pos, scale){
	context.strokeStyle = this.color;
	context.fillStyle = this.color;
	context.beginPath();
	context.arc(pos[0], pos[1], Math.min(scale[0], scale[1])*0.45, 0, 2.0*Math.PI);
	context.stroke();
}
AgentGUI.prototype.drawCross = function(context, pos, scale){
	this.drawBasic(context, pos, scale);
	var radius = Math.min(scale[0], scale[1])*0.45;
	context.moveTo(pos[0], pos[1] - radius);
	context.lineTo(pos[0], pos[1] + radius);
	context.moveTo(pos[0]-radius, pos[1]);
	context.lineTo(pos[0]+radius, pos[1]);
	context.stroke();
}
/*
					End AgentGUI Class
*/