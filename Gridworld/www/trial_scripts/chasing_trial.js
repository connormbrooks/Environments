function createAgent(myEnvironment, humanStartState, robotStartState){
	var chasingAgent = new ChasingAgent(
		myEnvironment,
		robotStartState[0], robotStartState[1],
		function(world_state){ return [world_state['agents']['human']] },
		"robot",
		[[-1, 0], [0, 1], [1, 0], [0, -1]],
		humanStartState);
	return chasingAgent;
}