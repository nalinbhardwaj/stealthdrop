const snarkjs = require("snarkjs");
const ffjavascript = require("ffjavascript");
const fs = require("fs");

const {stringifyBigInts: stringifyBigInts$3, unstringifyBigInts: unstringifyBigInts$1} = ffjavascript.utils;

// copy pasta p256 from snarkjs cli.cjs line 6726
function p256(n) {
  let nstr = n.toString(16);
  while (nstr.length < 64) nstr = "0"+nstr;
  nstr = `0x${nstr}`;
  return nstr;
}

async function genSolidityCalldata(publicName, proofName) {
    const pub = unstringifyBigInts$1(publicName);
    const proof = unstringifyBigInts$1(proofName);
  
    let inputs = [];
    for (let i=0; i<pub.length; i++) {
        inputs.push(p256(pub[i]));
    }
  
    if ((typeof proof.protocol === "undefined") || (proof.protocol != "groth16")) {
      throw new Error("InvalidProof");
    }
  
    let S = {
      'pi_a': [p256(proof.pi_a[0]), p256(proof.pi_a[1])],
      'pi_b': [[p256(proof.pi_b[0][1]), p256(proof.pi_b[0][0])], [p256(proof.pi_b[1][1]), p256(proof.pi_b[1][0])]],
      'pi_c': [p256(proof.pi_c[0]), p256(proof.pi_c[1])],
      'inputs': inputs,
    };
  
    return S;
  }

const main = async () => {
//   console.log("LOL");
  const inputFile = process.argv[2];
//   console.log("inputFile", inputFile);
  const rawInput = fs.readFileSync(inputFile, "utf8");
  const input = JSON.parse(rawInput);

  //   const { proof, publicSignals } = await snarkjs.groth16.fullProve(
  //     input,
  //     "./circuit.wasm",
  //     "./circuit.zkey"
  //   );

  //   const genCalldata = await genSolidityCalldata(publicSignals, proof);
    const randomNumber = Math.floor(Math.random() * 1000000000);
  console.log(randomNumber.toString());
};

main();
