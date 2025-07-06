const Docker = require('dockerode');
const child_process = require('child_process');
const { determineNetworkConnectivity } = require('./util');

const docker = new Docker();
const labelFilterExpr = {
  label: (process.env.LABEL_FILTER || "demo=app").split(','),
};

const PORT_OFFSET = parseInt(process.env.PORT_OFFSET || '0', 10);

const tearDowns = {};

async function onContainerStart(containerId) {
  let containerData = await docker.getContainer(containerId).inspect();
  if (!containerData)
    return;

  const {networkName, ipAddress} = await determineNetworkConnectivity(docker, containerData);

  if (containerData.NetworkSettings && containerData.NetworkSettings.Ports) {
    const ports = Object.keys(containerData.NetworkSettings.Ports)
      .filter(portKey => containerData.NetworkSettings.Ports[portKey] && 
        containerData.NetworkSettings.Ports[portKey][0] && 
        containerData.NetworkSettings.Ports[portKey][0].HostPort)
      .map(portKey => ({ 
        containerPort: parseInt(portKey.split('/')[0], 10), 
        hostPort: parseInt(containerData.NetworkSettings.Ports[portKey][0].HostPort),
      }))
      .filter(port => port.hostPort && port.containerPort);

    console.log("Found ports for container:", containerData.Id, ports);

    const socatProcs = [];

    ports.forEach(port => {
      const hostPort = port.hostPort + PORT_OFFSET;
      const containerPort = port.containerPort;

      console.log(`Setting up port forwarding: host port ${hostPort} -> container ${ipAddress}:${containerPort}`);

      const proc = child_process.spawn('socat', [`TCP-LISTEN:${hostPort},fork,reuseaddr`, `TCP:${ipAddress}:${containerPort}`], {
        stdio: 'inherit'
      });
      socatProcs.push(proc);

      proc.on('exit', (code, signal) => {
        console.log(`socat process for container ${containerData.Id} on port ${hostPort} exited with code ${code}, signal ${signal}`);
        socatProcs.splice(socatProcs.indexOf(proc), 1);
      });
    });
    
    // Store teardown function for this container
    tearDowns[containerData.Id] = async () => {
      console.log(`Tearing down resources for container ${containerData.Id}`);
      socatProcs.forEach(proc => {
        if (!proc.killed) {
          if (!proc.kill("SIGTERM")) {
            console.error(`Failed to kill socat process ${proc.pid} for container ${containerData.Id}`);
          }
        }
      });
      
      delete tearDowns[containerData.Id];
      console.log(`Resources removed for container ${containerData.Id}`);
    };
  }
}

async function onContainerDie(containerId) {
  const containerData = await docker.getContainer(containerId).inspect();
  if (!containerData)
    return;
  
  if (tearDowns[containerData.Id]) {
    await tearDowns[containerData.Id]();
  }
}

docker.listContainers({ filters: labelFilterExpr }, (err, containers) => {
  if (err) {
    console.error('Error listing Docker containers:', err.message);
    process.exit(1);
  }

  containers.forEach(containerInfo => {
    onContainerStart(containerInfo.Id).catch(err => {
      console.error(`Error starting container ${containerInfo.Id}:`, err.message);
    });
  });
});

docker.getEvents({ filters: { event: ['start', 'die'], ...labelFilterExpr } }, (err, stream) => {
  if (err) {
    console.error('Error connecting to Docker events:', err.message);
    process.exit(1);
  }

  stream.on('data', (chunk) => {
    try {
      const event = JSON.parse(chunk.toString());
      if (event.Type === 'container') {
        if (event.Action === 'start')
          onContainerStart(event.id);
        else if (event.Action === 'die')
          onContainerDie(event.id);
      }
    } catch (e) {
      console.error('Error parsing Docker event:', e.message);
    }
  });

  stream.on('error', (err) => {
    console.error('Docker event stream error:', err.message);
  });
});

console.log('Watching for Docker container events...');

["SIGINT", "SIGTERM", "SIGUSR2"].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down...`);
    await Promise.all(Object.values(tearDowns).map(fn => fn()));
    process.exit(0);
  });
});
