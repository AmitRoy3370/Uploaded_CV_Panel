const express = require('express');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'stored_cv'
});

db.connect(err => {
    if (err) throw err;
    console.log('Database connected!');
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('cv'), (req, res) => {
    const { name, email, phone } = req.body;

    console.log('name :- ' + name + ' phone :- ' + phone + ' email :- ' + email);

    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const fileData = req.file.buffer;

    db.query('INSERT INTO files (name, email, phone, file) VALUES (?, ?, ?, ?)', [name, email, phone, fileData], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('File uploaded!');
    });
});

app.get('/admin', (req, res) => {
    db.query('SELECT id, name, email, phone, created_at FROM files', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'settings.html')); // Ensure admin.html is in the same directory
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // Ensure admin.html is in the same directory
});

app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html')); // Ensure admin.html is in the same directory
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html')); // Ensure admin.html is in the same directory
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html')); // Ensure admin.html is in the same directory
});

app.get('*', (req, res) => {
    const knownRoutes = ['/dashboard', '/admin-panel', '/settings', '/login'];
    if (knownRoutes.includes(req.path)) {
        res.sendFile(path.join(__dirname, `${req.path.substring(1)}.html`)); // Serve the corresponding file
    } else {
        res.sendFile(path.join(__dirname, 'dashboard.html')); // Fallback to dashboard
    }
});

app.get('/download/:id', (req, res) => {
    const id = req.params.id;
    db.query('SELECT file FROM files WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0) {
            res.setHeader('Content-Disposition', 'attachment; filename="cv.pdf"');
            res.send(results[0].file);
        } else {
            res.status(404).send('File not found');
        }
    });
});

app.delete('/admin/delete/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM files WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('File deleted successfully');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
