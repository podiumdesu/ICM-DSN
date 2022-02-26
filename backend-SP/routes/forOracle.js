const express = require("express")
const router = express.Router()

const fs = require("fs")
const path = require("path")
const crypto = require('crypto');

const HexSha256 = (a,b) => {
    return crypto.createHash('sha256').update(a,b).digest('hex')
}
router.get("/downloadPiece/:filePath", (req, res) => {
    const { filePath } = req.params

    res.sendFile(filePath, {
        root: "/home/ETS/Citamon/backend/upload/"
    }, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("sent~")
        }
    })
})
router.get("/download/:root", (req, res) => {
    const { root } = req.params

    const filePath = {
        "a295153fc6": "/home/ETS/Citamon/backend/upload/test.txt"
    }

    res.sendFile(filePath["a295153fc6"], {

    }, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log("sent~")
        }
    })
})
router.get("/:root/:slice", (req, res) => {
    const { root, slice } = req.params


    const filePath = {
        "a295153fc6": "./upload/test.txt"
    }

    const readStream = fs.createReadStream(filePath["a295153fc6"], { highWaterMark: 16 })
    const writerStream = fs.createWriteStream(`./upload/${root}-${slice}.txt`)

    const data = []
    const merkle = []
    readStream.on('data', function (chunk) {
        data.push(chunk)
        if (data.length == slice) {
            console.log(data[slice-1])
            writerStream.write(data[slice-1], 'utf-8')
            writerStream.end()
            writerStream.on('finish', () => { console.log(`Finish writing: ./upload/${root}-${slice}.txt` )})
        }
        let hash = crypto.createHash('sha256').update(chunk).digest('hex')
        merkle.push(hash)
    });

    readStream.on('end', function () {
        console.log("Now ")
        let len = data.length
        let round = 0
        // console.log(Math.log2(len))
        while (2**round < len) {
            for (let i = 0; i <= len - 1;) {
                merkle[i] = merkle[i+2**round] ? HexSha256(merkle[i], merkle[i+2**round]) : HexSha256(merkle[i])
                i += (2**(round+1))
            }
            round += 1 
        }

        res.status(200).send({
            filePath: `${root}-${slice}.txt`,
            originData: data[parseInt(slice)],
            slice: parseInt(slice),
            res: (parseInt(slice) > 10) ? true : false,
            merkle: merkle[0]
        })

    });

    readStream.on('error', function (err) {
        console.log(err.stack);
    });
    
    console.log("Program Ended");

})

module.exports = router
