// In this simple problem the world includes both the environment and the robot
// but in most problems the environment and world would be separate
class World {
    constructor(numFloors) {
        this.location = 0;
        this.floors = [];

        //adicionando pesos
        this.weights = [];

        for (let i = 0; i < numFloors; i++) {
            this.floors.push({dirty: false});
            this.weights.push(0);
        }
        //
        this.lastClean;
    }

    markFloorDirty(floorNumber) {
        this.floors[floorNumber].dirty = true;
    }

    // modificando as ações para adicionar a ultima limpesa e os pesos
    // this.lastClean e this.weights
    simulate(action) {
        switch(action) {
        case 'SUCK':
            this.floors[this.location].dirty = false;
            this.lastClean = this.location;
			this.weights[this.location] += 1;
            break;
        
            //alterando a logica para adicionar mais location e os pesos
            case 'LEFT':
                if(this.location == 1){
                    this.location = 0;
                } else if(this.location == 3){
                    this.location = 2;
                }
                if (this.weights[this.location] > 0){ this.weights[this.location] -= 1; }
                break;
            
            case 'RIGHT':
                if(this.location == 0){
                    this.location = 1;
                } else if (this.location == 2){
                    this.location = 3;
                }
                if (this.weights[this.location] > 0){ this.weights[this.location] -= 1; }
                break;
            
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
            /*
                case 'DIAG_DOWN':
                if(this.location == 0){
                    this.location = 3;
                } else if (this.location == 1){
                    this.location = 2;
                }
                if (this.weights[this.location] > 0){ this.weights[this.location] -= 1; }
                break;
    
            case 'DIAG_UP':
                if(this.location == 2){
                    this.location = 1;
                } else if (this.location == 3){
                    this.location = 0;
                }
                if (this.weights[this.location] > 0){ this.weights[this.location] -= 1; }
                break;
                */
            }
            return action;
    }
}

/*
// As regras são definidas no código
function reflexVacuumAgent(world) {
    if (world.floors[world.location].dirty) { return 'SUCK'; }
    else if (world.location == 0)           { return 'RIGHT'; }
    else if (world.location == 1)           { return 'LEFT'; }
}
*/

//novas regras definidas para os reflex do codigo
// Rules are defined in code
function reflexVacuumAgent(world) {
	if (world.floors[world.location].dirty) { return 'SUCK' }
    else if (world.location == 0){
		
		if(this.lastLocation == 1){
			this.lastLocation = 0;
			//if(world.weights[3] > world.weights[2]){
			//	return 'DIAG_DOWN'
			//} else { return 'DOWN' }
            return 'DOWN'

		} else if(this.lastLocation == 2) { 
			this.lastLocation = 0;

			//if(world.weights[3] > world.weights[1]){
			//	return 'DIAG_DOWN'
			//} else { return 'RIGHT' }
            return 'RIGHT'
		
		} else { 
			this.lastLocation = 0;
			
			if(world.weights[1] > world.weights[2]){
				return 'RIGHT'
			} else { return 'DOWN' }
		}
	}
    else if (world.location == 1){
		if(this.lastLocation == 3) { 
			this.lastLocation = 1;

			//if(world.weights[2] > world.weights[0]) {
			//	return 'DIAG_DOWN'
			//} else { return 'LEFT' }
            return 'LEFT'
		
		} else if (this.lastLocation == 0) { 
			this.lastLocation = 1;
			
			//if(world.weights[2] > world.weights[3]){
			//	return 'DIAG_DOWN'
			//} else { return 'DOWN' }
            return 'DOWN'
		} else {
			this.lastLocation = 1;
			
			if(world.weights[0] > world.weights[3]){
				return 'LEFT'
			} else { return 'DOWN' }
		}
	}
	else if (world.location == 2){
		if(this.lastLocation == 0) { 
			this.lastLocation = 2;

			//if(world.weights[1] > world.weights[3]){
			//	return 'DIAG_UP'
			//} else { return 'RIGHT' }
            return 'RIGHT'
		} else if(this.lastLocation == 3) { 
			this.lastLocation = 2;
			
			//if(world.weights[1] > world.weights[0]){
			//	return 'DIAG_UP'
			//} else { return 'UP' }
            return 'UP'
		} else {
			this.lastLocation = 2;
			
			if(world.weights[3] > world.weights[0]){
				return 'RIGHT'
			} else { return 'UP' }	
		}
    }
	else if (world.location == 3){
		if(this.lastLocation == 1) { 
			this.lastLocation = 3;

	//		if(world.weights[0] > world.weights[2]){
	//			return 'DIAG_UP'
	//		} else { return 'LEFT' }
		return 'LEFT'
		} else if(this.lastLocation == 2) { 
			this.lastLocation = 3;
			
		//	if(world.weights[0] > world.weights[1]){
		//		return 'DIAG_UP'
		//	} else { return 'UP' }
            return 'UP'
    } else {
			this.lastLocation = 3;
			
			if(world.weights[2] > world.weights[1]) {
				return 'LEFT'
			} else { return 'UP' }
		}
    }
}
/*
// Rules are defined in data, in a table indexed by [location][dirty]
function tableVacuumAgent(world, table) {
    let location = world.location;
    let dirty = world.floors[location].dirty ? 1 : 0;
    return table[location][dirty];
}
*/
