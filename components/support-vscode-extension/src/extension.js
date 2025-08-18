const vscode = require('vscode');
const { ExpressSocketServer } = require("./socketServer.js");

let server;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const start = () => {
        stop();
        server = new ExpressSocketServer(
			vscode.workspace.getConfiguration('labRunner'), 
			context.asAbsolutePath('package.json')
		);
        server.start();
    };

    const stop = () => {
        if (server) {
            server.dispose();
            server = undefined;
        }
    };

    start();

    context.subscriptions.push(
        vscode.commands.registerCommand('labRunner.restartServer', () => {
            vscode.window.showInformationMessage('Lab Runner: restarting HTTP socket server...');
            start();
        }),
        { dispose: stop }
    );
}

// This method is called when your extension is deactivated
function deactivate() {
	if (server) {
        server.dispose();
        server = undefined;
    }
}

module.exports = {
	activate,
	deactivate
}
