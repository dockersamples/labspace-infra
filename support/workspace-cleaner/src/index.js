import Docker from 'dockerode';

const docker = new Docker();

const labelFilterExpr = {
  label: (process.env.LABEL_FILTER || "demo=app").split(','),
};

async function cleanup() {
    const containersToRemove = await docker.listContainers({ filters: labelFilterExpr });;

    if (containersToRemove.length > 0) {
        console.log(`Found ${containersToRemove.length} containers to remove.`);
        for (const containerInfo of containersToRemove) {
            const container = docker.getContainer(containerInfo.Id);
            try {
                await container.stop();
                await container.remove();
                console.log(`Removed container ${containerInfo.Id}`);
            } catch (error) {
                console.error(`Error removing container ${containerInfo.Id}:`, error.message);
            }
        }
    }

    const volumesToRemove = await docker.listVolumes({ filters: labelFilterExpr });
    if (volumesToRemove.length > 0) {
        console.log(`Found ${volumesToRemove.length} volumes to remove.`);
        for (const volumeInfo of volumesToRemove.Volumes) {
            const volume = docker.getVolume(volumeInfo.Name);
            try {
                await volume.remove();
                console.log(`Removed volume ${volumeInfo.Name}`);
            } catch (error) {
                console.error(`Error removing volume ${volumeInfo.Name}:`, error.message);
            }
        }
    } else {
        console.log("No volumes to remove.");
    }

    const networksToRemove = await docker.listNetworks({ filters: labelFilterExpr });
    if (networksToRemove.length > 0) {
        console.log(`Found ${networksToRemove.length} networks to remove.`);
        for (const networkInfo of networksToRemove) {
            const network = docker.getNetwork(networkInfo.Id);
            try {
                await network.remove();
                console.log(`Removed network ${networkInfo.Name}`);
            } catch (error) {
                console.error(`Error removing network ${networkInfo.Name}:`, error.message);
            }
        }
    } else {
        console.log("No networks to remove.");
    }

    console.log("Cleanup completed.");
}

async function main() {
    while (true) {
        await (new Promise(resolve => setTimeout(resolve, 60000)));
    }
}

main();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, cleaning up...`);
    await cleanup();
    process.exit(0);
  });
});