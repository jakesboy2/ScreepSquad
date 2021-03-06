/** @namespace Flag */
 
'use strict';
/**
 * Finds the closest Overseer room to the RemoteHarvest Flag
 * @return {string|null} closestRoom
 */
Flag.prototype.assignRemoteFlagToRoom = function () {
    
    //loop through owned rooms and check if a this flag's room exists within its memory
    var flagRoom = this.pos.roomName;
    var ownedRooms = _.filter(Game.rooms, r => r.isOwnedRoom() == true)
    var isExist = false;
    
    for(let currentRoom of ownedRooms)
    {   
        var remoteRooms = null;
        if(currentRoom.memory.remoteRooms)
            remoteRooms = Object.keys(currentRoom.memory.remoteRooms); 
        
        //check if the flag is assigned to this room and trigger the isExist bool and break the loop
        if(_.some(remoteRooms, roomName => roomName == flagRoom))
        {
            isExist = true;
            break;
        }
    }
    

    //if flag is not assigned to a room, find closest room and assign it
    if(!isExist)
    {
        
        let closestRoom = ownedRooms[0].name;
        let bestDistance = Game.map.getRoomLinearDistance(flagRoom, closestRoom);
        
        let currentDistance;
        
        //loop over all rooms and flag the closest one
        for(let room in ownedRooms)
        {
            //get the distance between the flag room and the room we're checking
            currentDistance = Game.map.getRoomLinearDistance(flagRoom, ownedRooms[room].name);

            //check if this distance is less than the previous distance
            if(currentDistance < bestDistance)
            {
                closestRoom = ownedRooms[room].name;    
                bestDistance = currentDistance;
            }
        }

        //return the closest room to the remote room
        console.log("Remote Room added to room " + closestRoom);
        return closestRoom;
    }
	else
	{
		return null;
	}

		
}
//----------------


/**
 * Finds the closest Overseer room to the Claim Flag
 * @return {string|null} closestRoom
 */
Flag.prototype.assignClaimFlagToRoom = function () {
    
    //loop through owned rooms and check if a this flag's room exists within its memory
    var flagRoom = this.pos.roomName;
    var ownedRooms = _.filter(Game.rooms, r => r.isOwnedRoom() == true)
    var isExist = false;
    
    let currentRoom;
    
    for(let currentRoom of ownedRooms)
    {   
        
        var claimRooms = null;
        if(currentRoom.memory.claimRooms)
            claimRooms = Object.keys(currentRoom.memory.claimRooms); 
        
        //check if the flag is assigned to this room and trigger the isExist bool and break the loop
        if(_.some(claimRooms, roomName => roomName == flagRoom))
        {
            isExist = true;
            break;
        }
    }
    

    //if flag is not assigned to a room, find closest room and assign it
    if(!isExist)
    {
        
        let closestRoom = ownedRooms[0].name;
        let bestDistance = Game.map.getRoomLinearDistance(flagRoom, closestRoom);
        
        let currentDistance;
        
        //loop over all rooms and flag the closest one
        for(let room in ownedRooms)
        {
            //get the distance between the flag room and the room we're checking
            currentDistance = Game.map.getRoomLinearDistance(flagRoom, ownedRooms[room].name);

            //check if this distance is less than the previous distance
            if(currentDistance < bestDistance)
            {
                closestRoom = ownedRooms[room].name;    
                bestDistance = currentDistance;
            }
        }

        //return the closest room to the remote room
        console.log("Claim Room added to room " + closestRoom);
        return closestRoom;
    }
	else
	{
		return null;
	}
}
//--------

/**
 * Finds the closest Overseer room to the attack flag.
 * @return {string|null} closestRoom
 */
Flag.prototype.assignAttackFlagToRoom = function () {
	
    //loop through owned rooms and check if a this flag's room exists within its memory
    var flagRoom = this.pos.roomName;
    var ownedRooms = _.filter(Game.rooms, r => r.isOwnedRoom() == true)
    var isExist = false;
    
    let currentRoom;
    
    for(let room in ownedRooms)
    {   
        currentRoom = ownedRooms[room];
        var remoteRooms = Object.keys(currentRoom.memory.remoteRooms); 
        
        //check if the flag is assigned to this room and trigger the isExist bool and break the loop
        if(_.some(remoteRooms, roomName => roomName == flagRoom))
        {
            isExist = true;
            break;
        }
    }
    

    //if flag is not assigned to a room, find closest room and assign it
    if(!isExist)
    {
        
        let closestRoom = ownedRooms[0].name;
        let bestDistance = Game.map.getRoomLinearDistance(flagRoom, closestRoom);
        
        let currentDistance;
        
        //loop over all rooms and flag the closest one
        for(let room in ownedRooms)
        {
            //get the distance between the flag room and the room we're checking
            currentDistance = Game.map.getRoomLinearDistance(flagRoom, ownedRooms[room].name);

            //check if this distance is less than the previous distance
            if(currentDistance < bestDistance)
            {
                closestRoom = ownedRooms[room].name;    
                bestDistance = currentDistance;
            }
        }

        //return the closest room to the remote room
        console.log("Attack Room added to room " + closestRoom);
        return closestRoom;
    }
	else
	{
		return null;
	}
}
//------

/**
 * Filters flag type and calls the appropriate 'assign' function.
 * @return {string[]} [FlagType, AssignedRoomName]
 */
Flag.prototype.assignFlagToRoom = function () {
	
	let flagType = null, assignedRoom = null;
	
    	//if its double yellow, remote flags
        if(this.color === COLOR_YELLOW && this.secondaryColor === COLOR_YELLOW) {
            flagType = "Remote";
            assignedRoom = this.assignRemoteFlagToRoom();
        }
    
        //if its double white, claim flag
        else if(this.color === COLOR_WHITE && this.secondaryColor === COLOR_WHITE) {
            flagType = "Claim";
            assignedRoom = this.assignClaimFlagToRoom();
        }
    
    	//if its double red, attack flag
        else if(this.color === COLOR_RED) {
            flagType = "Attack";
            assignedRoom = this.assignAttackFlagToRoom();
        }
        
    if(flagType != null && assignedRoom != null){
        return [flagType, assignedRoom];
    }
    
}
//-----
