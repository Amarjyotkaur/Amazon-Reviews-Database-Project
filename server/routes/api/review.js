const sql = require("../db/db.js");

module.exports = (app) => {
    // get reviews 50 for now -> need do pagination 
    // app.get('/getAllReviews', (req, res) => {
    //     sql.query(`select * from kindle_reviews limit 50`, (error, result) => {
    //         if (error) throw error;
    //         res.send(result);
    //     })
    // })

    // get book reviews of a particular book given asin
    app.get('/getBookReviews/:id', (req, res) => {
        sql.query(`select * from kindle_reviews where asin = '${req.params.id}'`, (error, result) => {
            if (error) throw error; 
            res.send(result)
        })
    })

    // delete book review given asin and reviewerID
    app.delete('/deleteBookReview', (req, res) => {
        const asin = req.body.asin 
        const reviewerID = req.body.reviewerID 
        sql.query(`delete from kindle_reviews where asin = '${asin}' and reviewerID = '${reviewerID}'`, (error, result) => {
            if (error) throw error;
            res.send(result)       
        })
    })

    // add book review given asin, helpful, overall, reviewText, reviewTime, reviewerID, reviewerName, summary, unixReviewTime
    app.post('/addReview', (req, res) => {
        const asin = req.body.asin 
        const helpful = req.body.helpful
        const overall = req.body.overall
        const reviewText = req.body.reviewText 
        const reviewTime = req.body.reviewTime 
        const reviewerID = req.body.reviewerID
        const reviewerName = req.body.reviewerName 
        const summary = req.body.summary
        const unixReviewTime = req.body.unixReviewTime

        sql.query(`insert into kindle_reviews values ('${asin}', '${helpful}', '${overall}', '${reviewText}', '${reviewTime}', '${reviewerID}', '${reviewerName}', '${summary}, '${unixReviewTime}')`, (error, result) => {
            if (error) throw error;
            res.send(result)       
        })
    })

    // update book review given reviewText, reviewTime, summary, unixReviewTime where asin and reviewerID 
    app.post('/updateReview', (req, res) => {
        const asin = req.body.asin 
        const reviewText = req.body.reviewText 
        const reviewTime = req.body.reviewTime 
        const reviewerID = req.body.reviewerID
        const summary = req.body.summary
        const unixReviewTime = req.body.unixReviewTime

        sql.query(`update kindle_reviews set reviewText = '${reviewText}', reviewTime = '${reviewTime}', summary = '${summary}', unixReviewTime = '${unixReviewTime}' where asin = '${asin}' and reviewerID = '${reviewerID}'`, (error, result) => {
            if (error) throw error;
            res.send(result)       
        })
    })
}