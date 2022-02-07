// read the file and process it to calculate the merkle root.

const fs = require('fs')
const crypto = require('crypto');

const readStream = fs.createReadStream('./test.txt', { highWaterMark: 16 })

const data = []
const merkle = []

const HexSha256 = (a,b) => {
    return crypto.createHash('sha256').update(a,b).digest('hex')
}
// await new Promise((resolve, reject) => {
//     readStream.on('data', (chunk) => {
//         data.push(chunk)
//         console.log(data.length)
//     })
//     console.log("gg")
// })
// Handle stream events --> data, end, and error
readStream.on('data', function (chunk) {
    data.push(chunk)
    let hash = crypto.createHash('sha256').update(chunk).digest('hex')
    merkle.push(hash)
});

readStream.on('end', function () {
    console.log("Now ")
    // console.log(data);
    // console.log(merkle[334])
    // console.log(HexSha256(data[334]))
    // console.log(crypto.createHash('sha256').update(`${data[16]}${data[2]}`).digest('hex'))
    let len = data.length
    // let round = Math.log2(len)
    let round = 0
    console.log(Math.log2(len))
    while (2**round < len) {
        for (let i = 0; i <= len - 1;) {
            // console.log("i: ", i)
            // console.log("round: ", round)
            // if (merkle[i+2**round]) {
            //     console.log("HIT:  ", i, ' ', i + 2**round)
            // } else {
            //     console.log("LON:  ",i)
            // }
            merkle[i] = merkle[i+2**round] ? HexSha256(merkle[i], merkle[i+2**round]) : HexSha256(merkle[i])
            i += (2**(round+1))
        }
        round += 1 
    }
    console.log(merkle[0])
});

readStream.on('error', function (err) {
    console.log(err.stack);
});

console.log("Program Ended");
