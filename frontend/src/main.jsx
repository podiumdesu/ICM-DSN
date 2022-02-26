import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { Buffer } from 'buffer'
import 'antd/dist/antd.css';

window.Buffer = Buffer

import { Web3ReactProvider, useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import MetamaskProvider from './components/MetamaskProvider/index'

function getLibrary(provider) {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <MetamaskProvider>
      <App />
    </MetamaskProvider>
  </Web3ReactProvider>,
  document.getElementById('root')
)
