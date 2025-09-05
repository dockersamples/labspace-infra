const Docker = require("dockerode");
const child_process = require("child_process");
const os = require('os');

class HostPortRepublisher {
    constructor(labelFilter = ["demo=app"], logChannel) {
        this.docker = new Docker();
        this.labelFilterExpr = {
            label: labelFilter
        }

        this.tearDowns = {};
        this.eventStream = null;
        this.logChannel = logChannel;
    }

    start() {
        this.logChannel.appendLine("Starting host port republisher using label filter: " + JSON.stringify(this.labelFilterExpr));
        this.docker.listContainers({ filters: this.labelFilterExpr }, (err, containers) => {
            if (err) {
                this.logChannel.appendLine("Error listing Docker containers: " + err.message);
                return;
            }
            containers.forEach(container => {
                this.#onContainerStart(container.Id)
                    .catch(err => {
                        this.logChannel.appendLine("Error handling container start: " + err.message);
                    });
            });
        });

        this.docker.getEvents({ filters: { event: ["start", "die"], ...this.labelFilterExpr } }, (err, stream) => {
            if (err) {
                this.logChannel.appendLine("Error connecting to Docker events: " + err.message);
                return;
            }

            this.eventStream = stream;

            this.logChannel.appendLine("Listening for events");

            this.eventStream.on('data', (chunk) => {
                try {
                    const event = JSON.parse(chunk.toString());
                    if (event.Type === 'container') {
                        if (event.Action === 'start')
                            this.#onContainerStart(event.id)
                                .catch(err => this.logChannel.appendLine('Error handling container start: ' + err.message));
                        else if (event.Action === 'die')
                            this.#onContainerDie(event.id)
                                .catch(err => this.logChannel.appendLine('Error handling container die: ' + err.message));
                    }
                } catch (e) {
                    this.logChannel.appendLine('Error handling Docker event: ' + e.message);
                }
            });

            this.eventStream.on('error', (err) => {
                this.logChannel.appendLine('Docker event stream error: ' + err.message);
            });

            this.eventStream.on("close", () => {
                this.logChannel.appendLine("Docker event stream closed");
                this.eventStream = null;
            });
        });
    }

    close() {
        if (this.eventStream) {
            this.eventStream.destroy();
            this.eventStream = null;
        }
    }

    async #onContainerStart(containerId) {
        this.logChannel.appendLine(`Handling start of container ${containerId}`);

        let containerData = await this.docker.getContainer(containerId).inspect();
        if (!containerData) {
            this.logChannel.appendLine(`No data found for container ${containerId}`);
            return;
        }

        const { networkName, ipAddress } = await this.#determineNetworkConnectivity(containerData);

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

            const socatProcesses = [];

            ports.forEach(port => {
                const { hostPort, containerPort } = port;

                this.logChannel.appendLine(`Setting up port forwarding: host port ${hostPort} -> container ${ipAddress}:${containerPort}`);

                const proc = child_process.spawn('socat', [`TCP-LISTEN:${hostPort},fork,reuseaddr`, `TCP:${ipAddress}:${containerPort}`], {
                    stdio: 'inherit'
                });
                socatProcesses.push(proc);

                proc.on('exit', (code, signal) => {
                    this.logChannel.appendLine(`socat process for container ${containerData.Id} on port ${hostPort} exited with code ${code}, signal ${signal}`);
                    socatProcesses.splice(socatProcesses.indexOf(proc), 1);
                });
            });

            // Store teardown function for this container
            this.tearDowns[containerData.Id] = async () => {
                this.logChannel.appendLine(`Tearing down resources for container ${containerData.Id}`);
                socatProcesses.forEach(proc => {
                    if (!proc.killed) {
                        if (!proc.kill("SIGTERM")) {
                            this.logChannel.appendLine(`Failed to kill socat process ${proc.pid} for container ${containerData.Id}`);
                        }
                    }
                });

                delete this.tearDowns[containerData.Id];
                this.logChannel.appendLine(`Resources removed for container ${containerData.Id}`);
            };
        }
    }

    async #onContainerDie(containerId) {
        this.logChannel.appendLine(`Handling death of container ${containerId}`);

        if (this.tearDowns[containerId]) {
            await this.tearDowns[containerId]();
        }
    }

    async #determineNetworkConnectivity(containerData) {
        let selfInfo = await this.docker.getContainer(os.hostname()).inspect();
        let selfNetworkNames = Object.keys(selfInfo.NetworkSettings.Networks || {})
            .filter(name => name !== 'bridge');

        if (selfNetworkNames.length === 0) {
            this.logChannel.appendLine("No non-bridge networks found for self container, creating a new network.");
            const selfNetwork = await this.docker.createNetwork({ Name: "host-proxy-watcher-" + os.hostname() });
            await selfNetwork.connect({ Container: selfInfo.Id });

            selfInfo = await this.docker.getContainer(os.hostname()).inspect();
            selfNetworkNames = Object.keys(selfInfo.NetworkSettings.Networks || {})
                .filter(name => name !== 'bridge');
        }

        if (Object.keys(containerData.NetworkSettings.Networks).indexOf(selfNetworkNames[0]) === -1) {
            this.logChannel.appendLine(`Connecting ${containerData.Id.substring(0, 8)} to the desired network (${selfNetworkNames[0]})`);
            await this.docker.getNetwork(selfNetworkNames[0]).connect({
                Container: containerData.Id,
            });

            const updatedContainerData = await this.docker.getContainer(containerData.Id).inspect();
            containerData.NetworkSettings = updatedContainerData.NetworkSettings;
        } else {
            this.logChannel.appendLine(`Container ${containerData.Id.substring(0, 8)} is already connected to the desired network (${selfNetworkNames[0]}). No change required.`);
        }

        return {
            networkName: selfNetworkNames[0],
            ipAddress: containerData.NetworkSettings.Networks[selfNetworkNames[0]].IPAddress
        };
    }
}

module.exports = {
    HostPortRepublisher
};