const express = require('express');
const app = express();

app.get('/api', (req, res) => {
    res.json({"fruits": ["apple", "banana", "orange"]});
});

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});