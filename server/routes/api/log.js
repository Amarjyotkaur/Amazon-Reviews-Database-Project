const LogSession = require('../../models/Logs')
const User = require('../../models/User');

module.exports = (app) => {
    app.post('/api/book/addlog/:id', (req, res) => {
        const userId = req.params.id 
        const datetime = req.body.datetime 
        const type = req.body.type 
        const response = req.body.response 
        const newLog = new LogSession({
            datetime,
            type,
            response
        })
        User.update(
            {_id: userId},
            {$addToSet: {logs: newLog}})
        .then(() => res.json('log added'))
        .catch(err => res.status(400).json('Error: ' + err))
    })
};