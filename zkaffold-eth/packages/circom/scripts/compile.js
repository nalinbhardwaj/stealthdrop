require("dotenv").config();

const { execSync } = require("child_process");
const fs = require("fs");

let circuitsList = process.argv[2];
const deterministic = false;
const contributingExtraRandomness = true;
// process.argv[3] === "true" || process.argv[3] === undefined;

// TODO: add an option to generate with entropy for production keys

if (process.argv.length < 3 || process.argv.length > 4) {
  console.log("usage");
  console.log("compile comma,seperated,list,of,circuits [`true` if deterministic / `false` if not]");
  process.exit(1);
}

const cwd = process.cwd();
console.log(cwd);

if (circuitsList === "-A" || circuitsList === "--all") {
  try {
    circuitsList = fs
      .readdirSync(cwd + "/circuits", { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .join();

    console.log("Compiling all circuits...");
    console.log(circuitsList);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

for (circuitName of circuitsList.split(",")) {
  if (!process.env["beacon"]) {
    console.log("ERROR! you probably dont have an .env file");
    process.exit(1);
  }

  console.log("\nCompiling and sorting files for circuit: " + circuitName + "...");

  process.chdir(cwd + "/circuits/" + circuitName);

  if (!fs.existsSync("compiled")) {
    fs.mkdirSync("compiled");
  }
  if (!fs.existsSync("contracts")) {
    fs.mkdirSync("contracts");
  }
  if (!fs.existsSync("inputs")) {
    fs.mkdirSync("inputs");
  }
  if (!fs.existsSync("keys")) {
    fs.mkdirSync("keys");
  }

  // doesnt catch yet
  // https://github.com/iden3/snarkjs/pull/75
  // node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs ->
  // node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs`

  try {
    execSync("circom circuit.circom --r1cs --wasm --sym", { stdio: "inherit" });
    execSync("node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs r1cs info circuit.r1cs", { stdio: "inherit" });
    execSync("cp circuit_js/circuit.wasm circuit.wasm", { stdio: "inherit" });
    execSync("node circuit_js/generate_witness.js circuit.wasm inputs/input_0.json witness.wtns", {
      stdio: "inherit",
    });
    console.log("starting beefy boy");
    let zkeyOutputName = "circuit";
    if (contributingExtraRandomness) {
      zkeyOutputName = "circuit_0";
    }
    execSync(
      `node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs groth16 setup circuit.r1cs ../../powersoftau/powersOfTau28_hez_final_24.ptau ${zkeyOutputName}.zkey`,
      { stdio: "inherit" }
    );
    console.log("ending beefy boy");
    if (contributingExtraRandomness) {
      if (deterministic) {
        execSync("node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs zkey beacon circuit_0.zkey circuit.zkey " + process.env["beacon"] + " 10", {
          stdio: "inherit",
        });
      } else {
        execSync("node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs zkey contribute circuit_0.zkey circuit.zkey " + `-e="${Date.now()}"`, {
          stdio: "inherit",
        });
      }
    }
    execSync("node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs zkey verify circuit.r1cs ../../powersoftau/powersOfTau28_hez_final_24.ptau circuit.zkey", {
      stdio: "inherit",
    });
    execSync("node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs zkey export verificationkey circuit.zkey keys/verification_key.json", {
      stdio: "inherit",
    });
    execSync("node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs groth16 prove circuit.zkey witness.wtns proof.json public.json", { stdio: "inherit" });
    execSync("node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs groth16 verify keys/verification_key.json public.json proof.json", { stdio: "inherit" });

    fs.copyFileSync("circuit.wasm", cwd + "/circuits/" + circuitName + "/compiled/circuit.wasm");
    fs.unlinkSync("circuit.wasm");
    fs.copyFileSync("circuit.zkey", cwd + "/circuits/" + circuitName + "/keys/circuit_final.zkey");
    fs.unlinkSync("circuit.zkey");

    execSync("node --max-old-space-size=614400 ./../../node_modules/.bin/snarkjs zkey export solidityverifier keys/circuit_final.zkey contracts/verifier.sol", {
      stdio: "inherit",
    });
    // copy files to appropriate places when integrated with scaffold-eth (zkaffold-eth)
    fs.copyFileSync("contracts/verifier.sol", cwd + "/../hardhat/contracts/" + circuitName + "Verifier.sol");

    if (!fs.existsSync(cwd + "/../react-app/src/circuits/")) {
      fs.mkdirSync(cwd + "/../react-app/src/circuits/");
    }
    fs.copyFileSync("compiled/circuit.wasm", cwd + "/../react-app/src/circuits/" + circuitName + "_circuit.wasm");
    fs.copyFileSync("keys/circuit_final.zkey", cwd + "/../react-app/src/circuits/" + circuitName + "_circuit_final.zkey");
    fs.copyFileSync("keys/verification_key.json", cwd + "/../react-app/src/circuits/" + circuitName + "_verification_key.json");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
