const User = require('../../models/User');
const UserSession = require('../../models/UserSession');

module.exports = (app) => {
    // app.get('/api/counters', (req, res, next) => {
    //   Counter.find()
    //     .exec()
    //     .then((counter) => res.json(counter))
    //     .catch((err) => next(err));
    // });

    // app.post('/api/counters', function (req, res, next) {
    //   const counter = new Counter();

    //   counter.save()
    //     .then(() => res.json(counter))
    //     .catch((err) => next(err));
    // });


    /*
    *
    * Sign Up
    */

    app.post('/api/account/signup', (req, res, next) => {
        const { body } = req;
        const {
            firstName,
            lastName,
            password
        } = body;
        let {
            email,
        } = body;

        if (!firstName) {
            return res.end({
                success: false,
                message: 'Error: First Name cannot be blank.'
            });
        }

        if (!lastName) {
            return res.end({
                success: false,
                message: 'Error: Last Name cannot be blank.'
            });
        }

        if (!email) {
            return res.end({
                success: false,
                message: 'Error: Email cannot be blank.'
            });
        }

        if (!password) {
            return res.end({
                success: false,
                message: 'Error: Password cannot be blank.'
            });
        }

        email = email.toLowerCase();

        // Verify Email Does not exist then save
        User.find({
            email: email
        }, (err, previousUsers) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error: Server Error"
                });
            } else if (previousUsers.length > 0) {
                return res.send({
                    success: false,
                    message: "Error: Account Already Existed"
                });
            }

            // Save User
            const newUser = new User();
            newUser.email = email;
            newUser.firstName = firstName;
            newUser.lastName = lastName;
            newUser.password = newUser.generateHash(password);
            newUser.save().then(item => {
                res.send({ success: true, message: "Signed Up" });
            }).catch(err => {
                res.status(400).send({ sucess: false, message: "Error: Server Error" })
            })
        });
    });

    app.post('/api/account/signin', (req, res, next) => {
        const { body } = req;
        const {
            password
        } = body;
        let {
            email,
        } = body;

        if (!email) {
            return res.end({
                success: false,
                message: 'Error: Email cannot be blank.'
            });
        }

        if (!password) {
            return res.end({
                success: false,
                message: 'Error: Password cannot be blank.'
            });
        }

        email = email.toLowerCase();

        User.find({
            email: email
        }, (err, users) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error: Server Error"
                });
            }
            if (users.length != 1) {
                return res.send({
                    success: false,
                    message: "Error: Invalid"
                });
            }

            const user = users[0];
            if (!user.validPassword(password)) {
                return res.send({
                    success: false,
                    message: "Error: Invalid"
                });
            }

            // Current Session Go
            const userSession = new UserSession();
            userSession.userId = user._id;
            userSession.save((err, doc) => {
                if (err) {
                    return res.send({
                        success: false,
                        message: "Error: Server Error"
                    });
                }

                return res.send({
                    success: true,
                    message: "Valid Sign In",
                    token: doc._id
                })
            })
        })
    });

    app.get('/api/account/verify', (req, res, next) => {
        // Get token
        const { query } = req;
        const { token } = query;

        UserSession.find({
            _id: token,
            isDeleted: false
        }, (err, sessions) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error: Server Error"
                });
            }

            if (!sessions){
                return res.send({
                    success: false,
                    message: "Error: Invalid"
                });
            } else {
                return res.send({
                    success: true,
                    message: "Verified"
                });
            }
        });
    });

    app.get('/api/account/logout', (req, res, next) => {
        // Get token
        const { query } = req;
        const { token } = query;

        UserSession.findOneAndUpdate({
            _id: token,
            isDeleted: false
        }, {
            $set:{isDeleted:true}
        },null, (err, sessions) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error: Server Error"
                });
            }
            return res.send({
                success: true,
                message: "Good"
            });
        });
    });
};