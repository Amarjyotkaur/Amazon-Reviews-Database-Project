const e = require('express');
const Metadata = require('../../models/Metadata.js');

module.exports = (app) => {

    // retrieves random 500 books from mongodb 
    app.get('/api/book/getallbooks', (req, res, next) => {
<<<<<<< HEAD
        Metadata.find().limit(500)
=======
        // Metadata.aggregate([{ $sample: { size: 500 } }])
        // Metadata.find().limit(500)
        Metadata.find().sort({$natural:-1}).limit(500)
>>>>>>> af7b9d9f29f08572ce0bcba9ab50b944349aaed4
            .then(books => res.json(books))
            .catch(err => res.status(400).json('Error: ' + err))
    })

    // Retrieve a book by asin
    app.get('/api/book/getbook', (req, res, next) => {
        const { query } = req;
        const { asin } = query;

        Metadata.find({
            asin: asin
        }, (err, books) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error: Server Error"
                });
            }
            const book = books[0];
            
            const metaData = new Metadata();
            metaData.asin = book.asin;


            if (!book) {
                return res.send({
                    success: false,
                    message: "Error: Invalid"
                });
            } else {
                return res.send({
                    success: true,
                    message: "Verified",
                    description: book.description,
                    price: book.price,
                    imUrl: book.imUrl,
                    related: book.related,
                    categories: book.categories,
                });
            }
        });
    });


    // Add a new book
    app.post('/api/book/addbook', (req, res, next) => {
        const { body } = req;
        let {
            asin,
            description,
            price,
            imUrl,
            related,
            categories,
        } = body;

        if (!asin) {
            return res.end({
                success: false,
                message: 'Error: Asin cannot be blank.'
            });
        }

        if (!description) {
            return res.end({
                success: false,
                message: 'Error: Description cannot be blank.'
            });
        }

        if (!price) {
            return res.end({
                success: false,
                message: 'Error: Price cannot be blank.'
            });
        }

        if (!imUrl) {
            return res.end({
                success: false,
                message: 'Error: ImageURL cannot be blank.'
            });
        }

        // Related and catergories isit neccessary?

        // Verify book ASIN Does not exist then save
        Metadata.find({
            asin: asin
        }, (err, previousBooks) => {
            if (err) {
                return res.send({
                    success: false,
                    message: "Error: Server Error"
                });
            } else if (previousBooks.length > 0) {
                return res.send({
                    success: false,
                    message: "Error: Book Already Exist"
                });
            }

            // Save Book
            const newMetaData = new Metadata();
            newMetaData.asin = asin;
            newMetaData.description = description;
            newMetaData.price = price;
            newMetaData.imUrl = imUrl;
            newMetaData.related = related;
            newMetaData.categories = categories;
            newMetaData.save().then(item => {
                res.send({ success: true, message: "Book Added" });
            }).catch(err => {
                res.status(400).send({ sucess: false, message: "Error: Server Error" })
            })
        });
    });


};