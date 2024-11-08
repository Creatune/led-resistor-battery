let selectedComponent = null;
const connections = []
function createConnection(comp1, comp2) {
    if (!comp1 || !comp2) {
        console.error("One or both components are null:", { comp1, comp2 });
        return;
    }
    console.log(connections);
    if (isDirectlyConnected(comp1, comp2)) {
        console.log("Connection already exists");
        return;
    } else {
        console.log("no direct connection");
    }
    if(comp1.getAttribute('data-name') == comp2.getAttribute('data-name')) {
        console.log("self loops not allowed");
        return;
    }
    const svg = document.getElementById('connections');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', '2');
    line.style.pointerEvents = 'auto';
    line.style.cursor = 'pointer';
    line.setAttribute('z-index', 1);
    line.addEventListener('click', () => {
        console.log("Line clicked!");
        removeConnection(comp1, comp2, line);
    });
    svg.appendChild(line);
    const connection = { comp1, comp2, line };
    connections.push(connection);
    updateConnection(connection);
    checkAndUpdateLED();
    return connection;
}
function updateConnection(connection) {
    const rect1 = connection.comp1.getBoundingClientRect();
    const rect2 = connection.comp2.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const x1 = rect1.left + rect1.width / 2 - canvasRect.left;
    const y1 = rect1.top + rect1.height / 2 - canvasRect.top;
    const x2 = rect2.left + rect2.width / 2 - canvasRect.left;
    const y2 = rect2.top + rect2.height / 2 - canvasRect.top;
    connection.line.setAttribute('x1', x1);
    connection.line.setAttribute('y1', y1);
    connection.line.setAttribute('x2', x2);
    connection.line.setAttribute('y2', y2);
}
function updateAllConnections() {
    connections.forEach(updateConnection);
}
function handleComponentClick(event) {
    const component = event.currentTarget;
    if(selectedComponent === null) {
        selectedComponent = component;
        component.style.border = '2px solid blue';
    } else {
        createConnection(selectedComponent, component);
        selectedComponent.style.border = '';
        selectedComponent = null;
    }
}
function checkAndUpdateLED() {
    const led = document.getElementById('led');
    const battery = document.getElementById('battery');
    const resistor = document.getElementById('resistor');
    /*if(isConnected(battery, led)) {
        if(isDirectlyConnected(battery, led)) {
            led.style.backgroundColor = 'yellow';
            led.style.color = 'black';
        } else {
            led.style.backgroundColor = '#CCCC00';
            led.style.color = 'black';
        }
    } else {
        led.style.backgroundColor = 'black';
        led.style.color = 'white';
    }*/
    if(isConnected(battery, led)) {
        if(isConnected(led, resistor)) {
            led.style.backgroundColor = '#CCCC00';
            led.style.color = 'black';
        } else {
            led.style.backgroundColor = 'yellow';
            led.style.color = 'black';
        }
    } else {
        led.style.backgroundColor = 'black';
        led.style.color = 'white';
    }
}
function isDirectlyConnected(comp1, comp2) {
    const name1 = comp1.getAttribute('data-name');
    const name2 = comp2.getAttribute('data-name');
    return connections.some(connection => {
        const connectionName1 = connection.comp1.getAttribute('data-name');
        const connectionName2 = connection.comp2.getAttribute('data-name');
        return (connectionName1 === name1 && connectionName2 === name2) ||
               (connectionName1 === name2 && connectionName2 === name1);
    });
}
/*function isIndirectlyConnected(start, target, middle) {
    return isDirectlyConnected(start, middle) && isDirectlyConnected(middle, target);
}*/
function removeConnection(comp1, comp2, line) {
    const index = connections.findIndex(connection => {
        return (connection.comp1 === comp1 && connection.comp2 === comp2) ||
        (connection.comp1 === comp2 && connection.comp2 === comp1)
    });
    if(index > -1) {
        connections.splice(index, 1);
        line.remove();
        checkAndUpdateLED();
        console.log("connection removed");
    }
}
document.querySelectorAll('.component').forEach(component => {
    component.addEventListener('click', handleComponentClick);
});
function isConnected(start, target) {
    // bfs shit
    const visited = new Set();
    const queue = [start];
    while(queue.length > 0) {
        const current = queue.shift();
        if(current == target) {
            return true;
        }
        visited.add(current);
        connections.forEach(connection => {
            if(connection.comp1 == current && !visited.has(connection.comp2)) {
                queue.push(connection.comp2);
            } else if(connection.comp2 === current && !visited.has(connection.comp1)) {
                queue.push(connection.comp1);
            }
        });
    }
    return false;
}
interact('.component').draggable({
    modifiers: [
        interact.modifiers.restrictRect({
            restriction: '#canvas',
            endOnly: true
        }),
        interact.modifiers.snap({
            targets: [
                interact.snappers.grid({ x: 20, y: 20 })
            ],
            range: Infinity,
            relativePoints: [{ x: 0.5, y: 0.5 }]
        })
    ],
    inertia: true,
    listeners: {
        move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
            updateAllConnections();
            checkAndUpdateLED();
        }
    }
});
// createConnection(document.getElementById('led'), document.getElementById('resistor'));
// createConnection(document.getElementById('battery'), document.getElementById('resistor'));
