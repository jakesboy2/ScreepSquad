/** @namespace Empire_Comms */
'use strict';


/********************
 * GET HELP        */
/*******************/

//request an existing domestic creep from a friendly room
Room.prototype.requestDomesticCreep = function (role)
{

}
//---------------


//request defenders from a friendly room
Room.prototype.requestCombatCreep = function (role)
{
    
}
//---------------


//request resource from a friendly room
Room.prototype.requestResource = function (resourceType)
{
    
}
//--------------


/********************
 * SEND HELP       */
/*******************/

//send domestic creep to a needy room
Room.prototype.sendDomesticCreep = function (requestingRoom, role)
{

}
//--------------------


//send combat creep to a needy room
Room.prototype.sendCombatCreep = function (requestingRoom, role)
{

}
//--------------------


//send domestic creep to a needy room
Room.prototype.sendResource = function (requestingRoom, role)
{

}
//--------------------


/**********************
 * Aux Functions     */
/*********************/


//get best room to send help
Room.prototype.getHelperRoom = function(requestingRoom, helpType)
{

}
//-------------------


//decide if your room needs help and ask
Room.prototype.requestHelp = function()
{

}
//-------------------


//decide if you can send help and do it
Room.prototype.sendHelp = function(requestingRoom, helpType)
{
    
}
//-------------------
