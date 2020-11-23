const { query } = require('express');
const e = require('express');
const Metadata = require('../../models/Metadata.js');

module.exports = (app) => {
    // retrieves random 500 books from mongodb or search
    app.get('/api/book/getallbooks', (req, res, next) => {
        let query = req.query.query
        // Metadata.aggregate([{ $sample: { size: 500 } }])
        // Metadata.find().limit(500)
        if (query == "all") {
            Metadata.find().sort({$natural:-1}).limit(500)
                .then(books => {res.status(200).json(books)})
                .catch(err => res.status(400).json('Error: ' + err))
        } else {
            Metadata.find({
                "$or": [
                    {"asin": query}, 
                    {"title": query},
                    {"author": query}
                ]
            }).then(books => res.status(200).json(books))
            .catch(err => res.status(400).json('Error: ' + err))
        }
    })

    // filters queries 
<<<<<<< HEAD
    app.post('/api/book/applyfilter', (req, res, next) => {
        const filter = req.body.filter; 
=======
    app.get('/api/book/applyfilter', (req, res, next) => {
        const filter = req.query.filter 
>>>>>>> 8e82cb86a24a0ad24f1cbbe5bf2ee269f0fef4b2
        Metadata.find({
            "categories": {
              "$elemMatch": {
                "$elemMatch": {
                  "$in": filter
                }
              }
            }
          }).sort({$natural:-1}).limit(500)
                .then(books => res.status(200).json(books))
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
                return res.status(404).send({
                    success: false,
                    message: "Error: Server Error"
                });
            }
            else if (books.length == 0) {
                return res.status(400).send({
                    success: false, 
                    message: "Error: book does not exist"
            })
            } else {
                const book = books[0];
                const metaData = new Metadata();
                metaData.asin = book.asin;
                return res.status(200).send({
                    success: true,
                    message: "Book found",
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
            title,
            description,
            price,
            imUrl,
            related,
            categories,
        } = body;

        if (!asin) {
            return res.status(400).end({
                success: false,
                message: 'Error: Asin cannot be blank.'
            });
        }

        if(!title) {
            return res.status(400).end({
                success: false,
                message: 'Error: title cannot be blank.'
            });
        }

        if (!description) {
            return res.staus(400).end({
                success: false,
                message: 'Error: Description cannot be blank.'
            });
        }

        if (!price) {
            return res.status(400).end({
                success: false,
                message: 'Error: Price cannot be blank.'
            });
        }

        if (!imUrl) {
            return res.status(400).end({
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
                return res.status(404).send({
                    success: false,
                    message: "Error: Server Error"
                });
            } else if (previousBooks.length > 0) {
                return res.status(400).send({
                    success: false,
                    message: "Error: Book Already Exist"
                });
            }

            // Save Book
            const newMetaData = new Metadata();
            newMetaData.asin = asin;
            newMetaData.title = title;
            newMetaData.description = description;
            newMetaData.price = price;
            newMetaData.imUrl = imUrl;
            newMetaData.related = related;
            newMetaData.categories = categories;
            newMetaData.save().then(item => {
                res.status(200).send({ success: true, message: "Book Added" });
            }).catch(err => {
                res.status(400).send({ sucess: false, message: "Error: Server Error" })
            })
        });
    });


};