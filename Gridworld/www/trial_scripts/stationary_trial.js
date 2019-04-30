function createAgent(myEnvironment, humanStartState, robotStartState){
	var stationaryAgent = new StationaryAgent(
		myEnvironment, 
		robotStartState[0], robotStartState[1], 
		function(world_state){ return []; },
		"robot", 
		2);
	return stationaryAgent;
}