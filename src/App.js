import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import './App.css';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import { useEffect, useState } from "react";

import whitelist from './wl/whitelist.json';

function App() {
  const [root, setRoot] = useState('');
  const [outdata, setOutdata] = useState('');
  const [address, setAddress] = useState('');
  
  const notificationfunc = (type, message) => {
    switch (type) {
      case 'info':
        NotificationManager.info(message);
        break;
      case 'success':
        NotificationManager.success(message);
        break;
      case 'warning':
        NotificationManager.warning(message, 'Warning', 3000);
        break;
      case 'error':
        NotificationManager.error(message, 'Error', 3000);
        break;
      default:
        break;
    }
  }

  const buf2hex = x => '0x'+x.toString('hex')

  const getRoot = () => {
    const { MerkleTree } = require('merkletreejs')
    const keccak256 = require('keccak256');
    const { soliditySha3 } = require("web3-utils");
    const { BN } = require("bn.js");

    const wlUsers = whitelist;

    const leaves = [];
    var index = 0;
    for (var key in wlUsers) {
      leaves.push(soliditySha3( {t: 'address', v: key}, {t: 'uint8', v: wlUsers[key]}, {t: 'uint256', v: index} ));
      index++;
    }

    const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
    const root_ = tree.getRoot().toString('hex');
    const root = tree.getRoot();
    const hexroot = buf2hex(root);

    setRoot(hexroot);
  };

  const getProofs = () => {
    if (address == '') {
      notificationfunc('error', 'input address'); return;
    }

    const { MerkleTree } = require('merkletreejs')
    const keccak256 = require('keccak256');
    const { soliditySha3 } = require("web3-utils");
    const { BN } = require("bn.js");

    const wlUsers = whitelist;

    var is_whitelist = false;
    var mint_type = "";
    var my_index = 0;
    for (var wallet in wlUsers) {
      if (address == wallet) {
        mint_type = wlUsers[wallet];
        is_whitelist = true;
        break;
      }
      my_index++;
    }

    if (!is_whitelist) {
      notificationfunc('error', 'Address is not in whitelist'); 
      setOutdata("");
      return;
    }

    const leaves = [];
    var index = 0;
    for (var key in wlUsers) {
      leaves.push(soliditySha3( {t: 'address', v: key}, {t: 'uint8', v: wlUsers[key]}, {t: 'uint256', v: index} ));
      index++;
    }

    const tree = new MerkleTree(leaves, keccak256, {sortPairs: true});
    const root_ = tree.getRoot().toString('hex');
    const root = tree.getRoot();
    const hexroot = buf2hex(root);

    console.log("root-- ", hexroot, root_);

    const leaf = soliditySha3({t: 'address', v: address}, {t: 'uint8', v: mint_type}, {t: 'uint256', v: my_index});
    let proof = tree.getProof(leaf);
    let hexProof = tree.getHexProof(leaf);

    let proofString = "[";
    hexProof.map(v => {
      proofString += "\"" + v + "\",\n";
      return v;
    });
    proofString = proofString.substring(0, proofString.length - 2);
    proofString += "]";

    setOutdata("index:" + my_index + "\n" + "Mint_type:" + mint_type + "\n" + "Proofs:" +proofString);
  };

  useEffect(() => {
    
  }, []);

  return (
    <div className="App">
      <div className="container-fluid main-container">
        <div className="container">
          <div className="sub-container">
            <div className="title" >Merkle root</div>
            <input className="" type="text" value={root} />
            <div className="mint-wrapper" >
              <button type="button" className="form-mint" disabled="" onClick={()=> getRoot()}>GetRoot</button>
            </div>
          </div>
          
          <div className="sub-container">
            <div className="title" >Address</div>
            <input className="" type="text" value={address} onChange={(e) => setAddress(e.target.value)}/>
            <div className="mint-wrapper" >
              <button type="button" className="form-mint" onClick={()=> getProofs()}>GetProofs</button>
            </div>
          </div>

          <div className="sub-container">
            <div className="title" >Proofs info</div>
            <textarea  type="text" value={outdata}></textarea>
            <div className="mint-wrapper" >
              
            </div>
          </div>
          
        </div>
            
        
      </div>
      <NotificationContainer/>
    </div>
  );
}

export default App;
