// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract Test is ChainlinkClient {
    using Chainlink for Chainlink.Request;


    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    bool public volume;

    bytes32 public requestIdShow;

    string public external_address;

    struct TaskChallenge {
        uint sliceIndex;
        // add timestamp
        bool result;
    }


    struct Task {
        uint time;
        string root;
        uint price;
        address owner;
        address sp;
        // TaskChallenge[] challengeList;
    }

    mapping(address => string) public pkList;

    mapping(address => bool) public challengeResult;

    mapping (bytes32 => address) public requestMapping;



    modifier sysUser {
        require(userTasksMapping[msg.sender].length > 0, "It seems that you do not use our system ><");
        _;
    }

    mapping(address => string) private externalApiList;
    constructor() {
        // set default oracle
        externalApiList[0x7C152F84A11A4f64aB69694D41c0b68414Aec7E5] = "20.212.155.179/challenge/";


        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        // jobId = "d5270d1c311941d0b08bead21fea7747";    uint256
        jobId = "bc746611ebee40a3989bbe49e12a02b9";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
    }
    mapping(address => Task[]) public userTasksMapping;

    // Challenge Work
    // (string memory targetRoot, uint index)
    // returns (bytes32 requestId) 
   function requestVolumeData(string memory merkle, string memory slice) public sysUser
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        external_address = string(abi.encodePacked("http://20.212.155.179:3000/oracle/", externalApiList[0x7C152F84A11A4f64aB69694D41c0b68414Aec7E5] , merkle, "/", slice));
        // request.add("get", "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
        request.add("get", external_address);

        // Set the path to find the desired data in the API response, where the response format is:
        request.add("path", "res");

        bytes32 requestId = sendChainlinkRequestTo(oracle, request, fee);
        requestIdShow = requestId;
        requestMapping[requestId] = msg.sender;
        // return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    /**
     * Receive the response in the form of uint256
     */ 
    function fulfill(bytes32 _requestId, bool _volume) public recordChainlinkFulfillment(_requestId)
    {
        address req_customer = requestMapping[_requestId];
        challengeResult[req_customer] = _volume;
        volume = _volume;
    }





    // Set the public key
    function setPk(string memory pk) public {
        pkList[msg.sender] = pk;
    }

    function setBook(uint time, string memory root, uint price) public {
        // Task memory task = Task(time, root, price, msg.sender, address(0x0), 100);
        //   address[] memory minters = new address[](1);
        // minters[0] = minter;
        // StandaloneERC20.initialize("MyToken", "MTK", uint8(18), minters, pausers);
        // TaskChallenge[] storage tempList;
        // tempList.push({sliceIndex: 0, result: false});
        Task memory task = Task(time, root, price, msg.sender, address(0x7C152F84A11A4f64aB69694D41c0b68414Aec7E5));
        userTasksMapping[msg.sender].push(task);
    }

    function setExternalApi(string memory api) public {
        externalApiList[msg.sender] = api;
    }

    function getTaskNum() public view returns (uint) {
        return userTasksMapping[msg.sender].length;
    }

    function getTargetTask(string memory targetRoot) public view returns (uint time, string memory root, uint price, address owner, address sp) {

        for (uint i = 0; i < userTasksMapping[msg.sender].length; i++) {
            Task memory curTask = userTasksMapping[msg.sender][i];
            if (keccak256(bytes(targetRoot)) == keccak256(bytes(curTask.root))) {
                return (curTask.time, curTask.root, curTask.price, curTask.owner, curTask.sp);
            }
        }
        revert("Do not find what you need, check the value");
    } 

}