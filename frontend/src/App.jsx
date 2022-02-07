import React, { useState } from 'react'
import 'web3/dist/web3.min.js'

import Upload from './components/UploadFile/index'

import { Button, Alert } from 'antd'

import { RiseOutlined } from '@ant-design/icons'

console.log(Web3)

function App() {
    const abi = [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "k",
                    "type": "string"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "name": "Registration",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "k",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "uun",
                    "type": "string"
                }
            ],
            "name": "register",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "students",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "k",
                    "type": "string"
                }
            ],
            "name": "updateKey",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]

    window.web3 ? console.log("Injected web3 detected") : console.log("gg")
    const web3 = new Web3(new Web3.providers.HttpProvider(
        'https://kovan.infura.io/v3/2311e12cc83f4c3b9b791c706cd580d9'
    ))
    // console.log(web3)
    // web3.requestAuth(web3)
    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!');
    }
    const clickBtn = async () => {
        await window.ethereum.enable();
        console.log("click button")
        // const priKey = "95b0c0af4603ed27c289064f80343f195a713d456aaf973c07c546ceee9280c5"
        const priKey = '23762f6b48c6162dc3b94c0daf8da4ce05f9c4abe76c22e0f1057c085a9515a2' // Assignment3 wallet
        const account = web3.eth.accounts.privateKeyToAccount(`0x${priKey}`)
        web3.eth.accounts.wallet.add(account)

        // const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        // const account = accounts[0]
        console.log(account)
        // const address = "0xde3a17573B0128da962698917B17079f2aAbebea" // Assignment3 Address
        // const StorageContract = new web3.eth.Contract(abi, address)
        // const res2 = await StorageContract.methods.register("actually...;)", "s2224343").send({
        //     from: account.address,
        //     gas: 100000
        // })
        // .then(res => {
        //     console.log(res)
        // })
        // console.log(res2)
        const messageHash = web3.utils.sha3("Apples");
        console.log(messageHash)
        // personal_sign
        // add `\x19Ethereum Signed Message:\n`

        // EIP-712
        // \x19Ethereum Signed Message:\n32
        const signature = await web3.eth.sign(`${messageHash}`, account.address);
        console.log(signature)

        const addr = web3.eth.ecRecover("Apples", signature)
        console.log(addr)
    }

    const getFileInfo = (info) => {
        console.log(info)
        setFileInfo(info)
        setUploadState(false)
    }
    const [uploadState, setUploadState] = useState(true)
    const [fileInfo, setFileInfo] = useState({})
    return (
        <div className={`h-full grid grid-cols-1 grid-rows-${fileInfo.name ? 5 : 4}`}>
            <div></div>
            {
                fileInfo.name ?
                    (
                        <div className='grid grid-rows-auto grid-cols-9 text-center px-40 gap-12' >
                            <div className="col-span-4">
                                <p className='relative top-3 bg-white m-auto w-32 z-10'>Basic Info</p>
                                <div className='relative text-left border-dashed border-2 border-black rounded-lg px-20 py-10'>
                                    <p>File Name: {fileInfo.name}</p>
                                    <p>File Size: {fileInfo.size} bytes ({(fileInfo.size / 1024).toFixed(2)} KB)</p>
                                    <p>Merkle Slices: {Math.round(fileInfo.size / 16) + 1} pieces</p>
                                    <p>Last Modi: {`${new Date(fileInfo.lastModified)}`}</p>
                                </div>
                            </div>
                            <div className="col-span-5 mt-5">
                                <div className="grid grid-rows-3">
                                    <Alert
                                        message="Merkle Root"
                                        description={fileInfo.merkle}
                                        type="info"
                                        showIcon
                                    />
                                    <div className="mt-4">
                                        <Alert
                                            message="Signature"
                                            description={fileInfo.signature ? fileInfo.signature : "0xffb810abd89a953265b5e118153eecaa3500942eb1699611b99e57471de6227c"}
                                            type="success"
                                            showIcon
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <Button type="primary" onClick={clickBtn} icon={<RiseOutlined />} block >
                                            Link to The Chain!
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>

                    ) : ""
            }
            <div className={`w-1/2 m-auto ${uploadState ? "block" : "hidden"}`}>

                <Upload className='' trigger={getFileInfo} />
            </div>
        </div>
    )
}
// Candara
export default App




