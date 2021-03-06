/** @namespace Creep_Domestic */
'use strict';


//checks if the creep has a target and switches state based on target
Creep.prototype.runSpawningDomestic = function () {
    
    //check if the creep done spawning, get the next state
    if(!this.spawning){
        this.getTarget();
        this.run();
    }
    
}
//------


//moves the creep to the target and switches to the proper state upon arrival
Creep.prototype.runMovingDomestic = function () {
    
    //get work target object
    var target = Game.getObjectById(this.workTarget);


	if(target != null && target != undefined)
	{
		//check if creep is in the correct room
		if(this.homeRoom != this.room.name)
		{
			target = new RoomPosition(25, 25, this.homeRoom);
		}
		else
		{
			//creep is in the correct room check if we're at the target
			if(this.canReach(target))
			{
			    
			    //if the creep isn't a miner perform next state and run again normally
			    if(this.memory.role != 'miner')
			    {
			        //get next state 
				    this.getNextStateDomestic();
				    this.run();
			    }
			    else
			    {
			        this.moveCreepToContainer();
			    }//-------------
			    
			}
			else
			{
				//move to target
			    //check if creep is on an exit tile, if so move off of it in the correct direction
			    if(this.isOnExitTile())
			    {
			        this.moveAwayFromExit();
			    }
			    else
			    {
			        if(this.memory.role == 'miner'){
			            this.moveCreepToContainer();
			        }
			        else{
			            this.travelTo(target);
		            }
			    }   
			}
		}
	}
	else
	{
	    
		//if target is null, find a new one!!
		this.getTarget();
	}
    
}
//--------


//gets energy for the creep and switches to proper state upon becoming full
Creep.prototype.runHarvestingDomestic = function () {
    
	var target = Game.getObjectById(this.workTarget);
	
	if(target == null || target == undefined){
	    this.getTarget(RESOURCE_ENERGY);
	    target = Game.getObjectById(this.workTarget);
	    //catch if there are no available targets
	    if(target == null) return;
	    
	}
	
	//if creep is a miner, let it mine forever in this state
	if(this.role === 'miner')
	{
	    this.harvest(target);
	}
	else
	{
		if(!this.Full)
		{
		    //try to check the energy available from it
            try
            {
                //avoid waiting at a container that is filling 10energy/tick
			    if(target.energyAvailable() > 15){
		            this.getEnergy(target);
			    }
	            else{
	                this.getTarget(RESOURCE_ENERGY);
	            }
            }catch(err)
            {
                console.log(err.stack + ", sorry you're fak'd");
                this.getTarget(RESOURCE_ENERGY);
            }
			
            
		}
		else
		{
			//when creep is full, get a new target and set state to moving
			this.getTarget();
		}
	}
}
//--------


//works the creep's target and switches to proper state upon using up all energy or finishing the job
Creep.prototype.runWorkDomestic = function () {
	
	//as long as the creep has energy, keep using it
	if(!this.Empty)
	{
	    
		var target = Game.getObjectById(this.workTarget);

		//fail safe if job is complete before creep uses up energy
		//also allows drones to fill every tick instead of every other
		if(target == null || (this.memory.role == "drone" && target.energy >= target.energyCapacity) )
		{
			this.getTarget();
			target = Game.getObjectById(this.workTarget);
			
			if(target == null)
			    return;
		}

		//try to do work, catch invalid target (sometimes takes a couple ticks to catch up with a null target)
		//this keeps script from breaking in the mean time
		try
		{
		    
			//if the target is a valid target for a creep to use energy on
			if(target.energy < target.energyCapacity || target == this.room.controller 
			|| target.progress < target.progressTotal || target.hits < target.hitsMax || target == this.room.storage)
			{
			    
			        //do work on the target
			        this.useEnergy(target);
			}
			else
			{
				//if the target is full, gone, undefined, whatever, find new target and go back to moving 
				//(run role again so the creep doesn't have to wait another tick to go)
				this.getTarget();
				// this.run();
			}
		}
		catch(err)
		{
			console.log(this.name + " has encountered an issue in runWorkDomestic");
			console.log('<font color="#e04e4e">       ' + err.stack + "</font>");
		}

	}
	//If Creep is empty reselect target 
	else{
	    this.getTarget(RESOURCE_ENERGY);
	    this.run();
	}
}
//---------

/*
 * gets energy for the power upgrader creep
 */
Creep.prototype.runGetEnergyUpgrader = function () {
    
    var linkTarget = Game.getObjectById(this.memory.workTarget);
    //check if the link is empty, or creep is full
    if(linkTarget.energy === 0 || this.Full){
        
        this.memory.state = 'STATE_USE_RESOURCES';
    }
    else{ //get energy from the link
        if(this.canReach(linkTarget)){
            
            this.withdraw(linkTarget, RESOURCE_ENERGY);
        }
        else{

            this.memory.state = 'STATE_MOVING';
        }
    }
}
//---------


/*
 * use energy to upgrade controller for power upgrader creep
 */
Creep.prototype.runUseResourcesUpgrader = function () {
    ;
    //check if we're out of energy
    if(this.Empty){
        this.memory.workTarget = this.room.memory.upgraderLink;
        this.memory.state = 'STATE_GET_RESOURCES';
    }
    else{ //upgrade the controller
        
        if(this.canReach(this.room.controller)){
            this.memory.workTarget - this.room.controller.id;
            this.upgradeController(this.room.controller);
        }
        else{
            this.memory.workTarget = this.room.controller.id;
            this.memory.state = 'STATE_MOVING';
        }
    }
}


//switches the creep to the next state
Creep.prototype.getNextStateDomestic = function () {

    var target = Game.getObjectById(this.workTarget);
    var currentState = this.state;
	var nextState;
	
	//if creep is a miner only give access to get resources
	if(this.role === 'miner' || target instanceof Source)
	{
		nextState = 'STATE_GET_RESOURCES';
	}
	else if(!this.Empty)
	{
		//if creep has resources, use them
		nextState = 'STATE_USE_RESOURCES';
	}
	else
	{
	    //if creep has no resources, get them some
	    nextState = 'STATE_GET_RESOURCES';
	}
	
	
	this.state = nextState;
}
//---------


//decides if the creep should get an energy target or a work target
Creep.prototype.getTarget = function (targetType) {
    
    //this makes targetType an optional parameter.
    //if it is not defined in the function call, it will equal null
    this.workTarget = null;
    targetType = targetType || null;
    
    //check if the creep is empty to decide which target to get
    if((this.Empty && this.role != "miner" && this.role != "powerUpgrader") || targetType == RESOURCE_ENERGY)
    {
        
        //if creep has no energy, get an energy job
        this.workTarget = this.getEnergyJob();
    }
    else if(this.role === 'powerUpgrader'){
        this.workTarget = this.room.memory.upgraderLink;
    }
    else //if targetType == "WORK"
    {

        //supports drone, miner and worker 
        this.workTarget = this.getWorkJob();
        
        //Generic getWorkJob
        //this.workTarget = this.room.getWorkJob(this.role);
    }
    
    this.state = 'STATE_MOVING';
}
