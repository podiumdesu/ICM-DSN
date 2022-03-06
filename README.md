# An Incentive-Compatible Mechanism for Decentralized Storage Service

Here is our implementation. More details can be found in our paper.

<img src="https://tva1.sinaimg.cn/large/e6c9d24egy1gzs49jdt8aj21hc0u0q5w.jpg" alt="image-20220227154739608" style="zoom: 100%;" />

## A. File Directory Structure

```bash
.
├── README.md          # This file 😊
├── backend-SP				 # service provided by Storage Provider: store file📦 / download file⏬ APIs
├── backend-oracle     # external adapter API 🏠
├── contracts					 # smart contract. You can use Remix to compile and deploy it.
└── frontend					 # frontend with nice user interaction.  upload⏫ / download⏬ / on-chain operation👝
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
| 0x8ecc1ade7d3b23ac90bd578a45a6766ef5b21177b3783bfbeb3024ac34f85152 | 202001    | 0**.**000505002501616008 |

![image-20220228134449794](https://tva1.sinaimg.cn/large/e6c9d24egy1gzt6c1b8fzj21p00muada.jpg)

### Cost of on-chain deployment

The gas limit of the whole contract deployment is `2491606`. 

| Transaction Hash                                             | Gas Limit | Fee(Ether)               |
| ------------------------------------------------------------ | --------- | ------------------------ |
| 0x0b6f723482b46e5cc0d1400f83e272f2822c26abafe269e4ab7ba2a8de805b31 | 2491606   | 0**.**006229015022424454 |

![image-20220228151204192](https://tva1.sinaimg.cn/large/e6c9d24egy1gzt8ut1mj9j21oi0notb7.jpg)

### Cost of oracle execution

CPU: `Apple M1 Pro `

Implementation Language: `JavaScript`, Testing Environment: `nodeJS v16.2.0`

| File Size               | Block Size       | Slice Length | Tree Depth | Read Time | Calculation Time |
| ----------------------- | ---------------- | ------------ | ---------- | --------- | ---------------- |
| 10063680 bytes (10.1MB) | 4 bytes          | 2515920      | 22         | 39.664s   | 5.857s           |
|                         | 8 bytes          | 1257960      | 21         | 20.001s   | 3.187s           |
|                         | 16 bytes         | 628980       | 20         | 10.694s   | 1.607s           |
|                         | 32 bytes         | 314490       | 19         | 4.872s    | 732.384ms        |
|                         | 64 bytes         | 157245       | 18         | 2.659s    | 404.604ms        |
|                         | 128 bytes        | 78623        | 17         | 1.385s    | 223.492ms        |
|                         | 256 bytes        | 39312        | 16         | 773.697ms | 116.749ms        |
|                         | 512 bytes        | 19656        | 15         | 417.778ms | 63.923ms         |
|                         | 1024 bytes (1KB) | 9828         | 14         | 246.504ms | 34.81ms          |
|                         | 2048 bytes (2KB) | 4914         | 13         | 157.813ms | 16.067ms         |
|                         | 4KB              | 2457         | 12         | 107.97ms  | 8.102ms          |
|                         | 8KB              | 1229         | 11         | 73.517ms  | 5.267ms          |
|                         | 16KB             | 615          | 10         | 54.474ms  | 2.345ms          |
|                         | 32KB             | 308          | 9          | 46.492ms  | 1.463ms          |
|                         | 64KB             | 154          | 8          | 41.896ms  | 1.075ms          |

| File Size               | Block Size       | Slice Length | Tree Depth | Read Time | Calculation Time |
| ----------------------- | ---------------- | ------------ | ---------- | --------- | ---------------- |
| 144343122 bytes (144MB) | 64 bytes         | 2255362      | 22         | 43.273s   | 5.541s           |
|                         | 128 bytes        | 1127681      | 21         | 20.216s   | 2.706s           |
|                         | 256 bytes        | 563841       | 20         | 10.750s   | 1.620s           |
|                         | 512 bytes        | 281921       | 19         | 5.758s    | 671.807ms        |
|                         | 1024 bytes (1KB) | 140961       | 18         | 3.035s    | 471.491ms        |
|                         | 2048 bytes (2KB) | 70481        | 17         | 1.815s    | 238.864ms        |
|                         | 4096 bytes (4KB) | 35241        | 16         | 1.095s    | 120.87ms         |
|                         | 8192 bytes (8KB) | 17621        | 15         | 878.287ms | 59.768ms         |
|                         | 16KB             | 8811         | 14         | 648.481ms | 25.107ms         |
|                         | 32KB             | 4406         | 13         | 571.326ms | 14.7ms           |
|                         | 64KB             | 2203         | 12         | 513.86ms  | 7.274ms          |
|                         | 128KB            | 1102         | 11         | 471.711ms | 3.984ms          |
|                         | 256KB            | 551          | 10         | 446.028ms | 2.3ms            |
|                         | 512KB            | 276          | 9          | 440.113ms | 1.277ms          |
|                         | 1 MB             | 138          | 8          | 441.349ms | 0.938ms          |

| File Size                 | Block Size       | Slice Length | Tree Depth | Read Time | Calculation Time |
| ------------------------- | ---------------- | ------------ | ---------- | --------- | ---------------- |
| 1016844450 bytes (1.02GB) | 256 bytes        | 3972049      | 22         | 73.587s   | 10.762s          |
|                           | 512 bytes        | 1986025      | 21         | 40.656s   | 4.553s           |
|                           | 1024 bytes (1KB) | 993013       | 20         | 20.756s   | 2.223s           |
|                           | 2KB              | 496507       | 19         | 15.056s   | 1.569s           |
|                           | 4KB              | 248254       | 18         | 8.852s    | 628.957ms        |
|                           | 8KB              | 124127       | 17         | 6.405s    | 352.834ms        |
|                           | 16KB             | 62064        | 16         | 4.549s    | 198.432ms        |
|                           | 32KB             | 31032        | 15         | 4.181s    | 103.743ms        |
|                           | 64KB             | 15516        | 14         | 3.608s    | 51.703ms         |
|                           | 128KB            | 7758         | 13         | 3.302s    | 22.881ms         |
|                           | 256KB            | 3879         | 12         | 3.196s    | 14.178ms         |
|                           | 512KB            | 1940         | 11         | 3.117s    | 7.257ms          |
|                           | 1MB              | 970          | 10         | 3.101s    | 3.434ms          |
|                           | 2MB              | 485          | 9          | 3.070s    | 2.025ms          |
|                           | 4MB              | 243          | 8          | 3.027s    | 1.374ms          |



It is clear that the computational cost is **positively related** to the **height of the tree**.

| Read Time | Calculation Time |
| --------- | ---------------- |
|           |                  |

### Cost of proof of storage

Call for `Challenge`:

| Transaction Hash                                             | Gas Limit | Fee(Ether)               |
| ------------------------------------------------------------ | --------- | ------------------------ |
| 0x01de64ffe0fbe2d0e78830aec42e45f30ca5e9224ca6e4eaf1bde81d593d3be4 | 192101    | 0**.**000480252501536808 |



When the storage task is created, the task is named by the file's Merkle root. So every time the client puts a challenge, he only needs to justify the file Merkle root. Then the oracle nodes could know which task to process with.

Retrieving Merkle root doesn't cost any fee since the operation doesn't change the state on the chain.



| Length of Merkle path | time |
| --------------------- | ---- |
|                       |      |

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