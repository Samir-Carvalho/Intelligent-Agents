/* The general structure is to put the AI code in xyz.js and the visualization
   code in c_xyz.js. Create a diagram object that contains all the information
   needed to draw the diagram, including references to the environment&agents.
   Then use a draw function to update the visualization to match the data in
   the environment & agent objects. Use a separate function if possible for 
   controlling the visualization (whether through interaction or animation). 
   Chapter 2 has minimal AI and is mostly animations. */

const SIZE = 100;
const colors = {
    perceptBackground: 'hsl(240,10%,85%)',
    perceptHighlight: 'hsl(60,100%,90%)',
    actionBackground: 'hsl(0,0%,100%)',
    actionHighlight: 'hsl(150,50%,80%)'
};


/* Create a diagram object that includes the world (model) and the svg
   elements (view) */
function makeDiagram(selector) {
    let diagram = {}, world = new World(4);//criando world passando de 2 para 4 posições
    diagram.world = world;
    //diagram.xPosition = (floorNumber) => 150 + floorNumber * 600 / diagram.world.floors.length;
    //adicionando diagrama com novas posições x e y
    diagram.xPosition = (floorNumber) => (floorNumber % 2 != 0 ? 450 : 150);
    diagram.yPosition = (floorNumber) => (floorNumber >= 2 ? 450 : 150);


    diagram.root = d3.select(selector);
    diagram.robot = diagram.root.append('g')
        .attr('class', 'robot')
        .style('transform', `translate(${diagram.xPosition(world.location)}px,100px)`);
    diagram.robot.append('rect')
        .attr('width', SIZE)
        .attr('height', SIZE)
        .attr('fill', 'hsl(120,25%,50%)');
    diagram.perceptText = diagram.robot.append('text')
        .attr('x', SIZE / 2)
        .attr('y', -25)
        .attr('text-anchor', 'middle');
    diagram.actionText = diagram.robot.append('text')
        .attr('x', SIZE / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle');

    //adicionando new floors 
    diagram.floors = [];
    for (let floorNumber = 0; floorNumber < world.floors.length; floorNumber++) {
        diagram.floors[floorNumber] =
            diagram.root.append('rect')
                .attr('class', 'clean floor') // for css
                .attr('x', diagram.xPosition(floorNumber))
                //.attr('y', 225)
                //add nova posicao para y
                .attr('y', diagram.yPosition(floorNumber) + 105)
                .attr('width', SIZE)
                .attr('height', SIZE / 4)
                .attr('stroke', 'black')
                .on('click', function () {
                    world.markFloorDirty(floorNumber);
                    diagram.floors[floorNumber].attr('class', 'dirty floor');
                })
                // adicionando wet floor
                .on('contextmenu', function() {
                    if (world.markFloorWet(floorNumber)) {
                        diagram.floors[floorNumber].attr('class', 'wet floor');
                    }
                });
                
                
    }
    return diagram;
}


/* Rendering functions read from the state of the world (diagram.world) 
   and write to the state of the diagram (diagram.*). For most diagrams
   we only need one render function. For the vacuum cleaner example, to
   support the different styles (reader driven, agent driven) and the
   animation (agent perceives world, then pauses, then agent acts) I've
   broken up the render function into several. */

function renderWorld(diagram) {
    for (let floorNumber = 0; floorNumber < diagram.world.floors.length; floorNumber++) {
        diagram.floors[floorNumber].attr('class', diagram.world.floors[floorNumber].dirty ? 'dirty floor' : 'clean floor');
    }
    //diagram.robot.style('transform', `translate(${diagram.xPosition(diagram.world.location)}px,100px)`);
    // add
    diagram.robot.style('transform', `translate(${diagram.xPosition(diagram.world.location)}px,${diagram.yPosition(diagram.world.location)}px)`);

    console.log(diagram.world.location);
    console.log(diagram.world.floors);

}

function renderAgentPercept(diagram, dirty) {
    let perceptLabel = { false: "It's clean", true: "It's dirty" }[dirty];
    diagram.perceptText.text(perceptLabel);
}

function renderAgentAction(diagram, action) {
    //let actionLabel = {null: 'Waiting', 'SUCK': 'Vacuuming', 'LEFT': 'Going left', 'RIGHT': 'Going right'}[action];
    //adicionando as novas açoes
    let actionLabel = { null: 'Waiting', 'SUCK': 'Vacuuming', 'LEFT': 'Going left', 'RIGHT': 'Going right', 'DOWN': 'Going down', 'UP': 'Going up' }[action];
    diagram.actionText.text(actionLabel);
}


/* Control the diagram by letting the AI agent choose the action. This
   controller is simple. Every STEP_TIME_MS milliseconds choose an
   action, simulate the action in the world, and draw the action on
   the page. */

const STEP_TIME_MS = 2500;
function makeAgentControlledDiagram() {
    let diagram = makeDiagram('#agent-controlled-diagram svg');

    function update() {
        /*    
         let location = diagram.world.location;
            let percept = diagram.world.floors[location].dirty;
            let action = reflexVacuumAgent(diagram.world);
            diagram.world.simulate(action);
            renderWorld(diagram);
            renderAgentPercept(diagram, percept);
            renderAgentAction(diagram, action);
        */
        let location = diagram.world.location;
        console.log(location);
        let percept = diagram.world.floors[location].dirty;
        console.log(percept);
        let action = reflexVacuumAgent(diagram.world);
        console.log(action);
        diagram.world.simulate(action);
        console.log(diagram.world.simulate(action));
        renderWorld(diagram);
        renderAgentPercept(diagram, percept);
        renderAgentAction(diagram, action);

        randomState();
    }

    function randomState() {
        if (AUTO_RANDOM_STATE) {
            let max = 3, min = 0;
            let state = Math.floor(Math.random() * (max - min + 1)) + min;
            let floorNumber = Math.floor(Math.random() * (max - min + 1)) + min;
            if (floorNumber != diagram.world.location) {
                if (state % 2 == 0) {
                    if (diagram.world.markFloorDirty(floorNumber)) {
                        diagram.floors[floorNumber].attr('class', 'dirty floor');
                    }
                }
                else {
                    if (diagram.world.markFloorWet(floorNumber)) {
                        diagram.floors[floorNumber].attr('class', 'wet floor');
                    }
                }
            }
        }
    }

    update();
    setInterval(update, STEP_TIME_MS);
}


/* Control the diagram by letting the reader choose the action. This
   diagram is tricky.
 
   1. If there's an animation already playing and the reader chooses
      an action then *wait* for the animation to finish playing. While
      waiting the reader may choose a different action. Replace the
      previously chosen action with the new one. (An alternative
      design would be to queue up all the actions.)
   2. If there's not an animation already playing then when the reader
      chooses an action then run it right away, without waiting.
   3. Show the connection between the percept and the resulting action
      by highlighting the percepts in the accompanying table, pausing,
      and then highlighting the action.
*/
//function makeReaderControlledDiagram() {
//  let diagram = makeDiagram('#reader-controlled-diagram svg');
//  let nextAction = null;
//  let animating = false; // either false or a setTimeout intervalID

/*
function makeButton(action, label, x) {
    let button = d3.select('#reader-controlled-diagram .buttons')
        .append('button')
        .attr('class', 'btn btn-default')
        .style('position', 'absolute')
        .style('left', x + 'px')
        .style('width', '100px')
        .text(label)
        .on('click', () => {
            setAction(action);
            updateButtons();
        });
    button.action = action;
    return button;
}
 
 
let buttons = [
    makeButton('LEFT', 'Move left', 150),
    makeButton('SUCK', 'Vacuum', 300),
    makeButton('RIGHT', 'Move right', 450),
];
 
function updateButtons() {
    for (let button of buttons) {
        button.classed('btn-warning', button.action == nextAction);
    }
}
 
function setAction(action) {
    nextAction = action;
    if (!animating) { update(); }
}
 
function update() {
    let percept = diagram.world.floors[diagram.world.location].dirty;
    if (nextAction !== null) {
        diagram.world.simulate(nextAction);
        renderWorld(diagram);
        renderAgentPercept(diagram, percept);
        renderAgentAction(diagram, nextAction);
        nextAction = null;
        updateButtons();
        animating = setTimeout(update, STEP_TIME_MS);
    } else {
        animating = false;
        renderWorld(diagram);
        renderAgentPercept(diagram, percept);
        renderAgentAction(diagram, null);
    }
    
}
*/

//  }


/* Control the diagram by letting the reader choose the rules that
   the AI agent should follow. The animation flow is similar to the
   first agent controlled diagram but there is an additional table
   UI that lets the reader view the percepts and actions being followed
   as well as change the rules followed by the agent. */
/** 
    function makeTableControlledDiagram() {
     let diagram = makeDiagram('#table-controlled-diagram svg');
 
     function update() {
         let table = getRulesFromPage();
         let location = diagram.world.location;
         let percept = diagram.world.floors[location].dirty;
         let action = tableVacuumAgent(diagram.world, table);
         diagram.world.simulate(action);
         renderWorld(diagram);
         renderAgentPercept(diagram, percept);
         renderAgentAction(diagram, action);
         showPerceptAndAction(location, percept, action);
     }
     update();
     setInterval(update, STEP_TIME_MS);
     
     function getRulesFromPage() {
         let table = d3.select("#table-controlled-diagram table");
         let left_clean = table.select("[data-action=left-clean] select").node().value;
         let left_dirty = table.select("[data-action=left-dirty] select").node().value;
         let right_clean = table.select("[data-action=right-clean] select").node().value;
         let right_dirty = table.select("[data-action=right-dirty] select").node().value;
         return [[left_clean, left_dirty], [right_clean, right_dirty]];
     }
 
     function showPerceptAndAction(location, percept, action) {
         let locationMarker = location? 'right' : 'left';
         let perceptMarker = percept? 'dirty' : 'clean';
         
         d3.selectAll('#table-controlled-diagram th')
             .filter(function() {
                 let marker = d3.select(this).attr('data-input');
                 return marker == perceptMarker || marker == locationMarker;
             })
             .style('background-color', (d) => colors.perceptHighlight);
         
         d3.selectAll('#table-controlled-diagram td')
             .style('padding', '5px')
             .filter(function() {
                 let marker = d3.select(this).attr('data-action');
                 return marker == locationMarker + '-' + perceptMarker;
             })
             .transition().duration(0.05 * STEP_TIME_MS)
             .style('background-color', colors.actionHighlight)
             .transition().duration(0.9 * STEP_TIME_MS)
             .style('background-color', colors.actionBackground);
     }
 }
 */

 //////////random

const Y_SPACE = 120;
var AUTO_RANDOM_STATE = true;
var ALLOW_MANUAL_INPUT = false;

/* Control configurations */
function switchAutoRandomState() {
    AUTO_RANDOM_STATE = !AUTO_RANDOM_STATE;
}

function switchAllowManualInput() {
    ALLOW_MANUAL_INPUT = !ALLOW_MANUAL_INPUT;
}







$("body").keydown(function(e){
    let location;
    let nextLocation;
    switch (e.which) {
        case 13: // return 
            switchAutoRandomState();
            alert('RANDOM: ' + {true: 'on', false: 'off'}[AUTO_RANDOM_STATE]);
            break;
        case 32: // space
            switchAllowManualInput();
            alert('INPUT: ' + {true: 'on', false: 'off'}[ALLOW_MANUAL_INPUT]);
            break;
        case 37: // left
            location = diagram.world.location - 1;
            nextLocation = {0: null, 1: 0, 2: 3, 3: null}[location];
            if (nextLocation != null) {
                diagram.robot.style('transform', `translate(${xPosition(nextLocation)}px,${yPosition(nextLocation)-Y_SPACE}px)`);
            }
            break;
        case 38: // up
            location = diagram.world.location - 1;
            nextLocation = {0: 3, 1: 2, 2: null, 3: null}[location];
            if (nextLocation != null) {
                diagram.robot.style('transform', `translate(${xPosition(nextLocation)}px,${yPosition(nextLocation)-Y_SPACE}px)`);
            }
            break;
        case 39: // right
            location = diagram.world.location - 1;
            nextLocation = {0: 1, 1: null, 2: null, 3: 2}[location];
            if (nextLocation != null) {
                diagram.robot.style('transform', `translate(${xPosition(nextLocation)}px,${yPosition(nextLocation)-Y_SPACE}px)`);
            }
            break;
        case 40: // down
            location = diagram.world.location - 1;
            nextLocation = {0: null, 1: null, 2: 1, 3: 0}[location];
            if (nextLocation != null) {
                diagram.robot.style('transform', `translate(${xPosition(nextLocation)}px,${yPosition(nextLocation)-Y_SPACE}px)`);
            }
            break;
    }
});





makeAgentControlledDiagram();
   //makeReaderControlledDiagram();
  // makeTableControlledDiagram();