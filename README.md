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
| 0x8ecc1ade7d3b23ac90bd578a45a6766ef5b21177b3783bfbeb3024ac34f85152 | 202001    | 0**.**000505002501616008 |

![image-20220228134449794](https://tva1.sinaimg.cn/large/e6c9d24egy1gzt6c1b8fzj21p00muada.jpg)

### Cost of on-chain deployment

The gas limit of the whole contract deployment is `2491606`. 

| Transaction Hash                                             | Gas Limit | Fee(Ether)               |
| ------------------------------------------------------------ | --------- | ------------------------ |
| 0x0b6f723482b46e5cc0d1400f83e272f2822c26abafe269e4ab7ba2a8de805b31 | 2491606   | 0**.**006229015022424454 |

![image-20220228151204192](https://tva1.sinaimg.cn/large/e6c9d24egy1gzt8ut1mj9j21oi0notb7.jpg)

### Cost of Update









### Cost of oracle execution

CPU: `Apple M1 Pro `

Implementation Language: `JavaScript`, Testing Environment: `nodeJS v16.2.0`

| File Size               | Block Size        | Slice Length | Tree Depth | Read Time(ms) | Calculation Time(ms) |
| ----------------------- | ----------------- | ------------ | ---------- | ------------- | -------------------- |
| 10063680 bytes (10.1MB) | 4  bytes          | 2515920      | 22         | 39664         | 6626                 |
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

| File Size               | Block Size       | Slice Length | Tree Height | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| ----------------------- | ---------------- | ------------ | ----------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 10063680 bytes (10.1MB) | 4 bytes          | 2515920      | 22          | 53401                 | 6626                              | 6436.839                         | 0.251                           |
|                         | 8 bytes          | 1257960      | 21          | 26778                 | 3296                              | 3282.159                         | 0.219                           |
|                         | 16 bytes         | 628980       | 20          | 10694                 | 1775                              | 1488.055                         | 0.274                           |
|                         | 32 bytes         | 314490       | 19          | 6900                  | 831.603                           | 751.323                          | 0.265                           |
|                         | 64 bytes         | 157245       | 18          | 3490                  | 411.708                           | 410.923                          | 0.158                           |
|                         | 128 bytes        | 78623        | 17          | 1733                  | 228.156                           | 203.379                          | 0.178                           |
|                         | 256 bytes        | 39312        | 16          | 878.715               | 116.749                           | 103.141                          | 0.162                           |
|                         | 512 bytes        | 19656        | 15          | 503.888               | 68.9                              | 49.913                           | 0.2                             |
|                         | 1024 bytes (1KB) | 9828         | 14          | 283.448               | 33.892                            | 25.247                           | 0.143                           |
|                         | 2048 bytes (2KB) | 4914         | 13          | 178.451               | 16.867                            | 14.017                           | 0.126                           |
|                         | 4KB              | 2457         | 12          | 115.65                | 8.145                             | 6.157                            | 0.078                           |
|                         | 8KB              | 1229         | 11          | 79.897                | 4.375                             | 3.191                            | 0.07                            |
|                         | 16KB             | 615          | 10          | 57.029                | 2.4                               | 2.144                            | 0.062                           |
|                         | 32KB             | 308          | 9           | 47.722                | 1.508                             | 1.081                            | 0.064                           |
|                         | 64KB             | 154          | 8           | 42.184                | 1.025                             | 0.597                            | 0.062                           |
|                         | 128KB            | 77           | 7           | 39.542                | 1.007                             | 0.271                            | 0.062                           |

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
| 1016844450 bytes (1.02GB) | 128 bytes         | 7944098      | 23         | 189885                | 22012                             | 21490.59                         | 0.289                           |
|                           | 256  bytes        | 3972049      | 22         | 73587                 | 10762                             | 9611.052                         | 0.205                           |
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



New cases: 

| File Size             | Block Size       | Slice Length | Tree Height | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| --------------------- | ---------------- | ------------ | ----------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 10485760 bytes (10MB) | 128 bytes        | 81920        | 17          | 1787.904              | 238.09                            | 208.206                          | 0.122                           |
|                       | 256 bytes        | 40960        | 16          | 927.353               | 95.722                            | 99.334                           | 0.088                           |
|                       | 512 bytes        | 20480        | 15          | 537.782               | 56.897                            | 52.63                            | 0.101                           |
|                       | 1024 bytes (1KB) | 10240        | 14          | 285.219               | 29.52                             | 24.91                            | 0.079                           |
|                       | 2048 bytes (2KB) | 5120         | 13          | 183.741               | 15.773                            | 12.442                           | 0.045                           |
|                       | 4KB              | 2560         | 12          | 120.084               | 8.305                             | 6.529                            | 0.041                           |
|                       | 8KB              | 1280         | 11          | 77.793                | 5.104                             | 3.31                             | 0.034                           |
|                       | 16KB             | 640          | 10          | 56.051                | 2.083                             | 2.108                            | 0.033                           |
|                       | 32KB             | 320          | 9           | 45.227                | 1.185                             | 1.342                            | 0.038                           |
|                       | 64KB             | 160          | 8           | 41.836                | 0.725                             | 0.587                            | 0.039                           |
|                       | 128KB            | 80           | 7           | 37.500                | 0.605                             | 0.237                            | 0.037                           |



| File Size             | Block Size       | Slice Length | Tree Height | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| --------------------- | ---------------- | ------------ | ----------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 52428800 bytes (50MB) | 128 bytes        | 409600       | 19          | 8950.150              | 982.823                           | 946.094                          | 0.105                           |
|                       | 256 bytes        | 204800       | 18          | 4672.522              | 491.322                           | 504.713                          | 0.117                           |
|                       | 512 bytes        | 102400       | 17          | 2515.876              | 277.763                           | 264.181                          | 0.127                           |
|                       | 1024 bytes (1KB) | 51200        | 16          | 1347.252              | 138.973                           | 130.389                          | 0.126                           |
|                       | 2048 bytes (2KB) | 25600        | 15          | 786.049               | 67.828                            | 62.617                           | 0.066                           |
|                       | 4KB              | 12800        | 14          | 526.626               | 31.673                            | 32.167                           | 0.08                            |
|                       | 8KB              | 6400         | 13          | 363.279               | 18.832                            | 16.647                           | 0.069                           |
|                       | 16KB             | 3200         | 12          | 272.149               | 10.909                            | 7.483                            | 0.04                            |
|                       | 32KB             | 1600         | 11          | 216.035               | 5.435                             | 4.442                            | 0.037                           |
|                       | 64KB             | 800          | 10          | 189.120               | 2.535                             | 2.575                            | 0.033                           |
|                       | 128KB            | 400          | 9           | 170.561               | 1.441                             | 1.62                             | 0.041                           |



| File Size               | Block Size       | Slice Length | Tree Height | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| ----------------------- | ---------------- | ------------ | ----------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 104857600 bytes (100MB) | 128 bytes        | 819200       | 20          | 18014.235             | 2244.158                          | 2006.815                         | 0.131                           |
|                         | 256 bytes        | 409600       | 19          | 9195.558              | 1013.982                          | 994.447                          | 0.099                           |
|                         | 512 bytes        | 204800       | 18          | 5049.277              | 578.276                           | 521.768                          | 0.103                           |
|                         | 1024 bytes (1KB) | 102400       | 17          | 2758.359              | 301.883                           | 269.799                          | 0.108                           |
|                         | 2048 bytes (2KB) | 51200        | 16          | 1547.833              | 141.994                           | 135.149                          | 0.095                           |
|                         | 4KB              | 25600        | 15          | 1020.346              | 59.108                            | 66.528                           | 0.086                           |
|                         | 8KB              | 12800        | 14          | 702.577               | 30.809                            | 29.473                           | 0.074                           |
|                         | 16KB             | 6400         | 13          | 562.009               | 18.067                            | 17.364                           | 0.077                           |
|                         | 32KB             | 3200         | 12          | 432.415               | 10.992                            | 7.898                            | 0.044                           |
|                         | 64KB             | 1600         | 11          | 378.376               | 6.522                             | 4.389                            | 0.039                           |
|                         | 128KB            | 800          | 10          | 351.862               | 2.69                              | 2.538                            | 0.037                           |

| File Size               | Block Size       | Slice Length | Tree Height | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| ----------------------- | ---------------- | ------------ | ----------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 524288000 bytes (500MB) | 128 bytes        | 4096000      | 22          | 94737.491             | 9818.019                          | 10132.573                        | 0.121                           |
|                         | 256 bytes        | 2048000      | 21          | 46169.824             | 5388.3                            | 4969.759                         | 0.108                           |
|                         | 512 bytes        | 1024000      | 20          | 25267.874             | 2489.126                          | 2534.864                         | 0.089                           |
|                         | 1024 bytes (1KB) | 512000       | 19          | 13553.087             | 1464.32                           | 1348.817                         | 0.112                           |
|                         | 2048 bytes (2KB) | 256000       | 18          | 7354.601              | 741.567                           | 743.942                          | 0.101                           |
|                         | 4KB              | 128000       | 17          | 5156.859              | 325.235                           | 315.587                          | 0.115                           |
|                         | 8KB              | 64000        | 16          | 3368.927              | 184.248                           | 152.093                          | 0.105                           |
|                         | 16KB             | 32000        | 15          | 2534.908              | 74.448                            | 79.405                           | 0.078                           |
|                         | 32KB             | 16000        | 14          | 2041.117              | 38.056                            | 37.963                           | 0.067                           |
|                         | 64KB             | 8000         | 13          | 1886.029              | 23.166                            | 19.252                           | 0.075                           |
|                         | 128KB            | 4000         | 12          | 1792.042              | 13.81                             | 9.572                            | 0.045                           |



| File Size              | Block Size       | Slice Length | Tree Height | File Reading Time(ms) | Merkle Root Calculating Time (ms) | Merkle Path Generating Time (ms) | Merkle Path Verifying Time (ms) |
| ---------------------- | ---------------- | ------------ | ----------- | --------------------- | --------------------------------- | -------------------------------- | ------------------------------- |
| 1048576000 bytes (1GB) | 128 bytes        | 8192000      | 23          | 202395.990            | 22132.426                         | 23687.559                        | 0.221                           |
|                        | 256 bytes        | 4096000      | 22          | 97338.305             | 11019.89                          | 10064.421                        | 0.127                           |
|                        | 512 bytes        | 2048000      | 21          | 51409.273             | 4939.284                          | 4955.69                          | 0.143                           |
|                        | 1024 bytes (1KB) | 1024000      | 20          | 28270.954             | 2449.939                          | 2510.657                         | 0.102                           |
|                        | 2048 bytes (2KB) | 512000       | 19          | 16586.863             | 1404.678                          | 1435.893                         | 0.129                           |
|                        | 4KB              | 256000       | 18          | 10458.671             | 714.115                           | 636.902                          | 0.098                           |
|                        | 8KB              | 128000       | 17          | 6790.474              | 312.334                           | 288.44                           | 0.104                           |
|                        | 16KB             | 64000        | 16          | 5085.178              | 214.378                           | 150.928                          | 0.089                           |
|                        | 32KB             | 32000        | 15          | 4101.697              | 86.309                            | 73.861                           | 0.072                           |
|                        | 64KB             | 16000        | 14          | 3798.152              | 41.595                            | 39.496                           | 0.089                           |
|                        | 128KB            | 8000         | 13          | 3446.469              | 23.972                            | 20.959                           | 0.082                           |





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
