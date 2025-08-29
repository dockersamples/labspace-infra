const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');
const vscode = require('vscode');

class SocketServer {
    constructor(config, packagePath) {
        this.pkgInfo = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        this.cfg = {
            socketPath: config.socketPath || '/etc/cmd-executor/socket/cmd-executor.sock',
            publicKeyPath: config.publicKeyPath || '/etc/cmd-executor/public-key/cmd-executor.pem',
            allowedAudiences: "cmd-executor",
            terminalName: config.terminalName || 'labspace',
            runInExistingTerminal: true,
            allowedCommandPattern: null,
        };

        this.app = express();
        this.app.use(express.json());

        this.app.get('/healthz', (req, res) => res.json({ ok: true }));
        this.app.get('/version', (req, res) => res.json({ name: this.pkgInfo.name, version: this.pkgInfo.version }));

        this.app.post('/command', async (req, res) => {
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
        });
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
}

module.exports = {
    ExpressSocketServer: SocketServer
};