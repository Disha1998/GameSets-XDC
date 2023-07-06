import React, { useState, createContext, useEffect, useRef } from "react";
import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import { RandomPrompts } from "../components/RandomImgs";
import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
export const SupercoolAuthContext = createContext(undefined);

export const SupercoolAuthContextProvider = (props) => {

  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allNfts, setAllNfts] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [genRanImgLoding, setGenRanImgLoding] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    getSignerFromProvider();
  }, [])

  const firebaseConfig = {
    apiKey: "AIzaSyACmZRLNeoQBupHPFhCTPYfXWlKQn3AD-g",
    authDomain: "gamesets-patex.firebaseapp.com",
    projectId: "gamesets-patex",
    storageBucket: "gamesets-patex.appspot.com",
    messagingSenderId: "485145456898",
    appId: "1:485145456898:web:bd556069574de296bcd21b"
  };
  

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const firestore = getFirestore();
  const collectionRef = collection(firestore, "TokenUri");
  const UserProfileRef = collection(firestore, "UserProfile");

  async function storeDataInFirebase(metadata) {
    const docRef = await addDoc(collectionRef, metadata);
    console.log("Data stored successfully! Document ID:", docRef.id);
  }

  const updateForPurchase = async (tokenId) => {
    const q = query(
      collection(db, "TokenUri"),
      where("tokenId", "==", tokenId)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((fire) => {
      const data = {
        owner: localStorage.getItem('address'),
      };
      const dataref = doc(db, "TokenUri", fire.id);
      updateDoc(dataref, data);
    })
  }

  async function getSignerFromProvider() {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
    } else {
      console.log('No wallet connected or logged out');
    }
  }


  const login = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
        setWalletConnected(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem('address', accounts[0]);
      }

      if (window.ethereum.networkVersion === '80001') {
        setWalletConnected(true);
      } else {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '51' }] // Apothem-XDC chain ID
        });
        setWalletConnected(true);
      }

      if (ethereum && ethereum.selectedAddress) {
        const address = await signer.getAddress();

      } else {
        console.log('No wallet connected or logged out');
      }
      getAllNfts();
    } catch (error) {
      console.error('Login error:', error);
    }
    getAllNfts();
  }

  const logout = async () => {
    localStorage.removeItem('address');
    setWalletConnected(false);
  }

  const auth =
    "Basic " +
    Buffer.from(
      process.env.infuraProjectKey + ":" + process.env.infuraSecretKey
    ).toString("base64");

  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });


  const GenerateNum = () => {
    const index = Math.floor(Math.random() * RandomPrompts.length);
    setPrompt(RandomPrompts[index])
  };

  
  async function getAllNfts() {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const data = querySnapshot.docs.map((doc) => doc.data());
      let allnfts = [];
      for (let i = 0; i < data.length; i++) {
        let item = data[i];
        allnfts.push(item);
        setAllNfts(allnfts);
      }
      console.log('all nfts--',allnfts);
    } catch (error) {
      console.error("Error fetching data: ", error);
      return [];
    }
  }

  useState(() => {
    setTimeout(() => {
      getAllNfts()
    }, 5000);
  }, [loading])

  const uploadOnIpfs = async (e) => {
    let dataStringify = JSON.stringify(e);
    const ipfsResult = await client.add(dataStringify);
    const contentUri = `https://superfun.infura-ipfs.io/ipfs/${ipfsResult.path}`;

    return contentUri;
  }

  const handleImgUpload = async (file) => {
    const added = await client.add(file);
    const hash = added.path;
    const ipfsURL = `https://superfun.infura-ipfs.io/ipfs/${hash}`;
    return ipfsURL;
  };

  const generateText = async (detailPrompt) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/text-davinci-003/completions',
        {
          prompt: detailPrompt,
          max_tokens: 700,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setPrompt(response.data.choices[0].text);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <SupercoolAuthContext.Provider
      value={{
        login,
        logout,
        uploadOnIpfs,
        allNfts,
        handleImgUpload,
        client,
        loading,
        setLoading,
        GenerateNum,
        prompt,
        setPrompt,
        genRanImgLoding,
        getAllNfts,
        generateText,
        storeDataInFirebase,
        provider,
        updateForPurchase,
        UserProfileRef,
        db,
        walletConnected
      }}
      {...props}
    >
      {props.children}
    </SupercoolAuthContext.Provider>
  );
};
