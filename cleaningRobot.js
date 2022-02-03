// In this simple problem the world includes both the environment and the robot
// but in most problems the environment and world would be separate
class World {
    constructor(numFloors) {
        this.location = 0;
        this.floors = [];

        for (let i = 0; i < numFloors; i++) {
            this.floors.push({ dirty: false });
        }
        this.lastClean;
    }
    markFloorDirty(floorNumber) {
        this.floors[floorNumber].dirty = true;
    }

    // modificando as ações para adicionar up e down
    simulate(action) {
        switch (action) {
            case 'SUCK':
                this.floors[this.location].dirty = false;
                this.lastClean = this.location;
                break;
            //alterando a logica para adicionar mais location
            case 'LEFT':
                if (this.location == 1) {
                    this.location = 0;
                } else if (this.location == 3) {
                    this.location = 2;
                }
                break;

            case 'RIGHT':
                if (this.location == 0) {
                    this.location = 1;
                } else if (this.location == 2) {
                    this.location = 3;
                }
                break;

            case 'UP':
                if (this.location == 2) {
                    this.location = 0;
                } else if (this.location == 3) {
                    this.location = 1;
                }
                break;
            case 'DOWN':
                if (this.location == 0) {
                    this.location = 2;
                } else if (this.location == 1) {
                    this.location = 3;
                }
                break;
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

//As regras são definidas
//novas regras definidas para os reflex do codigo
// Rules are defined in code
function reflexVacuumAgent(world) {
    if (world.floors[world.location].dirty) { return 'SUCK' }
    else if (world.location == 0) {
        return 'DOWN'
    }
    else if (world.location == 1) {
        return 'LEFT'
    }
    else if (world.location == 2) {
        return 'RIGHT'
    }
    else if (world.location == 3) {
        return 'UP'
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
