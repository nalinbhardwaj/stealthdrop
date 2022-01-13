pragma circom 2.0.2;

include "../merkle/withdraw.circom";
include "../secp256k1/ecdsa.circom";

template Main(n, k, levels) {
    signal input r[k];
    signal input s[k];
    signal input msghash[k];
    signal input pubkey[2][k];
    signal input root[k];
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal output nullifierHash;

    component sigVerify = ECDSAVerify(n, k);
    for (var i = 0;i < k;i++) {
        sigVerify.r[i] <== r[i];
        sigVerify.s[i] <== s[i];
        sigVerify.msghash[i] <== msghash[i];
        for (var j = 0;j < 2;j++) sigVerify.pubkey[j][i] <== pubkey[j][i];
    }

    component withdrawal = Withdraw(levels, k);
    withdrawal.root <== root;
    for (var i = 0;i < k;i++) {
        withdrawal.r[i] <== r[i];
        withdrawal.s[i] <== s[i];
        for (var j = 0;j < 2;j++) withdrawal.pubkey[j][i] <== pubkey[j][i];
    }
    for (var i = 0;i < levels;i++) {
        withdrawal.pathElements[i] <== pathElements[i];
        withdrawal.pathIndices[i] <== pathIndices[i];
    }
    nullifierHash <== withdrawal.nullifierHash;
}

component main = Main(86, 3, 20);