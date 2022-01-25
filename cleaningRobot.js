// In this simple problem the world includes both the environment and the robot
// but in most problems the environment and world would be separate
class World {
    constructor(numFloors) {
        this.location = 0;
        this.floors = [];
        for (let i = 0; i < numFloors; i++) {
            this.floors.push({dirty: false});
        }
    }

    markFloorDirty(floorNumber) {
        this.floors[floorNumber].dirty = true;
    }

    simulate(action) {
        switch(action) {
        case 'SUCK':
            this.floors[this.location].dirty = false;
            break;
        case 'LEFT':
            this.location = 0;
            break;
        case 'RIGHT':
            this.location = 1;
            break;
        
        //} adicionando o acima e abaixo
        
        case 'UP':
	    	if(this.location == 2){
				this.location = 0;
			} else if (this.location == 3){
				this.location = 1;
			}
			if (this.weights[this.location] > 0){ this.weights[this.location] -= 1; }
			break;
		case 'DOWN':
			if(this.location == 0){
				this.location = 2;
			} else if (this.location == 1){
				this.location = 3;
			}
			if (this.weights[this.location] > 0){ this.weights[this.location] -= 1; }
			break;
        }

        return action;
    }
}


// Rules are defined in code
function reflexVacuumAgent(world) {
    if (world.floors[world.location].dirty) { return 'SUCK'; }
    else if (world.location == 0)           { return 'RIGHT'; }
    else if (world.location == 1)           { return 'LEFT'; }
}

// Rules are defined in data, in a table indexed by [location][dirty]
function tableVacuumAgent(world, table) {
    let location = world.location;
    let dirty = world.floors[location].dirty ? 1 : 0;
    return table[location][dirty];
}