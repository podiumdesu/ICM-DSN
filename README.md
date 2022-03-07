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

| File Size               | Block Size        | Slice Length | Tree Depth | Read Time(ms) | Calculation Time(ms) |
| ----------------------- | ----------------- | ------------ | ---------- | ------------- | -------------------- |
| 10063680 bytes (10.1MB) | 4  bytes          | 2515920      | 22         | 39664         | 5857                 |
|                         | 8  bytes          | 1257960      | 21         | 20001         | 3187                 |
|                         | 16  bytes         | 628980       | 20         | 10694         | 1607                 |
|                         | 32  bytes         | 314490       | 19         | 4872          | 732.38               |
|                         | 64  bytes         | 157245       | 18         | 2659          | 404.6                |
|                         | 128  bytes        | 78623        | 17         | 1385          | 223.49               |
|                         | 256  bytes        | 39312        | 16         | 773.7         | 116.75               |
|                         | 512  bytes        | 19656        | 15         | 417.78        | 63.923               |
|                         | 1024  bytes (1KB) | 9828         | 14         | 246.5         | 34.81                |
|                         | 2048  bytes (2KB) | 4914         | 13         | 157.81        | 16.067               |
|                         | 4KB               | 2457         | 12         | 107.97        | 8.102                |
|                         | 8KB               | 1229         | 11         | 73.517        | 5.267                |
|                         | 16KB              | 615          | 10         | 54.474        | 2.345                |
|                         | 32KB              | 308          | 9          | 46.492        | 1.463                |
|                         | 64KB              | 154          | 8          | 41.896        | 1.075                |

| File Size               | Block Size        | Slice Length | Tree Depth | Read Time(ms) | Calculation Time(ms) |
| ----------------------- | ----------------- | ------------ | ---------- | ------------- | -------------------- |
| 144343122 bytes (144MB) | 64  bytes         | 2255362      | 22         | 43273         | 5541                 |
|                         | 128  bytes        | 1127681      | 21         | 20216         | 2706                 |
|                         | 256  bytes        | 563841       | 20         | 10750         | 1620                 |
|                         | 512  bytes        | 281921       | 19         | 5758          | 671.81               |
|                         | 1024  bytes (1KB) | 140961       | 18         | 3035          | 471.49               |
|                         | 2048  bytes (2KB) | 70481        | 17         | 1815          | 238.86               |
|                         | 4096  bytes (4KB) | 35241        | 16         | 1095          | 120.87               |
|                         | 8192  bytes (8KB) | 17621        | 15         | 878.29        | 59.768               |
|                         | 16KB              | 8811         | 14         | 648.48        | 25.107               |
|                         | 32KB              | 4406         | 13         | 571.33        | 14.7                 |
|                         | 64KB              | 2203         | 12         | 513.86        | 7.274                |
|                         | 128KB             | 1102         | 11         | 471.71        | 3.984                |
|                         | 256KB             | 551          | 10         | 446.03        | 2.3                  |
|                         | 512KB             | 276          | 9          | 440.11        | 1.277                |
|                         | 1  MB             | 138          | 8          | 441.35        | 0.938                |

| File Size                 | Block Size        | Slice Length | Tree Depth | Read Time(ms) | Calculation Time(ms) |
| ------------------------- | ----------------- | ------------ | ---------- | ------------- | -------------------- |
| 1016844450 bytes (1.02GB) | 256  bytes        | 3972049      | 22         | 73587         | 10762                |
|                           | 512  bytes        | 1986025      | 21         | 40656         | 4553                 |
|                           | 1024  bytes (1KB) | 993013       | 20         | 20756         | 2223                 |
|                           | 2KB               | 496507       | 19         | 15056         | 1569                 |
|                           | 4KB               | 248254       | 18         | 8852          | 628.96               |
|                           | 8KB               | 124127       | 17         | 6405          | 352.83               |
|                           | 16KB              | 62064        | 16         | 4549          | 198.43               |
|                           | 32KB              | 31032        | 15         | 4181          | 103.74               |
|                           | 64KB              | 15516        | 14         | 3608          | 51.703               |
|                           | 128KB             | 7758         | 13         | 3302          | 22.881               |
|                           | 256KB             | 3879         | 12         | 3196          | 14.178               |
|                           | 512KB             | 1940         | 11         | 3117          | 7.257                |
|                           | 1MB               | 970          | 10         | 3101          | 3.434                |
|                           | 2MB               | 485          | 9          | 3070          | 2.025                |
|                           | 4MB               | 243          | 8          | 3027          | 1.374                |



>  Conclusion: It is clear that the computational cost is **positively related** to the **height of the tree**.



### Cost of proof of storage

Call for `Challenge`:

| Transaction Hash                                             | Gas Limit | Fee(Ether)               |
| ------------------------------------------------------------ | --------- | ------------------------ |
| 0x01de64ffe0fbe2d0e78830aec42e45f30ca5e9224ca6e4eaf1bde81d593d3be4 | 192101    | 0**.**000480252501536808 |



When the storage task is created, the task is named by the file's Merkle root. So every time the client puts a challenge, he only needs to justify the file Merkle root. Then the oracle nodes could know which task to process with.

>  Retrieving Merkle root doesn't cost any fee since the operation doesn't change the state on the chain.



Running time of **Proof of Storage**

The last two columns are newly added. The result is the average of **ten** tests. 

> Conclusion: When the Merkle path has been generated, it takes the oracle node a really short time to do the verification.

| File Size               | Block Size       | Slice Length | Tree Depth | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| ----------------------- | ---------------- | ------------ | ---------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 10063680 bytes (10.1MB) | 4 bytes          | 2515920      | 22         | 39664                 | 5857                              | 6436.839                         | 0.251                           |
|                         | 8 bytes          | 1257960      | 21         | 20001                 | 3187                              | 3282.159                         | 0.219                           |
|                         | 16 bytes         | 628980       | 20         | 10694                 | 1607                              | 1488.055                         | 0.274                           |
|                         | 32 bytes         | 314490       | 19         | 4872                  | 732.384                           | 751.323                          | 0.265                           |
|                         | 64 bytes         | 157245       | 18         | 2659                  | 404.604                           | 410.923                          | 0.158                           |
|                         | 128 bytes        | 78623        | 17         | 1385                  | 223.492                           | 203.379                          | 0.178                           |
|                         | 256 bytes        | 39312        | 16         | 773.697               | 116.749                           | 103.141                          | 0.162                           |
|                         | 512 bytes        | 19656        | 15         | 417.778               | 63.923                            | 49.913                           | 0.2                             |
|                         | 1024 bytes (1KB) | 9828         | 14         | 246.504               | 34.81                             | 25.247                           | 0.143                           |
|                         | 2048 bytes (2KB) | 4914         | 13         | 157.813               | 16.067                            | 14.017                           | 0.126                           |
|                         | 4KB              | 2457         | 12         | 107.97                | 8.102                             | 6.157                            | 0.078                           |
|                         | 8KB              | 1229         | 11         | 73.517                | 5.267                             | 3.191                            | 0.07                            |
|                         | 16KB             | 615          | 10         | 54.474                | 2.345                             | 2.144                            | 0.062                           |
|                         | 32KB             | 308          | 9          | 46.492                | 1.463                             | 1.081                            | 0.064                           |
|                         | 64KB             | 154          | 8          | 41.896                | 1.075                             | 0.597                            | 0.062                           |

| File Size               | Block Size        | Slice Length | Tree Depth | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| ----------------------- | ----------------- | ------------ | ---------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 144343122 bytes (144MB) | 64  bytes         | 2255362      | 22         | 43273                 | 5541                              | 5580.15                          | 0.182                           |
|                         | 128  bytes        | 1127681      | 21         | 20216                 | 2706                              | 2660.676                         | 0.14                            |
|                         | 256  bytes        | 563841       | 20         | 10750                 | 1620                              | 1255.205                         | 0.204                           |
|                         | 512  bytes        | 281921       | 19         | 5758                  | 671.81                            | 756.19                           | 0.231                           |
|                         | 1024  bytes (1KB) | 140961       | 18         | 3035                  | 471.49                            | 378.162                          | 0.231                           |
|                         | 2048  bytes (2KB) | 70481        | 17         | 1815                  | 238.86                            | 185.58                           | 0.209                           |
|                         | 4096  bytes (4KB) | 35241        | 16         | 1095                  | 120.87                            | 100.367                          | 0.165                           |
|                         | 8192  bytes (8KB) | 17621        | 15         | 878.29                | 59.768                            | 44.731                           | 0.136                           |
|                         | 16KB              | 8811         | 14         | 648.48                | 25.107                            | 25.965                           | 0.13                            |
|                         | 32KB              | 4406         | 13         | 571.33                | 14.7                              | 13.047                           | 0.104                           |
|                         | 64KB              | 2203         | 12         | 513.86                | 7.274                             | 5.989                            | 0.082                           |
|                         | 128KB             | 1102         | 11         | 471.71                | 3.984                             | 3.424                            | 0.074                           |
|                         | 256KB             | 551          | 10         | 446.03                | 2.3                               | 1.93                             | 0.069                           |
|                         | 512KB             | 276          | 9          | 440.11                | 1.277                             | 0.905                            | 0.064                           |
|                         | 1  MB             | 138          | 8          | 441.35                | 0.938                             | 0.432                            | 0.055                           |

| File Size                 | Block Size        | Slice Length | Tree Depth | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| ------------------------- | ----------------- | ------------ | ---------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 1016844450 bytes (1.02GB) | 256  bytes        | 3972049      | 22         | 73587                 | 10762                             | 9611.052                         | 0.205                           |
|                           | 512  bytes        | 1986025      | 21         | 40656                 | 4553                              | 4526.451                         | 0.17                            |
|                           | 1024  bytes (1KB) | 993013       | 20         | 20756                 | 2223                              | 2397.187                         | 0.162                           |
|                           | 2KB               | 496507       | 19         | 15056                 | 1569                              | 1401.067                         | 0.187                           |
|                           | 4KB               | 248254       | 18         | 8852                  | 628.96                            | 636.294                          | 0.235                           |
|                           | 8KB               | 124127       | 17         | 6405                  | 352.83                            | 314.478                          | 0.162                           |
|                           | 16KB              | 62064        | 16         | 4549                  | 198.43                            | 164.645                          | 0.136                           |
|                           | 32KB              | 31032        | 15         | 4181                  | 103.74                            | 80.878                           | 0.125                           |
|                           | 64KB              | 15516        | 14         | 3608                  | 51.703                            | 41.341                           | 0.114                           |
|                           | 128KB             | 7758         | 13         | 3302                  | 22.881                            | 24.126                           | 0.158                           |
|                           | 256KB             | 3879         | 12         | 3196                  | 14.178                            | 12.887                           | 0.101                           |
|                           | 512KB             | 1940         | 11         | 3117                  | 7.257                             | 5.362                            | 0.083                           |
|                           | 1MB               | 970          | 10         | 3101                  | 3.434                             | 4.083                            | 0.075                           |
|                           | 2MB               | 485          | 9          | 3070                  | 2.025                             | 1.803                            | 0.064                           |
|                           | 4MB               | 243          | 8          | 3027                  | 1.374                             | 0.779                            | 0.061                           |



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