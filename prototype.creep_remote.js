/** @namespace Creep_Remote */
'use strict';

//run get energy for the remote drones
Creep.prototype.runGetEnergyRemote = function(){

    var target = Game.getObjectById(this.workTarget);
	
	if(target == null || target == undefined){
	    this.getRemoteTarget(RESOURCE_ENERGY);
	    target = Game.getObjectById(this.workTarget);
	    //catch if there are no available targets
	    if(target == null) return;
	    
	}
	

	if(!this.Full) {
        
		//if creep is not full, get energy
		if(target != null && target.energyAvailable() > 0)
            this.getEnergy(target);
        else
            this.getRemoteTarget(RESOURCE_ENERGY);
        
	}
	else {
	    
		//when creep is full, get a new target and set state to moving
		this.getRemoteTarget();
		
	}

}
//----------


//run use energy for remote drones
Creep.prototype.runUseEnergyRemote = function(){
    
    //works ONLY for drones
    var target = Game.getObjectById(this.workTarget);
    //Assumes that their only target is storage/links
    this.transfer(target, RESOURCE_ENERGY);
    
    this.getRemoteTarget();
    this.run();
}

//---------


//run moving for remote creeps
Creep.prototype.runMovingRemote = function(){
	
    //get work target id/object
    var target = this.workTarget;
    
    var targetRoom = this.memory.remoteRoom;
    
    //checks if it's an object stored in memory and if it has an "x" property.
    if(target instanceof Object && target.hasOwnProperty("x")){
        target = new RoomPosition(target.x, target.y, target.roomName);
        targetRoom = target.roomName;
    }
    else{
        target = Game.getObjectById(target);
    }
    
    var homeRoom = this.memory.homeRoom;


    //if target exists, move to it, otherwise get one
    if(target != null && target != undefined)
    {
        //check if target is an instance of a room or a room object
        if(target instanceof RoomPosition)
        {
            //avoids getting stuck on exit tile if there is no target from getRemoteTarget()
            this.travelTo(target, {allowHostile: true});
            if(this.room.name == targetRoom){
                this.getRemoteTarget();
                //Definitely causes a loop
                //this.run();
            }
            
        }
        else
        {
            if(this.canReach(target) ){
                //might not be needed here, since I added it as the default moving state for miners
                if(this.memory.role == "remoteMiner"){
                    this.moveCreepToContainer();
                }
                else{
                    this.getNextStateRemote();
                }
                //Periodically causes a loop
                //this.run();
                
            }
            else{
                
                if(this.isOnExitTile())
			    {
			        this.moveAwayFromExit();
			    }
			    else
			    {
			        
			        if(this.memory.role == "remoteMiner"){
			            this.moveCreepToContainer();
			        }
			        else{
			            this.travelTo(target, {allowHostile: true});
			        }
			        
			    }
            }
            
        }
    }
    else
    {
        //if target is not defined, find a new one!!
        this.getRemoteTarget();
    }
}

//---------


//run spawning for remote creeps
Creep.prototype.runSpawningRemote = function(){

    //if creep is not spawning, get it a target and change state
    if(!this.spawning)
    {
        this.getRemoteTarget();
    }
}

//----------


//run mining for static remote miners
Creep.prototype.runHarvestingRemote = function(){
    
    var target = Game.getObjectById(this.workTarget);
    
    //If we have expended the source work on container
    if(this.harvest(target) == ERR_NOT_ENOUGH_RESOURCES) {
        
        //If we have no energy in carry, pick up from our drops
        if(this.carry[RESOURCE_ENERGY] == 0){
            
            var droppedEnergy = this.pos.lookFor(LOOK_ENERGY)[0];
            if(droppedEnergy != null){
                this.pickup(droppedEnergy);
            }
            //If there are no drops, use energy from container
            else if(target.container != undefined){
                
                let container = Game.getObjectById(target.container);
                //check if container is a structure or constSite
                if(container instanceof StructureContainer)
                    this.withdraw(container, RESOURCE_ENERGY);
            }
        }
        
        //Check if source has a container assigned,
        //if it doesn't, construct one or reassign it
        if(target.container == undefined){
            
            //place a construction site and store it in memory, or check for an existing container
            this.pos.createConstructionSite(STRUCTURE_CONTAINER)
            
            //Check for construction site that exists
            let construction = this.pos.lookFor(LOOK_CONSTRUCTION_SITES)[0];
            
            if(construction != null && construction.structureType == STRUCTURE_CONTAINER){
                //assign it to target memory(room.memory.sources[source.id].container)
                target.container = construction.id;
                
            }
            //Check for a container structure
            else{
             
                let container = this.pos.lookFor(LOOK_STRUCTURES)[0];
                //assign it to target memory
                if(container != null && container.structureType == STRUCTURE_CONTAINER)
                    target.container = container.id;

            }
                    
        }
        //If one does exist, check if it needs built or repaired
        else{
            
            let container = Game.getObjectById(target.container);
            
            if(container == null)
                target.container = undefined;
            else if(container instanceof ConstructionSite)
                this.build(container);
            else if(container.hits < container.hitsMax)
                this.repair(container);
        }

        
    }
    //Drop what we have for drones to use
    else{
        
        //Not dropping energy to avoid looking for it the first building tick.
        // And also because it incurs a .2 CPU cost every tick in addition to the .2 for harvesting
        // Better to just let it drop once creep is full
        //this.drop(RESOURCE_ENERGY);
        
    }
}
//----------


//run get next state for remote creep
Creep.prototype.getNextStateRemote = function(){

    var target = Game.getObjectById(this.workTarget);
    var currentState = this.state;
	var nextState;

    

    //need to somehow check if they are either x% full before assigning use resources
     //Possible issue of going back for mroe energy before empty
    
    //could check if target is a type of energy/StructContainer and always infer that it is for getEnergy
        //Possible issue of not repairing containers(thought it might not matter if we leave miners handling that)




	if(!this.Empty || this.memory.role == "remoteMiner" || this.memory.role == "remoteReserver")
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
//----------


//run reserving state
Creep.prototype.runReservingRemote = function(){
    
    var target = Game.getObjectById(this.workTarget);
    
    //Can optionally sign the controller here
    //this.signController(target, "");
    this.reserveController(target);
}
//----------------


//run get target for creep
Creep.prototype.getRemoteTarget = function (targetType){
    
    
    //this makes targetType an optional parameter.
    //if it is not defined in the function call, it will equal null
    this.workTarget = null;
    targetType = targetType || null;
    
    //If not in remote room and not a remoteDrone OR if not in remote room and you are a drone, but you aren't full
    if(this.room.name != this.memory.remoteRoom && ( this.Empty || this.memory.role == "remoteMiner") ){
        //Places the properties of a RoomPosition target in memory instead
        this.workTarget = {x: 25, y: 25, roomName: this.memory.remoteRoom};
    }
    
    //check if the creep is empty or if we request an energy target
    else if( (this.Empty || targetType == RESOURCE_ENERGY) && this.memory.role != "remoteReserver" && this.memory.role != "remoteMiner")
    {
        this.workTarget = this.getEnergyJob();
    }
    
    else //if targetType == "WORK" / this.Full
    {
        //Very basic function (Only has default targets in it)
        this.workTarget = this.getRemoteWorkJob();
		//console.log(this.workTarget);
        
    }
    
    this.state = 'STATE_MOVING';
}

/**
* command the remote creep to flee the room
* <p> Allows the remote creep to flee the room to saftey </p>
*/
Creep.prototype.runRemoteFlee = function ()
{
    let homeRoom = Game.rooms[this.memory.homeRoom];
    let remoteRoomDefcon = homeRoom.memory.remoteRooms[this.memory.remoteRoom].defcon;
    
    //check if the room has become safe in the mean time, go back to a normal state if so
    if (remoteRoomDefcon > 0)
    {
        //if we're in the home room, stay put
        if (homeRoom.name === this.room.name)
        {
            //alert the other creeps of the danger going on in the remote room
            this.say("DANGER!");

            //get off exit tile if we have to
            if(this.isOnExitTile())
            {
                this.moveAwayFromExit();
            }
            else{
                
                //Find a position 5 tiles into the homeRoom, to avoid clogging exits;
                let exitDir = this.room.findExitTo(this.memory.remoteRoom);
                let posArray = [this.pos.x, this.pos.y, this.room.name];
                
                if(exitDir == FIND_EXIT_TOP)
                    posArray[1] = 5;
                else if(exitDir == FIND_EXIT_BOTTOM)
                    posArray[1] = 45;
                else if(exitDir == FIND_EXIT_LEFT)
                    posArray[0] = 5;
                else if(exitDir == FIND_EXIT_RIGHT)
                    posArray[0] = 45;
                    
                let targetPos = new RoomPosition(posArray[0], posArray[1], posArray[2]);
                
                this.travelTo(targetPos);
            }
        }
        else
        {
            let homePosition = new RoomPosition(25, 25, homeRoom.name);
            //we're in the remote room, run asf
            this.travelTo(homePosition);
        }
    }
    else
    {
        this.memory.workTarget = null;
        this.state = 'STATE_SPAWNING';
    }
}

/**
 * Checks to see if creep needs to change to flee_state
 * @return {boolean} needToFlee Whether or not the defcon is > 0
 */
Creep.prototype.needToFlee = function () {
    
    let remoteRoom = Game.rooms[this.memory.remoteRoom];

    let defcon = 0;
    
    if(remoteRoom != undefined){
        defcon = remoteRoom.memory.defcon;
    }
    else{
        let homeRoom = Game.rooms[this.memory.homeRoom];
        
        if(homeRoom != undefined){
            defcon = homeRoom.memory.remoteRooms[this.memory.remoteRoom].defcon;
        }
    }
    
    return defcon > 0;
}