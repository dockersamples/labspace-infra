const vscode = require('vscode');
const { ExpressSocketServer } = require("./socketServer.js");
const { HostPortRepublisher } = require("./hostPortRepublisher.js");

let socketServer;
let hostPortRepublisher;
let logChannel;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    logChannel = vscode.window.createOutputChannel("Labspace Support");

    startSocketServer(context, logChannel);
    startHostPortRepublisher(logChannel);

    context.subscriptions.push(
        vscode.commands.registerCommand('labspace-support.restartCommandServer', () => {
            startSocketServer(context, logChannel);
            vscode.window.showInformationMessage('Labspace Support: restart complete');
        }),
        { dispose: stopSocketServer }
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('labspace-support.restartPortRepublisher', () => {
            startHostPortRepublisher(logChannel);
            vscode.window.showInformationMessage('Labspace Support: restart complete');
        }),
        { dispose: stopPortRepublisher }
    );
}

function startSocketServer(context, logChannel) {
    stopSocketServer();
    socketServer = new ExpressSocketServer(
        vscode.workspace.getConfiguration('labspace-support'), 
        context.asAbsolutePath('package.json'),
        logChannel
    );
    socketServer.start();
}

function stopSocketServer() {
    if (socketServer) {
        socketServer.dispose();
        socketServer = undefined;
    }
}

function startHostPortRepublisher(logChannel) {
    hostPortRepublisher = new HostPortRepublisher(
        process.env.LABEL_FILTER ? process.env.LABEL_FILTER.split(',') : ["demo=app"],
        logChannel
    );
    hostPortRepublisher.start();
}

function stopPortRepublisher() {
    if (hostPortRepublisher) {
        hostPortRepublisher.close();
        hostPortRepublisher = undefined;
    }
}

// This method is called when the extension is deactivated
function deactivate() {
	stopSocketServer();
    stopPortRepublisher();
}

module.exports = {
	activate,
	deactivate
}
