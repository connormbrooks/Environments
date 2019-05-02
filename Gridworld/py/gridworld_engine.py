import pyglet
import math
import copy
'''

A Python-based gridworld environment

Created by Connor Brooks

For questions or comments, email connor.brooks@colorado.edu

'''

class GridWorld(object):
	"""
	Class for maintaining base gridworld environment. Does not keep track of agents within the environment or do any drawing.
	"""
	def __init__(self, size, wall_map):
		"""
		Args:
			size (list of ints): n-dimensional list specifying size in each dimension (note that only the first two dimensions will be drawn on the screen)
			wall_map (dict of str->bool): dict mapping cell coordinates to True for walls in GridWorld
		Return:
			(None)
		"""
		self.size = size
		self.wall_map = wall_map

	def get_size(self):
		return self.size

	def get_dimension_n(self, n):
		if(n >= len(self.size)):
			return None
		else:
			return self.size[n]

	def is_cell_allowed(self, pos):
		"""Checks if cell is allowed
		Args:
			pos (list of ints): cell coordinates
		Returns:
			bool: True for cell allowed, False otherwise
		"""
		if(not (len(pos) == len(self.size))):
			#incorrect dimension
			return False
		for dim in range(0, len(self.size)):
			if(pos[dim] < 0 or pos[dim] >= self.size[dim]):
				return False
		return True

	def check_wall(self, pos):
		"""Checks if wall is in given position
		Args:
			pos (list of ints): cell coordinates
		Returns:
			bool: True for wall in given position, False otherwise
		"""
		if(str(pos) in self.wall_map and self.wall_map[str(pos)]):
			return True
		return False

	def enum_valid_states(self):
		"""
		Enumerate all valid agent positions in this gridworld
		Args:
			(None)
		Return:
			list of n-dimensional lists: list of all valid states
		"""
		valid_states = []
		max_state_total = 1
		for i in range(0, len(self.size)):
			max_state_total *= self.size[i]
		for s in range(0, max_state_total):
			new_state = [s % self.size[0]]
			slot = s
			for dim in range(1, len(self.size)):
				slot = math.floor(slot / self.size[dim-1])
				dim_index = slot % self.size[dim]
				new_state.append(slot)
			if(self.is_cell_allowed(new_state) and not self.check_wall(new_state)):
				valid_states.append(copy.deepcopy(new_state))
		return valid_states


class GWAgent(object):
	"""
	Base class for GridWorld agents. This should be the parent class of all specific agent types.
	"""
	def __init__(self, start_state, color):
		"""
		Args:
			start_state (list of ints): n-dimensional list of ints corresponding to agent starting state
			color (list of floats): 3-dimensional list of floats between [0,1] specifying color of agent when drawn
		Return:
			(None)
		"""
		self.state = start_state
		self.color = color

	def alert_key_press(self, symbol):
		"""
		Function that can be overridden by agents that make use of keyboard input
		"""
		pass

	def alert_new_state(self, new_state):
		"""
		Function that can be overridden for taking in new world state (possibly including new agent state)
		"""
		pass

	def draw(self, window, sizing):
		"""
		Draw basic agent
		Args:
			window(pyglet Window): window for drawing on
			sizing(list of ints): dimensions of visual gridworld given in [cell width, cell height]
		Return:
			(None)
		"""
		pyglet.gl.glBegin(pyglet.gl.GL_TRIANGLES)
		pyglet.gl.glColor3f(self.color[0], self.color[1], self.color[2])
		pyglet.gl.glVertex2f(self.state[0]*sizing[0] + 0.5*sizing[0], (self.state[1]+1)*sizing[1]) #top middle of cell
		pyglet.gl.glVertex2f(self.state[0]*sizing[0], self.state[1]*sizing[1]) #bottom left of cell
		pyglet.gl.glVertex2f((self.state[0]+1)*sizing[0], self.state[1]*sizing[1]) #bottom right of cell
		pyglet.gl.glEnd()

	def get_state(self):
		return self.state

	def set_state(self, state):
		self.state = state

class GWObject(object):
	"""
	Base class for GridWorld objects (these objects are assumed to be stationary and not take actions). This should be the parent class of all specific object types (including goals).
	"""
	def __init__(self, pos, color):
		"""
		Args:
			pos (list of ints): n-dimensional list of ints corresponding to agent starting state
			color (list of floats): 3-dimensional list of floats between [0,1] specifying color of agent when drawn
		Return:
			(None)
		"""
		self.state = pos
		self.color = color

	def draw(self, window, sizing):
		"""
		Draw basic object, shape will likely be overridden by subclasses
		Args:
			window(pyglet Window): window for drawing on
			sizing(list of ints): dimensions of visual gridworld given in [cell width, cell height]
		Return:
			(None)
		"""
		pyglet.gl.glBegin(pyglet.gl.GL_TRIANGLES)
		pyglet.gl.glColor3f(self.color[0], self.color[1], self.color[2])
		#top half triangle
		pyglet.gl.glVertex2f((self.state[0]+0.5)*sizing[0], self.state[1]*sizing[1]) #top middle of cell
		pyglet.gl.glVertex2f(self.state[0]*sizing[0], (self.state[1]+0.5)*sizing[1]) #left middle of cell
		pyglet.gl.glVertex2f((self.state[0]+1)*sizing[0], (self.state[1]+0.5)*sizing[1]) #right middle of cell
		#bottom half triangle
		pyglet.gl.glVertex2f(self.state[0]*sizing[0], (self.state[1]+0.5)*sizing[1]) #left middle of cell
		pyglet.gl.glVertex2f((self.state[0]+1)*sizing[0], (self.state[1]+0.5)*sizing[1]) #right middle of cell
		pyglet.gl.glVertex2f((self.state[0]+0.5)*sizing[0], (self.state[1]+1)*sizing[1]) #bottom middle of cell
		pyglet.gl.glEnd()

	def get_state(self):
		return self.state

	def set_state(self, state):
		self.state = state

class GridWorldGUI(object):
	"""
	Class for drawing GridWorlds
	"""
	def __init__(self, gridworld, agent_list, object_list, window_width, window_height):
		"""
		Args:
			gridworld (GridWorld object): object that defines the size and walls of the gridworld
			agent_list(list of GWAgent objects): list of GWAgents to draw in the gridworld
			object_list(list of GWObject objects): list of GWObjects to draw in the gridworld
			window_width(float): width of the window, in pixels
			window_height(float): height of the window, in pixels
		Return:
			(None)
		"""
		self.gridworld = gridworld
		self.agents = agent_list
		self.objects = object_list
		self.cell_width = window_width / self.gridworld.size[0]
		self.cell_height = window_height / self.gridworld.size[1]
		self.setup()

	def setup(self):
		"""
		Create functions for drawing and handling events
		Args:
			(None)
		Return:
			(None)
		"""
		window_width = self.cell_width*self.gridworld.size[0]
		window_height = self.cell_height*self.gridworld.size[1]
		self.window = pyglet.window.Window(math.ceil(window_width), math.ceil(window_height), visible=False)
		pyglet.gl.glClearColor(1,1,1,1)
		self.create_event_handlers()
		@self.window.event
		def on_draw():
			self.window.clear()
			self.draw()
			for agent in self.agents:
				agent.draw(self.window, [self.cell_width, self.cell_height])
			for gw_object in self.objects:
				gw_object.draw(self.window, [self.cell_width, self.cell_height])

	def create_event_handlers(self):
		"""
		Attach event handlers to window
		Args:
			(None)
		Return:
			(None)
		"""
		@self.window.event
		def on_key_press(symbol, modifiers):
			for agent in self.agents:
				agent.alert_key_press(symbol)

	def draw(self):
		"""
		Setup drawing for base gridworld on window
		Args:
			(None)
		Return:
			(None)
		"""
		pyglet.gl.glBegin(pyglet.gl.GL_LINES)
		pyglet.gl.glColor3f(0,0,0)
		self.draw_vertical_lines()
		self.draw_horizontal_lines()
		pyglet.gl.glEnd()
		pyglet.gl.glBegin(pyglet.gl.GL_TRIANGLES)
		pyglet.gl.glColor3f(0.1,0.1,0.1)
		self.draw_walls()
		pyglet.gl.glEnd()

	def draw_vertical_lines(self):
		"""
		Draw vertical borders of cells
		Args:
			(None)
		Return:
			(None)
		"""
		for i in range(1, self.gridworld.size[1]):
			pyglet.gl.glVertex2f(i*self.cell_width, 0)
			pyglet.gl.glVertex2f(i*self.cell_width, self.cell_height*self.gridworld.size[0])
		
	def draw_horizontal_lines(self):
		"""
		Draw horizontal borders of cells
		Args:
			(None)
		Return:
			(None)
		"""
		for i in range(1, self.gridworld.size[0]):
			pyglet.gl.glVertex2f(0, i*self.cell_height)
			pyglet.gl.glVertex2f(self.cell_width*self.gridworld.size[1],i*self.cell_height)

	def draw_walls(self):
		"""
		Draw walls as specified by underlying gridworld
		Args:
			(None)
		Return:
			(None)
		"""
		wall_keys = list(self.gridworld.wall_map.keys())
		for i in range(0, len(wall_keys)):
			wall_loc = eval(wall_keys[i])
			#top left triangle
			pyglet.gl.glVertex2f(wall_loc[0]*self.cell_width, wall_loc[1]*self.cell_height) #top left of cell
			pyglet.gl.glVertex2f(wall_loc[0]*self.cell_width, (wall_loc[1]+1)*self.cell_height) #bottom left of cell
			pyglet.gl.glVertex2f((wall_loc[0]+1)*self.cell_width, wall_loc[1]*self.cell_height) #top right of cell
			#bottom right triangle
			pyglet.gl.glVertex2f((wall_loc[0]+1)*self.cell_width, (wall_loc[1]+1)*self.cell_height) #bottom right of cell
			pyglet.gl.glVertex2f(wall_loc[0]*self.cell_width, (wall_loc[1]+1)*self.cell_height) #bottom left of cell
			pyglet.gl.glVertex2f((wall_loc[0]+1)*self.cell_width, wall_loc[1]*self.cell_height) #top right of cell
		
	def start(self):
		"""
		Start app
		Args:
			(None)
		Return:
			(None)
		"""
		self.window.set_visible()
		pyglet.app.run()

class GridWorldEnvironment(object):
	"""
	Base class for handling a gridworld environment
	"""
	def __init__(self, gridworld, agent_dict, object_dict, transition, reward):
		"""
		Args:
			gridworld (GridWorld): underlying gridworld object
			agent_dict (dict of GWAgent objects): dictionary of all agents in this gridworld
			object_dict (dict of GWObject objects): dictionary of all objects in this gridworld
			transition (function): base transition function (can be overridden for specific agents)
			reward (function): base reward function (can be overridden for specific agents)
		return:
			(None)
		"""
		self.gridworld = gridworld
		self.agent_dict = agent_dict
		self.object_dict = object_dict
		agent_ID_list = list(self.agent_dict.keys())
		self.agent_transitions = {}
		self.agent_rewards = {}
		for agent_ID in agent_ID_list:
			self.set_agent_transition(agent_ID, transition)
			self.set_agent_reward(agent_ID, reward)

	def set_agent_transition(self, agent_ID, transition):
		self.agent_transitions[agent_ID] = transition

	def set_agent_reward(self, agent_ID, reward):
		self.agent_rewards[agent_ID] = reward

	def set_agent_state(self, agent_ID, state):
		self.agent_dict[agent_ID].set_state(state)

	def agent_action(self, agent_ID, action):
		"""
		Execute an agent's action and update environment state
		Args:
			agent_ID(string): ID of agent committing the action
			action(list of floats): action chosen by agent
		Return:
			(None)
		"""
		old_state = copy.deepcopy(self.get_state())
		new_state = self.agent_transitions[agent_ID](self.gridworld, old_state, agent_ID, action)
		#for now, we are assuming agent's action only update their own states
		self.agent_dict[agent_ID].set_state(new_state["agents"][agent_ID])
		agent_reward = self.agent_rewards[agent_ID](agent_ID, old_state, action, new_state)
		for agent_ID in self.agent_dict:
			self.agent_dict[agent_ID].alert_new_state(new_state)

	def get_state(self):
		"""
		Return full representation of environment state
		Args:
			(None)
		Return:
			dict
		"""
		state = {}
		state["gridworld"] = self.gridworld
		agent_ID_list = list(self.agent_dict.keys())
		state["agents"] = {}
		for agent_ID in agent_ID_list:
			state["agents"][agent_ID] = self.agent_dict[agent_ID].get_state()
		object_ID_list = list(self.object_dict.keys())
		state["objects"] = {}
		for object_ID in object_ID_list:
			state["objects"][object_ID] = self.object_dict[object_ID].get_state()
		return state

class GridWorldEnvironmentPO(GridWorldEnvironment):
	"""
	Base class for partially observable gridworld enviornment, in which each agent has an observation function
	"""
	def __init__(self, gridworld, agent_dict, object_dict, transition, reward, observation):
		"""
		Args:
			gridworld (GridWorld): underlying gridworld object
			agent_dict (dict of GWAgent objects): dictionary of all agents in this gridworld
			object_dict (dict of GWObject objects): dictionary of all objects in this gridworld
			transition (function): base transition function (can be overridden for specific agents)
			reward (function): base reward function (can be overridden for specific agents)
			observation (function): base observation function (can be overridden for specific agents)
		return:
			(None)
		"""
		super().__init__(gridworld, agent_dict, object_dict, transition, reward)
		agent_ID_list = list(self.agent_dict.keys())
		self.agent_observations = {}
		for agent_ID in agent_ID_list:
			self.set_agent_observation(agent_ID, observation)

	def set_agent_observation(self, agent_ID, observation):
		self.agent_observations[agent_ID] = observation

	def agent_action(self, agent_ID, action):
		"""
		Execute an agent's action and update environment state
		Args:
			agent_ID(string): ID of agent committing the action
			action(list of floats): action chosen by agent
		Return:
			(None)
		"""
		old_state = copy.deepcopy(self.get_state())
		new_state = self.agent_transitions[agent_ID](self.gridworld, old_state, agent_ID, action)
		agent_reward = self.agent_rewards[agent_ID](agent_ID, old_state, action, new_state)
		for agent_ID in self.agent_dict:
			#pass in the new state filtered through the agent's observation function
			self.agent_dict[agent_ID].alert_new_state(self.agent_observations[agent_ID](new_state))

