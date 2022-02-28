# An Incentive-Compatible Mechanism for Decentralized Storage Service

Here is our implementation. More details can be found in our paper.

<img src="https://tva1.sinaimg.cn/large/e6c9d24egy1gzs49jdt8aj21hc0u0q5w.jpg" alt="image-20220227154739608" style="zoom: 100%;" />

## A. File Directory Structure

```bash
.
├── README.md          # This file 😊
├── backend-SP			  # service provided by Storage Provider: store file📦 / download file⏬ APIs
├── backend-oracle     # external adapter API 🏠
├── contracts			  # smart contract. You can use Remix to compile and deploy it.
└── frontend			  # frontend with nice user interaction.  upload⏫ / download⏬ / on-chain operation👝
```

## B. Workflow

1. `Client` uploads the whole  `File`  to the `SP`  (Client can choose the size of every block)

2. `SP` uses the `block size` determined by the client to slice the File and calculate the `Merkle root`.

   > For example, if the file is 1.39KB(1427 bytes), and the client chooses to slice the file with 16 bytes. Then the file will be sliced into 90 pieces.

3. `Client` gets the `Merkle root` and records it on the blockchain.

**NO CHALLENGE:**

4. Whenever `Client` wants to get the file back, the server will be needed to share the whole file. Otherwise, the server may be challenged by the client. 

**CHALLENGE:**

When the client regards the server as faithless (`The server doesn't share the file` or `The file shared by the server seems to be wrong`), the client will issue a challenge on the chain.

*Both the client and the server will be charged, so it may not be a win-win situation.*

*If the server passed the challenge, it will not be punished. Otherwise, it will be punished severely, and the client will get a great reward.*

5. The client will choose the `No.` of the slice to be challenged and send a request to `Oracle Node`. `Oracle Node` will send a request to the external adapter Then the server needs to send these things to the external adapter:

   * content of the `No.` slice
   * Merkle path

6. The oracle external adapter uses the Merkle path to calculate the `Merkle root`. And compare it with the correct value stored on the chain. The oracle external adapter will return them back:

   * Result(Bool): recorded on the chain.
   * Slice content

   Meanwhile, in order to provide timely feedback to users(on-chain transaction needs to be confirmed), the frontend will also get the result back through standard RESTful API. 

### Why do we need an oracle here?

1. Retrieves off-chain data
2. Works as the trusted third party
3. Reduces on-chain computational overhead (save money)

## C. Mechanism Analysis

### Cost of various sizes of block for hashing and storing on-chain

**HASHING COST**

All the hash operations are done off-chain.

**STORING COST**

No matter how big the size of the block for hashing is, we just save the `Merkle root`(256 bytes) on the chain. So the on-chain cost is the same.

The gas limit of recording a storage task is `202001`.

| Transaction Hash                                             | Gas Limit | Fee(Ether)               |
| ------------------------------------------------------------ | --------- | ------------------------ |
| 0x8ecc1ade7d3b23ac90bd578a45a6766ef5b21177b3783bfbeb3024ac34f85152 | 202001    | 0**.**000000000001616008 |

![image-20220228134449794](https://tva1.sinaimg.cn/large/e6c9d24egy1gzt6c1b8fzj21p00muada.jpg)

### Cost of on-chain deployment

The gas limit of the whole contract deployment is `2491606`. 

| Transaction Hash                                             | Gas Limit | Fee(Ether)               |
| ------------------------------------------------------------ | --------- | ------------------------ |
| 0x0b6f723482b46e5cc0d1400f83e272f2822c26abafe269e4ab7ba2a8de805b31 | 2491606   | 0**.**000000000022424454 |

![image-20220228151204192](https://tva1.sinaimg.cn/large/e6c9d24egy1gzt8ut1mj9j21oi0notb7.jpg)

### Cost of oracle execution

CPU: `Apple M1 Pro `

Implementation Language: `JavaScript`, Testing Environment: `nodeJS v16.2.0`

| File Size               | Block Size       | Slice Length | Tree Length | Read Time | Calculation Time |
| ----------------------- | ---------------- | ------------ | ----------- | --------- | ---------------- |
| 10063680 bytes (10.1MB) | 16 bytes         | 628980       | 20          | 10.694s   | 1.607s           |
|                         | 32 bytes         | 314490       | 19          | 4.872s    | 732.384ms        |
|                         | 64 bytes         | 157245       | 18          | 2.659s    | 404.604ms        |
|                         | 128 bytes        | 78623        | 17          | 1.385s    | 223.492ms        |
|                         | 1024 bytes( 1KB) | 9828         | 14          | 246.504ms | 34.81ms          |

| File Size               | Block Size      | Slice Length | Tree Length | Read Time | Calculation Time |
| ----------------------- | --------------- | ------------ | ----------- | --------- | ---------------- |
| 144343122 bytes (144MB) | 64 bytes        | 2255362      | 22          | 43.273s   | 5.541s           |
|                         | 128 bytes       | 1127681      | 21          | 20.216s   | 2.706s           |
|                         | 256 bytes       | 563841       | 20          | 10.750s   | 1.620s           |
|                         | 1024 bytes(1KB) | 140961       | 18          | 3.035s    | 400.533ms        |
|                         | 1 MB            | 138          | 8           | 441.349ms | 0.938ms          |

It is clear that the computational cost is **positively related** to the **height of the tree**.

| Read Time                                                    | Calculation Time                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| <img src="https://tva1.sinaimg.cn/large/e6c9d24egy1gztjwu4rwmj20uo0km0tf.jpg" alt="image-20220228205122281" style="zoom:50%;" /> | <img src="https://tva1.sinaimg.cn/large/e6c9d24egy1gztirx6bkmj20v40kw3z9.jpg" alt="Line-20220228" style="zoom:50%;" /> |

### Cost of proof of storage



## D. Display

### Homepage

<img src="https://tva1.sinaimg.cn/large/e6c9d24egy1gzs49jdt8aj21hc0u0q5w.jpg" alt="image-20220227154739608" style="zoom: 33%;" />

### Upload File to the SP

<img src="https://tva1.sinaimg.cn/large/e6c9d24egy1gzs49xa1irj21hc0u0add.jpg" alt="image-20220227154802332" style="zoom: 33%;" />

### Record Merkle Root Value on the chain

<img src="https://tva1.sinaimg.cn/large/e6c9d24egy1gzs4at5j87j21hc0rsgp2.jpg" alt="image-20220227154853161" style="zoom: 33%;" />

You can download the whole file.

<img src="https://tva1.sinaimg.cn/large/e6c9d24egy1gzs4bep5yyj20pc0pm0vo.jpg" alt="image-20220227154927595" style="zoom:50%;" />

### Challenge

Select the slice number you want to challenge.

![image-20220227195200212](https://tva1.sinaimg.cn/large/e6c9d24egy1gzsbbr8ooij208101qq2s.jpg)

Then click the `CHALLENGE` button.

If the server passes the challenge:

![image-20220228162551478](https://tva1.sinaimg.cn/large/e6c9d24egy1gztazkq9w7j219i07kwfg.jpg)

Then you can download the piece of file.

Else: 

![image-20220228162809169](https://tva1.sinaimg.cn/large/e6c9d24egy1gztb1yzpytj219u0ag3zv.jpg)

## E. How to work

### Front-end

1. install necessary modules

```
npm install
```

2. run

```
npm run dev
```

### Oracle backend & Storage Provider backend

All backends have been deployed on my server. And there is no need for you to run them locally. The APIs have been exposed.

Oracle Backend: `20.212.155.179:3000`

Storage Provider Backend: `20.212.155.179`
