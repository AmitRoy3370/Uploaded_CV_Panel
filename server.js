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
    const { name, email } = req.body;

    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    const fileData = req.file.buffer;

    db.query('INSERT INTO files (name, email, file) VALUES (?, ?, ?)', [name, email, fileData], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send('File uploaded!');
    });
});

app.get('/admin', (req, res) => {
    db.query('SELECT id, name, email FROM files', (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.get('/admin-panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html')); // Ensure admin.html is in the same directory
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
