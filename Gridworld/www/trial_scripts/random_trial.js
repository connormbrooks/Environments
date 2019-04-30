function createAgent(myEnvironment, humanStartState, robotStartState){
	var randomAgent = new RandomAgent(
		myEnvironment, 
		robotStartState[0], robotStartState[1], 
		function(world_state){ return []; },
		"robot", 
		[[-1, 0], [0, 1], [1, 0], [0,-1]]);
	return randomAgent;
}