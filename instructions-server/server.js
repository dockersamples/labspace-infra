const express = require('express');
const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
    const contentDir = '/app/content';
    if (fs.existsSync(contentDir)) {
        const files = fs.readdirSync(contentDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));
        res.json({ files: mdFiles });
    } else {
        res.json({ files: [], message: 'Content directory not found' });
    }
});

app.get('/content/:file', (req, res) => {
    const file = path.join('/app/content', req.params.file);
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const html = marked(content);
        res.json({ html });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.listen(3000, () => {
    console.log('Instructions server running on port 3000');
});
