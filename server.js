'use strict';

const log = console.log
const express = require('express')
const app = express();

app.use(express.static(__dirname + '/pub'))

app.get('/api/', (req, res) => {
    res.send('Test')
})

const port = process.env.PORT || 5000
app.listen(port, () => {
        log(`Server started on port ${port}...`)
})

