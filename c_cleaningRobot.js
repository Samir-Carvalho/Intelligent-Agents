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
//Crie um objeto de diagrama que inclua o mundo (model) e o svg elementos(view)

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

/*
Funções de renderização lidas do estado do mundo (diagram.world)
   e escreva para o estado do diagrama (diagram.*). Para a maioria dos diagramas
   precisamos apenas de uma função de renderização. Para o exemplo do aspirador de pó, para
   suportam os diferentes estilos (orientado pelo leitor, orientado pelo agente) e o
   animação (o agente percebe o mundo, então faz uma pausa, então o agente age)
   dividiu a função de renderização em vários.
*/

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
//ação do agente de renderização
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
/* Controle o diagrama deixando o agente de IA escolher a ação. Este
   controlador é simples. A cada STEP_TIME_MS milissegundos, escolha um
   ação, simular a ação no mundo e desenhar a ação no a página. 
*/

const STEP_TIME_MS = 2500;
function makeAgentControlledDiagram() { // controlador do agente
    let diagram = makeDiagram('#agent-controlled-diagram svg');

    function update() {
        let location = diagram.world.location;
        let percept = diagram.world.floors[location].dirty;
        let action = reflexVacuumAgent(diagram.world);
        diagram.world.simulate(action);
        renderWorld(diagram);
        renderAgentPercept(diagram, percept);
        renderAgentAction(diagram, action);

        dirtyRandomState();
    }
    //Estado aleatorio para adicionar a sujeira
    function dirtyRandomState() {
        let y = Math.floor(Math.random() * 4); // => retornar o maior inteiro menor ou igual ao seu argumento numérico.
        if (y != diagram.world.location) {
            if (diagram.world.markFloorDirty(y)) {
                diagram.floors[y].attr('class', 'dirty floor');
            }
        }
    }

    update();
    setInterval(update, STEP_TIME_MS);
}


makeAgentControlledDiagram();