const express = require('express');
const fs = require('fs');
const app = express();
const port = 3001;
app.use(express.json());
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile('/index.html');
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});