const fs = require('fs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const vscode = require('vscode');

class SocketServer {
    constructor(config, packagePath, outputChannel) {
        this.pkgInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        this.cfg = {
            socketPath: config.socketPath || '/etc/labspace-support/socket/labspace.sock',
            publicKeyPath: config.publicKeyPath || '/etc/labspace-support/public-key/labspace.pem',
            allowedAudiences: "labspace",
            terminalName: config.terminalName || 'labspace',
            runInExistingTerminal: true,
            allowedCommandPattern: null,
        };

        this.app = express();
        this.app.use(express.json());
        this.outputChannel = outputChannel;

        this.app.get('/healthz', (req, res) => res.json({ ok: true }));
        this.app.get('/version', (req, res) => res.json({ name: this.pkgInfo.name, version: this.pkgInfo.version }));

        this.app.post('/command', this.#onCommandRequest.bind(this));

        /**
         * Save a file with provided content.
         * Expects JSON body with:
         * - filePath: string (relative to workspace root)
         * - body: string (file content)
         */
        this.app.post('/save', this.#onFileSaveRequest.bind(this));

        /**
         * Open a file in the editor, optionally at a specific line.
         * Expects JSON body with:
         * - filePath: string (relative to workspace root)
         * - line: integer (optional, 1-based line number)
         */
        this.app.post("/open", this.#onFileOpenRequest.bind(this));
    }

    start() {
        const sock = this.cfg.socketPath;
        try { if (fs.existsSync(sock)) fs.unlinkSync(sock); } catch {}

        this.server = this.app.listen(sock, () => {
            try { fs.chmodSync(sock, 0o600); } catch {}
            console.log('Lab Runner Express socket listening on', sock);
        });
    }

    dispose() {
        if (this.server) {
            this.server.close();
            this.server = undefined;
        }
        try { if (fs.existsSync(this.cfg.socketPath)) fs.unlinkSync(this.cfg.socketPath); } catch {}
    }

    async #onCommandRequest (req, res) {
        try {
            const token = req.body?.token;
            if (!token) throw new Error('missing token');
            
            const pubKey = fs.readFileSync(this.cfg.publicKeyPath, 'utf8');
            const payload = jwt.verify(token, pubKey, {
                algorithms: ['RS256', 'ES256'],
                audience: this.cfg.allowedAud
            });

            const cmd = payload.cmd;
            if (!cmd || typeof cmd !== 'string') throw new Error('missing cmd claim');
            if (this.cfg.allowedCommandPattern && !new RegExp(this.cfg.allowedCommandPattern).test(cmd)) {
                throw new Error('command rejected by allowedCommandPattern');
            }

            const term = await this.#ensureTerminal(payload.cwd, payload.terminalId);
            term.sendText(cmd, true);
            res.json({ ok: true, ran: cmd });
        } catch (err) {
            res.status(400).json({ ok: false, error: err?.message || String(err) });
        }
    }

    async #onFileSaveRequest(req, res) {
        this.outputChannel.appendLine(`/save request: ${JSON.stringify(req.body)}`);
        
        const { filePath, body } = req.body || {};
        if (!filePath) {
            return res.status(400).json({ ok: false, error: 'Missing required filePath' });
        }
        
        try {
            const absolutePath = this.#getAbsolutePath(filePath);
            fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
            fs.writeFileSync(absolutePath, body || '', 'utf8');
            return res.json({ ok: true });
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to save file: ${err?.message || String(err)}`);
            return res.status(500).json({ ok: false, error: 'failed to save file' });
        }
    }

    async #onFileOpenRequest (req, res) {
        this.outputChannel.appendLine(`/open request: ${JSON.stringify(req.body)}`);
        
        const { filePath, line } = req.body || {};
        if (!filePath) {
            return res.status(400).json({ ok: false, error: 'Missing required filePath' });
        }
        
        try {
            const absolutePath = this.#getAbsolutePath(filePath);
            if (!fs.existsSync(absolutePath)) {
                return res.status(404).json({ ok: false, error: `Cannot open file ${absolutePath}, as it does not exist` });
            }

            const fileUri = vscode.Uri.file(absolutePath);

            const doc = await vscode.workspace.openTextDocument(fileUri);
            const editor = await vscode.window.showTextDocument(doc, { preview: false });
            if (line && Number.isInteger(line) && line > 0 && line <= doc.lineCount) {
                const lineIndex = line - 1;
                const range = new vscode.Range(lineIndex, 0, lineIndex, 0);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
                editor.selection = new vscode.Selection(range.start, range.start);
            }
            res.json({ success: true });
        } catch (err) {
            vscode.window.showErrorMessage(`Failed to open file: ${err?.message || String(err)}`);
            return res.status(500).json({ ok: false, error: 'failed to open file' });
        }
    }

    async #ensureTerminal(cwd, requestedTerminalName = null) {
        if (requestedTerminalName) {
            const existing = vscode.window.terminals.find(t => t.name === requestedTerminalName);
            if (existing) {
                existing.show(true);
                if (cwd) existing.sendText(`cd ${this.#escapePath(cwd)}`, true);
                return existing;
            }

            const term = vscode.window.createTerminal({ name: requestedTerminalName, cwd });
            this.term = term;
            term.show(true);
            return term;
        }

        if (vscode.window.activeTerminal) {
            return vscode.window.activeTerminal;
        }

        const term = vscode.window.createTerminal({ name: this.cfg.terminalName, cwd });
        this.term = term;
        term.show(true);

        return term;
    }

    #gcTerminals() {
        const candidates = vscode.window.terminals.filter(t => t.name === this.cfg.terminalName);
        for (let i = 0; i < candidates.length - 1; i++) {
            try { candidates[i].dispose(); } catch {}
        }
    }

    #escapePath(p) {
        return `'${p.replace(/'/g, "'\\''")}'`;
    }
    
    /**
     * Get an absolute path for the provided file path.
     * If the path starts with ~, it is expanded to the user's home directory.
     * Otherwise, it is treated as relative to the workspace root.
     * @param {string} filePath The file path to convert
     * @returns The absolute file path
     */
    #getAbsolutePath(filePath) {
        if (filePath.startsWith("~")) {
            const homeDir = process.env.HOME || process.env.USERPROFILE || '/';
            return path.join(homeDir, filePath.slice(1));
        }
        return path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '/', filePath);
    }
}

module.exports = {
    ExpressSocketServer: SocketServer
};