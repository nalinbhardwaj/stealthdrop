import stringify from "fast-json-stable-stringify";
import styled from "styled-components/macro";

import React from "react";
import { useState } from "react";
import { generateProof } from "../GenerateProof";
import { isEligible } from "../AirdropData";
import { Heading1 } from "./lolcss";
import { useMemo } from "react";
import { Address } from ".";

const signText = "ZK Airdrop: Sign this message to withdraw your ZK tokens";

export default function Withdraw({ signer, address, web3Modal, loadWeb3Modal, mainnetProvider }) {
  const [signature, setSignature] = useState();
  const [proof, setProof] = useState();
  const [step, setStep] = useState(1);

  const signMessage = async () => {
    console.log("signer", signer);
    const msgTransaction = await signer.signMessage(signText);
    console.log("msgTransaction", msgTransaction);
    setSignature({ sign: msgTransaction, address });
  };

  const generateZKProof = async () => {
    if (!signature) {
      return;
    }
    const lol = await generateProof();
    setProof({ a: 0, b: 0, c: 0, merkleRoot: "0x239839aBcd", nullifierHash: "lol" });
  };

  const eligibility = useMemo(() => {
    const adr = signature?.address || address;
    if (!adr) {
      return null;
    }
    return isEligible(adr);
  }, [signature, address]);

  return (
    <div style={{ margin: "auto", width: "70vw", display: "flex", flexDirection: "column", padding: "16px" }}>
      <Box onClick={() => setStep(1)}>
        <Heading>1. Connect Public Wallet</Heading>
        <Collapse collapsed={step != 1}>
          <Tekst>Connect the account associated with airdrop</Tekst>
          <Bootoon
            key="loginbutton"
            style={{ verticalAlign: "top", marginLeft: 8, marginTop: 4 }}
            shape="round"
            size="large"
            onClick={loadWeb3Modal}
            disabled={!!address}
          >
            {web3Modal && web3Modal.cachedProvider ? "Connected!" : "Connect"}
          </Bootoon>
          {address && (
            <Tekst>
              Connected to{" "}
              {<Address color={tekstcolor} size={teskstsize} address={address} ensProvider={mainnetProvider} />}
            </Tekst>
          )}
          {eligibility !== null && <Tekst>{eligibility ? "Eligibile ✅" : "Not Eligibile :("}</Tekst>}
        </Collapse>
      </Box>
      <Box onClick={() => setStep(2)}>
        <Heading>2. Sign Message</Heading>
        <Collapse collapsed={step != 2}>
          <Bootoon onClick={signMessage} disabled={!!signature?.sign}>
            {!!signature?.sign ? "Signed!" : "Generate Signed Message"}
          </Bootoon>
        </Collapse>
      </Box>

      <Box onClick={() => setStep(3)}>
        <Heading>3. Connect Anonymous Wallet</Heading>

        <Collapse collapsed={step != 3}>
          {!!address && address === signature?.address && (
            <Tekst>
              Right now you are connected to your public wallet. Switch to a new wallet to preserve anonymity
            </Tekst>
          )}
          {!!address && address !== signature?.address && (
            <Tekst>You are now connected to a seperate account. The tokens will be sent to this account.</Tekst>
          )}
          {!address && <Tekst>Not connected to any account. Switch your account through your wallet</Tekst>}
        </Collapse>
      </Box>

      <Box onClick={() => setStep(4)}>
        <Heading>4. Prove Ownership</Heading>
        <Collapse collapsed={step != 4}>
          <Tekst>Generate Proof to withdraw to {address}</Tekst>
          <Bootoon onClick={generateZKProof}>Generate</Bootoon>
          <Tekst>Proof: {stringify(proof)}</Tekst>
        </Collapse>
      </Box>

      <Box onClick={() => setStep(5)}>
        <Heading>5. Claim</Heading>
        <Collapse collapsed={step != 5}>
          <Bootoon>Claim Token</Bootoon>
        </Collapse>
      </Box>
    </div>
  );
}

const tekstcolor = "#bfbfbf";
const teskstsize = "18px";

const Tekst = styled.div`
  display: block;
  font-size: ${teskstsize};
  color: ${tekstcolor};
  font-weight: 400;
`;

const Collapse = styled.div`
  display: ${p => (p.collapsed ? "none" : "block")};

  transition: all 0.2s ease;
`;
// max-height: ${p => (p.collapsed ? "0" : "100%")};
// overflow: ${p => (p.collapsed ? "hidden" : "initial")};

const Box = styled.div`
  margin: 4px;
  border: 2px solid #4ce90c69;
  border-radius: 12px;
  padding: inherit;
  background: #6773b38a;
`;

const Heading = styled(Heading1)`
  font-weight: 600;
  text-align: left;
  background: linear-gradient(to right, #4ce90c69, #4ce90c69);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Bootoon = styled.button`
  background-color: #4ce90c69;
  border: 1px solid #4ce90c69;
  border-radius: 18px;
  color: white;
  font-family: sans-serif;
  font-size: 18px;
  padding: 12px 32px;
  margin: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  :hover {
    box-shadow: rgba(111, 76, 255, 0.5) 0px 0px 20px 0px;
    transition: all 0.3s ease;
  }
`;

// const Bootoon = styled.button`
//   background-image: linear-gradient(to right, rgb(1 134 218), rgb(182 49 167));
//   border: 0;
//   color: white;
//   font-family: sans-serif;
//   font-size: 18px;
//   padding: 12px 32px;
//   margin: 1rem;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   border-radius: 18px;

//   :hover {
//     box-shadow: rgba( 111,76,255, 0.5) 0px 0px 20px 0px;
//     transition: all 0.3s ease;
//   }
// `;
