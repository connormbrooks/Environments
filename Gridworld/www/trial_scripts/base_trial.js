function setupGame(){
	var myContainer = new Container(450, 600);
	var myWallMap = [[0,3],[0,4],[0,5],[0,6],[0,7],[1,3],[1,4],[1,5],[1,6],[1,7],[5,3],[5,4],[5,5],[5,6],[5,7],[6,3],[6,4],[6,5],[6,6],[6,7]];
	var myGoalMap = [generateGoal()];
	var humanStartState = generateHumanStart();
	var robotStartState = generateRobotStart();
	var myGridWorld = new GridWorld(myContainer, 11, 7, myWallMap, myGoalMap);
	var myEnvironment = new GridWorldEnvironmentTB(myGridWorld, 
		{}, 
		function(){ return 0; }, 
		{	"success" : function(gwe){ 
				human_pos = gwe.getAgentState('human');
				if(human_pos[0] == myGoalMap[0][0] && human_pos[1] == myGoalMap[0][1]){
					return true;
				} else {
					return false;
				}
			},
			"failure" : function(gwe){
				human_pos = gwe.getAgentState('human');
				robot_pos = gwe.getAgentState('robot');
				if(human_pos[0] == robot_pos[0] && human_pos[1] == robot_pos[1]){
					return true;
				} else {
					return false;
				}
			}
		}
	);
	myAgent = new ButtonAgent(
		myEnvironment, 
		humanStartState[0], humanStartState[1], 
		function(world_state){ return []; }, 
		"human", 
		{"1": [-1, 0], "2": [0, 1], "3": [1, 0], "4": [0, -1]});
	myContainer.add_draw_object(new AgentGUI(myGridWorld, myAgent, "basic", "rgb(150,20,150)"));
	
	var robotAgent = createAgent(myEnvironment, humanStartState, robotStartState);
	myContainer.add_draw_object(new AgentGUI(myGridWorld, robotAgent, "cross", "blue"));

	myEnvironment.init(endGame);
	requestAnimationFrame(mainLoop);

	function mainLoop(){
		myContainer.update();
		myContainer.draw();
		requestAnimationFrame(mainLoop);
	}

	function endGame(gameLog){
		var url = "http://localhost/test/game_log.php";
		$.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify(gameLog),
			dataType: 'json',
			success: server_response
		});
	}

	function server_response(data){
		console.log(data);
	}
}

function generateGoal(){
	//generate goal randomly between 3 points
	var goal = [3,10];
	goal[0] += Math.floor(Math.random()*3)*3 - 3;
	return goal;
}

function generateHumanStart(){
	//generate human start randomly between 3 points
	var goal = [3,0];
	goal[0] += Math.floor(Math.random()*3)*3 - 3;
	return goal;
}

function generateRobotStart(){
	//generate robot start within 3x3 grid in center of world
	var random_adder = Math.floor(Math.random()*9);
	var goal = [2, 4];
	goal[0] += random_adder % 3; 
	goal[1] += Math.floor(random_adder / 3);
	return goal
}