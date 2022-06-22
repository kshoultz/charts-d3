const path = require('path');
const express = require('express');

const {config} = require('./config/config');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT;

const app = express();
app.use(express.static(publicPath)); 
app.listen(port, () => {
    console.log(`Started on port ${port}.`);
});

module.exports = {app};