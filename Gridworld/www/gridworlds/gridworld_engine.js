/*
A Canvas-based JavaScript GridWorld environment


Created by Connor Brooks


For questions or comments, email connor.brooks@colorado.edu

*/

/*
					GridWorld Class
*/
//class for maintaining the gridworld itself
//note: the gridworld does NOT maintain states of or draw agents within the gridworld. It will, however, respond if movements/positions are allowed.
//note: cells are 0-indexed and ordered left-right, bottom-top for numbering
function GridWorld(container, rows, cols, wall_map, goal_map=[]){
	this.container = container;
	this.set_row_height(this.container.get_height(), rows);
	this.num_rows = rows;
	this.set_col_width(this.container.get_width(), cols);
	this.num_cols = cols;
	this.wall_map = wall_map;
	this.goal_map = goal_map;
	this.container.add_draw_object(this);
}
GridWorld.prototype.set_row_height = function(px_height, num_rows){ this.row_height = px_height / num_rows; }
GridWorld.prototype.set_col_width = function(px_width, num_cols){ this.col_width = px_width / num_cols; }
GridWorld.prototype.draw = function(context){
	this.drawOutline(context);
	this.drawCells(context);
	this.drawWalls(context);
	this.drawGoals(context);
}
GridWorld.prototype.drawOutline = function(context){
	context.fillStyle = "DarkGray";
	context.strokeStyle = "DarkGray";
	context.lineWidth = 10;
	context.beginPath();
	context.moveTo(0,0);
	context.lineTo(this.col_width*this.num_cols, 0);
	context.lineTo(this.col_width*this.num_cols, this.row_height*this.num_rows);
	context.lineTo(0, this.row_height*this.num_rows);
	context.lineTo(0,0);
	context.stroke();
}
GridWorld.prototype.drawCells = function(context){
	context.fillStyle = "DarkGray";
	context.strokeStyle = "DarkGray";
	context.lineWidth = 2;
	this.drawVerticalBorders(context);
	this.drawHorizontalBorders(context);
}
GridWorld.prototype.drawVerticalBorders = function(context){
	for(var i = 1; i < this.num_cols; i++){
		context.beginPath();
		context.moveTo(i*this.col_width, 0);
		context.lineTo(i*this.col_width, this.row_height*this.num_rows);
		context.stroke();
	}
}
GridWorld.prototype.drawHorizontalBorders = function(context){
	for(var i = 1; i < this.num_rows; i++){
		context.beginPath();
		context.moveTo(0, i*this.row_height);
		context.lineTo(this.col_width*this.num_cols, i*this.row_height);
		context.stroke();
	}
}
GridWorld.prototype.drawWalls = function(context){
	context.fillStyle = "LightSlateGray";
	context.strokeStyle = "DarkGray";
	this.wall_map.forEach(function(c){
		corner_pos = this.getCornerPosition(c[0], c[1]);
		context.fillRect(corner_pos[0], corner_pos[1], this.col_width, this.row_height);
	}.bind(this));
}
GridWorld.prototype.drawGoals = function(context){
	context.fillStyle = "Green";
	context.strokeStyle = "Green";
	this.goal_map.forEach(function(c){
		corner_pos = this.getCornerPosition(c[0], c[1]);
		context.fillRect(corner_pos[0], corner_pos[1], this.col_width, this.row_height);
	}.bind(this));
}
GridWorld.prototype.getCornerPosition = function(cellX, cellY){
	//top-left corner position
	x_pos = cellX*this.col_width;
	y_pos = (this.num_rows - (cellY+1))*this.row_height;
	return [x_pos, y_pos];
}
GridWorld.prototype.getCenterPosition = function(cellX, cellY){
	x_pos = cellX*this.col_width + this.col_width / 2.0;
	y_pos = (this.num_rows - (cellY+1))*this.row_height + this.row_height / 2.0;
	return [x_pos, y_pos];
}
GridWorld.prototype.isCellAllowed = function(cellX, cellY){
	if(cellX < 0 || cellX > this.num_cols-1 || cellY < 0 || cellY > this.num_rows-1){
		return false;
	} else if (this.checkWall([cellX, cellY])){
		return false;
	} else{
		return true;
	}
}
GridWorld.prototype.checkWall = function(cell){
	for(var i = 0; i < this.wall_map.length; i++){
		var wall = this.wall_map[i];
		if(wall[0] == cell[0] && wall[1] == cell[1]){ return true; }
	}
	return false;
}
/*
					End GridWorld Class
*/



/*
					GridWorldEnvironmentSimultaneous Class
*/
//Environment model that handles a 2D gridworld that waits for all agents to select an action before updating
//note: all turns are executed simultaneously (agents can currently go 'through' each other)
function GridWorldEnvironmentSimultaneous(gridworld, agent_dict, reward_function, end_game_triggers){
	this.gridworld = gridworld;
	this.agent_dict = agent_dict;
	this.reward_function = reward_function;
	this.move_lock = true;
	this.game_log = {};
	this.game_active = true;
	this.end_game_triggers = end_game_triggers;
	this.game_result = "";
	this.setup_agents_moves_dict();
}
GridWorldEnvironmentSimultaneous.prototype.addAgent = function(agent){ this.agent_dict[agent.getID()] = agent; this.agents_moves_dict[agent.getID()] = "NULL"; }
GridWorldEnvironmentSimultaneous.prototype.setup_agents_moves_dict = function(){
	this.agents_moves_dict = {};
	for(var agentID in this.agent_dict){
		this.agent_moves_dict[agentID] = "NULL";
	}
}
GridWorldEnvironmentSimultaneous.prototype.init = function(endGameCallback){
	this.move_lock = false;
	for(var agentID in this.agent_dict){
		this.agent_dict[agentID].init();
	}
	this.game_log = {
		"Gridworld" : {
			"Rows":this.gridworld.num_rows,"Cols":this.gridworld.num_cols,"Wall_Map":this.gridworld.wall_map
		},
		"Agent_IDs" : Object.keys(this.agent_dict),
		"Moves_Record" : []
	};
	this.game_active = true;
	this.endGameCallback = endGameCallback;
	this.recordState();
}
GridWorldEnvironmentSimultaneous.prototype.recordState = function(){
	if(!this.game_active){
		return;
	}
	var agent_state_dict = {};
	var id_array = this.game_log["Agent_IDs"]
	for(var i = 0; i < id_array.length; i++){
		agent_state_dict[id_array[i]] = this.agent_dict[id_array[i]].getState();
	}
	this.game_log["Moves_Record"].push(agent_state_dict);
}
GridWorldEnvironmentSimultaneous.prototype.endGame = function(){
	this.game_log["result"] = this.game_result;
	this.endGameCallback(this.game_log);
	this.game_log = {};
	this.game_active = false;
	this.move_lock = true;
}
GridWorldEnvironmentSimultaneous.prototype.checkEndConditions = function(){
	for(var condition_ID in this.end_game_triggers){
		if(this.end_game_triggers[condition_ID](this)){
			this.game_result = condition_ID;
			this.endGame();
			break;
		}
	}
}
GridWorldEnvironmentSimultaneous.prototype.agentsMovesReady = function(){
	var found_unready = false;
	for(var key in this.agents_moves_dict){
		if(this.agents_moves_dict[key] == "NULL"){
			found_unready = true;
			break;
		}
	}
	return !found_unready;
}
GridWorldEnvironmentSimultaneous.prototype.setAgentMove = function(agent, action){
	if(this.move_lock){ return; }
	this.agents_moves_dict[agent.getID()] = action;
	if(this.agentsMovesReady()){
		this.applyAgentsMoves();
	}
}
GridWorldEnvironmentSimultaneous.prototype.simulateAgentMove = function(agent, action){
	return this.applyAgentMove(agent, action);
}
GridWorldEnvironmentSimultaneous.prototype.applyAgentsMoves = function(){
	this.move_lock = true;
	var new_world_state = this.getWorldState();
	var agent_last_actions = {}
	//first pass updates all agents new states internally
	for(var agentID in this.agents_moves_dict){
		var agent = this.agent_dict[agentID];
		new_world_state['agents'][agentID] = this.applyAgentMove(agent, this.agents_moves_dict[agentID]);
		agent_last_actions[agentID] = this.agents_moves_dict[agentID];
	}

	this.move_lock = false;
	//second pass sends out new states along with observations of new world state
	for(var agentID in this.agents_moves_dict){
		var agent = this.agent_dict[agentID];
		var agent_new_state = new_world_state['agents'][agentID];
		var agent_action = agent_last_actions[agentID];
		var agent_observation = agent.observation_function(new_world_state);
		this.agents_moves_dict[agentID] = "NULL";
		agent.transition(
			agent_new_state, 
			this.reward_function(agent.getState(), agent_action, agent_new_state),
			agent_observation);
	}
	this.recordState();
	this.checkEndConditions();
}
GridWorldEnvironmentSimultaneous.prototype.applyAgentMove = function(agent, action){
	new_state = [agent.getState()[0] + action[0], agent.getState()[1] + action[1]];
	if(this.gridworld.isCellAllowed(new_state[0], new_state[1])){
		return new_state;
	} else{
		return agent.getState();
	}
}
GridWorldEnvironmentSimultaneous.prototype.getWorldState = function(){
	var world_state = {};
	world_state['gridworld'] = this.gridworld;
	world_state['agents'] = {};
	for(var agentID in this.agent_dict){
		world_state['agents'][agentID] = this.agent_dict[agentID].getState();
	}
	return world_state;
}
GridWorldEnvironmentSimultaneous.prototype.getAgentState = function(agentID){
	return this.agent_dict[agentID].getState();
}
/*
					End GridWorldEnvironmentSimultaneous Class
*/

/*
					GridWorldEnvironmentTB Class
*/
//Environment model that handles a 2D gridworld that cycles through agent turns one at a time
function GridWorldEnvironmentTB(gridworld, agent_dict, reward_function, end_game_triggers){
	this.gridworld = gridworld;
	this.agent_dict = agent_dict;
	this.reward_function = reward_function;
	this.turn = null;
	this.turn_order = [];
	this.game_log = {};
	this.game_active = true;
	this.end_game_triggers = end_game_triggers;
	this.game_result = "";
	this.setup_agents_moves_dict();
}
GridWorldEnvironmentTB.prototype.addAgent = function(agent){ 
	this.agent_dict[agent.getID()] = agent; 
	this.turn_order.push(agent.getID());
	this.agents_moves_dict[agent.getID()] = "NULL"; 
}
GridWorldEnvironmentTB.prototype.setup_agents_moves_dict = function(){
	this.agents_moves_dict = {};
	for(var agentID in this.agent_dict){
		this.agents_moves_dict[agentID] = "NULL";
	}
}
GridWorldEnvironmentTB.prototype.init = function(endGameCallback){
	for(var agentID in this.agent_dict){
		this.agent_dict[agentID].init();
	}
	this.game_log = {
		"Gridworld" : {
			"Rows":this.gridworld.num_rows,"Cols":this.gridworld.num_cols,"Wall_Map":this.gridworld.wall_map
		},
		"Agent_IDs" : Object.keys(this.agent_dict),
		"Turn_Order" : this.turn_order,
		"Moves_Record" : []
	};
	this.game_active = true;
	this.endGameCallback = endGameCallback
	this.recordState();
	this.startTurns();
}
GridWorldEnvironmentTB.prototype.recordState = function(){
	if(!this.game_active){
		return;
	}
	var agent_state_dict = {};
	var id_array = this.game_log["Agent_IDs"]
	for(var i = 0; i < id_array.length; i++){
		agent_state_dict[id_array[i]] = this.agent_dict[id_array[i]].getState();
	}
	this.game_log["Moves_Record"].push(agent_state_dict);
}
GridWorldEnvironmentTB.prototype.startTurns = function(){
	this.nextTurn(0);
}
GridWorldEnvironmentTB.prototype.endGame = function(){
	this.game_log["result"] = this.game_result;
	this.endGameCallback(this.game_log);
	this.game_log = {};
	this.game_active = false;
	this.turn = null;
}
GridWorldEnvironmentTB.prototype.checkEndConditions = function(){
	for(var condition_ID in this.end_game_triggers){
		if(this.end_game_triggers[condition_ID](this)){
			this.game_result = condition_ID;
			this.endGame();
			break;
		}
	}
}
GridWorldEnvironmentTB.prototype.nextTurn = function(new_turn){
	if(!this.game_active){
		return;
	}
	this.turn = new_turn;
	var next_agent = this.agent_dict[this.turn_order[this.turn]];
	var new_world_state = this.getWorldState();
	next_agent.chooseAction(next_agent.observation_function(new_world_state));
}
GridWorldEnvironmentTB.prototype.setAgentMove = function(agent, action){
	if(this.turn == null || this.turn_order[this.turn] != agent.getID() || !this.game_active){ return; }
	this.agents_moves_dict[agent.getID()] = action;
	this.takeAgentTurn();
}
GridWorldEnvironmentTB.prototype.simulateAgentMove = function(agent, action){
	return this.applyAgentMove(agent, action);
}
GridWorldEnvironmentTB.prototype.takeAgentTurn = function(){
	var new_world_state = this.getWorldState();
	var agent_ID_turn = this.turn_order[this.turn];
	var agent = this.agent_dict[agent_ID_turn];
	new_world_state['agents'][agent_ID_turn] = this.applyAgentMove(agent, this.agents_moves_dict[agent_ID_turn]);
	var agent_observation = agent.observation_function(new_world_state);

	var turn_copy = this.turn + 1;
	this.turn = null;
	if(turn_copy >= this.turn_order.length){
		turn_copy = 0;
	}
	for(var agentID in this.agents_moves_dict){
		var agent_u = this.agent_dict[agentID];
		var agent_new_state = new_world_state['agents'][agentID];
		var agent_action = null;
		if(agentID == agent_ID_turn){
			agent_action = this.agents_moves_dict[agentID];
		}
		var agent_observation = agent_u.observation_function(new_world_state);
		agent_u.transition(
			agent_new_state, 
			this.reward_function(agent.getState(), agent_action, agent_new_state),
			agent_observation);
	}
	this.recordState();
	this.checkEndConditions();
	var that = this;
	setTimeout(function(){that.nextTurn(turn_copy)}, 100);
}
GridWorldEnvironmentTB.prototype.applyAgentMove = function(agent, action){
	new_state = [agent.getState()[0] + action[0], agent.getState()[1] + action[1]];
	if(this.gridworld.isCellAllowed(new_state[0], new_state[1])){
		return new_state;
	} else{
		return agent.getState();
	}
}
GridWorldEnvironmentTB.prototype.getWorldState = function(){
	var world_state = {};
	world_state['gridworld'] = this.gridworld;
	world_state['agents'] = {};
	for(var agentID in this.agent_dict){
		world_state['agents'][agentID] = this.agent_dict[agentID].getState();
	}
	return world_state;
}
GridWorldEnvironmentTB.prototype.getAgentState = function(agentID){
	return this.agent_dict[agentID].getState();
}
/*
					End GridWorldEnvironmentTB Class
*/