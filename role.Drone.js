'use strict';


module.exports = {
    run: function(creep) {

		//check the state and act appropirately
		switch(creep.memory.state)
		{
			case 'STATE_SPAWNING':



			break;


			case 'STATE_MOVING':



			break;


			case 'STATE_HARVESTING':



			break;


			case 'STATE_USE_RESOURCES':



			break;


			default: 

				console.log("Invalid creep state for " + creep.name);

			break;
		}
    }
    //---------------------
};