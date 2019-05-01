from gridworld_engine import *
import time

gw = GridWorld([10,10], {str([4,4]): True, str([4,5]): True})
gw_agent = GWAgent([3,3], [0.5,0.5,0])
gw_object = GWObject([7,7], [0,1,0])
gw_gui = GridWorldGUI(gw, [gw_agent], [gw_object], 600, 600)
gw_gui.start()
