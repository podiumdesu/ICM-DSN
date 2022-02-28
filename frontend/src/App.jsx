import React, { useState } from 'react'

import axios from 'axios'

import { Button, Alert, message, InputNumber } from 'antd'
import { RiseOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons'

import { useWeb3React } from '@web3-react/core'
import { injected } from './components/wallet/index'
import Upload from './components/UploadFile/index'

import 'web3/dist/web3.min.js'
import abi from './abi.config.js'

function App() {
    const { active, account, library, connector, activate, deactivate } = useWeb3React()
    const [merkleRoot, setMerkleRoot] = useState("")

    window.web3 ? console.log("Injected web3 detected") : console.log("Not detected")
    const web3 = new Web3(new Web3.providers.HttpProvider(
        'https://kovan.infura.io/v3/2311e12cc83f4c3b9b791c706cd580d9'
    ))

    const priKey = '326cc219f479c88cd9761bca8708d930f72be27173baa5cc7a06edde7b90c60a' // Assignment3 wallet
    const account_infura = web3.eth.accounts.privateKeyToAccount(`0x${priKey}`)
    web3.eth.accounts.wallet.add(account_infura)
    const sc_address = "0xf98F2945117F782d232b0A0A4aBc7b08207E7c7f" // Assignment Address
    const StorageContract = new web3.eth.Contract(abi.testAbi, sc_address)

    if (typeof window.ethereum !== 'undefined') {
        console.log('MetaMask is installed!')
    }
    const clickBtn = async () => {
        await window.ethereum.enable()
        const res2 = await StorageContract.methods.setTask(100, merkleRoot, 300).send({
            from: account_infura.address,
            gas: 1000000
        })
            .then(res => {
                console.log(res)
                settransactionHash(res.transactionHash)
                setChainLoading(false)
                message.success("Already be recorded on the chain!!!")
            })
            .catch(err => {
                message.error(err)
            })
    }


    // For web3 wallet 
    async function connect() {
        try {
            await activate(injected)
            setChainLoading(true)
            clickBtn()
        } catch (ex) {
            console.log(ex)
        }
    }

    const downloadFile = () => {
        const merkle = fileInfo.merkle.slice(0, 10)
        window.open(`http://20.212.155.179/challenge/download/${merkle}`)
    }
    const downloadChallengeFile = () => {
        window.open(`http://20.212.155.179/challenge/downloadPiece/${challengePieceFileName}`)
    }
    const getFileInfo = (info) => {
        setFileInfo(info)
        setUploadState(false)
        setMerkleRoot(info.merkle)
    }

    const getChallengePiece = (value) => {
        setChallengeValue(value)
        setChallengePieceFileName("")
        setChallengeResult(null)
        setChallengeLoading(false)
    }

    const challengeSlice = async () => {
        const merkle = fileInfo.merkle.slice(0, 10)

        // call the oracle 
        setChallengeLoading(true)
        await window.ethereum.enable()

        const res2 = await StorageContract.methods.requestChallengeResult(fileInfo.merkle.slice(0, 10), String(challengeValue)).send({
            from: account_infura.address,
            gas: 1000000
        })
            .then(res => {
                console.log(res)
                setChaTransactionHash(res.transactionHash)
                setChallengeLoading(false)
                message.success("Challenge has been sent")
            })
            .catch(err => {
                message.error(err)
            })

        axios.get(`http://20.212.155.179/challenge/${merkle}/${challengeValue}`)
            .then(res => {
                console.log(res.data)
                setChallengePieceFileName(res.data.filePath)
                setChallengeResult(res.data.res)
            })

    }

    const [challengeValue, setChallengeValue] = useState(1)
    const [challengeResult, setChallengeResult] = useState(null)
    const [uploadState, setUploadState] = useState(true)
    const [challengePieceFileName, setChallengePieceFileName] = useState("")
    const [fileInfo, setFileInfo] = useState({})
    const [transactionHash, settransactionHash] = useState("")
    const [chaTransactionHash, setChaTransactionHash] = useState("")
    const [chainLoading, setChainLoading] = useState(false)
    const [challengeLoading, setChallengeLoading] = useState(false)

    return (
        <div className={`h-full grid grid-cols-1 grid-rows-${fileInfo.name ? 6 : 6}`}>
            <div
                style={{
                    backgroundImage: "url('./src/assets/bg-storage.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    height: "100vh",
                    opacity: `${fileInfo.name ? 0.6 : 0.5}`,
                    WebkitMaskImage: "linear-gradient(to top, transparent 10%, black 55%)",
                    filter: `blur(${fileInfo.name ? 4 : 1}px)`
                }}
                className="relative"
            >

            </div>
            <div className={`${fileInfo.name ? ' row-span-2' : 'relative  row-span-3'} text-center`}>
                <p className="text-5xl text-center font-bold mt-20 text-gray-700">THE BEST STORAGE SCHEME</p>
                <div className={`${transactionHash.length > 0 ? "block relative" : "hidden"}`}>
                    <p className="text-2xl">{transactionHash}</p>
                    <p><a href={`https://kovan.etherscan.io/tx/${transactionHash}`} target="_blank">Search on Kovan Etherscan</a></p>
                </div>

                <p className={`text-xl text-gray-600 ${fileInfo.name ? 'hidden' : 'block'}`}>Based on Game of Theory, Oracle, Blockchain, Merkle tree...&#127799</p>
            </div>


            {/* </div> */}
            {
                fileInfo.name ?
                    (
                        <div className='grid grid-rows-auto grid-cols-auto text-center' >
                            <div className='grid grid-cols-9 row-span-2 gap-12 px-40'>
                                <div className="col-span-4">
                                    <p className='relative top-3 bg-white m-auto w-32 z-10'>Basic Info</p>
                                    <div className='relative text-left border-dashed border-2 border-black rounded-lg px-20 py-14 bg-white'>
                                        <p>File Name: {fileInfo.name}</p>
                                        <p>File Size: {fileInfo.size} bytes ({(fileInfo.size / 1024).toFixed(2)} KB)</p>
                                        <p>Merkle Slices: {Math.round(fileInfo.size / 16) + 1} pieces</p>
                                        <p>Last Modi: {`${new Date(fileInfo.lastModified)}`}</p>
                                    </div>
                                </div>
                                <div className="col-span-5 mt-5">
                                    <div className="grid grid-rows-5">
                                        <Alert
                                            message="Merkle Root"
                                            description={fileInfo.merkle}
                                            type="info"
                                            showIcon
                                        />
                                        <div className="mt-4">
                                            <Button type="primary" onClick={connect} icon={<RiseOutlined />} block loading={chainLoading}>
                                                Link to The Chain!
                                            </Button>
                                            {
                                                transactionHash.length > 0 ? (
                                                    <Button className="mt-4" type="primary" onClick={downloadFile} icon={<DownloadOutlined />} block>
                                                        Click to download whole file
                                                    </Button>
                                                ) : (<></>)
                                            }

                                        </div>
                                    </div>
                                </div>
                            </div>
                            {
                                transactionHash.length > 0 ? (
                                    <div className="-mt-32">
                                    <InputNumber min={1} max={Math.round(fileInfo.size / 16) + 1} defaultValue={1} onChange={getChallengePiece} />
                                    <Button className="mt-4 ml-4" type="primary" onClick={challengeSlice} icon={<WarningOutlined />} loading={challengeLoading}>
                                        CHALLENGE
                                    </Button>
                                    {((challengePieceFileName.length > 0) && (challengeResult)) ? (
                                        <Button className="mt-4 ml-4" type="primary" onClick={downloadChallengeFile} icon={<DownloadOutlined />} >
                                            Download Piece
                                        </Button>
                                    ) : (<></>)}
                                    {challengePieceFileName.length > 0 ? (
                                        <div className="mt-4">
                                            <p>Transaction Hash is: {chaTransactionHash}</p>
                                            <p>The server has <span className={`${challengeResult ? "hidden" : "inline-block text-red-300"}`}>NOT</span> passed the test.</p>
                                            <p className={`${challengeResult ? "hidden" : "inline-block text-red-300"}`}>The server will be punished after this transaction has been confirmed by 100 blocks.</p>
                                        </div>
                                    ) : (<></>)}
                                </div>): (<></>)
                            }
                    
                        </div>

                    ) : (
                        <div className="row-span-1 flex justify-center items-center">
                            <div className="block  w-1/4">
                                <Upload style={{ background: "transparent" }} className='' trigger={getFileInfo} />
                            </div>
                        </div>

                    )
            }
        </div>
    )
}
// Candara
export default App




