const express = require("express")
const router = express.Router()
const axios = require("axios")


router.get("/:url/:url_route/:root/:slice", (req, res) => {
    const { url, url_route, root, slice } = req.params
    console.log(`http://${url}/${url_route}/${root}/${slice}`)

    axios
        .get(`http://${url}/${url_route}/${root}/${slice}`)
        .then(r => {
            console.log("return")
            console.log(r.data)

            res.send({
                id: slice,
                res: r.data.res,
                fileName: r.data.filePath
            })
        })
        .catch(error => {
            console.error(error)
        })
        // res.redirect(`http://${url}/challenge/downloadFile/${r.data.filePath}`)

})

module.exports = router
