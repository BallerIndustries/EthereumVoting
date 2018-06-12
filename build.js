const fs = require('fs');
const Web3 = require('web3');
const solc = require('solc');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

function compileCode() {
    // Load up the code
    const code = fs.readFileSync('Voting.sol').toString();
    const compiledCode = solc.compile(code);

    if (compiledCode.errors !== undefined) {
        compiledCode.errors.forEach(it => console.log(it));
        return;
    }

    console.log("Successfully compiled Voting.sol");
    return compiledCode;
}

function deployContract(compiledCode) {
    const abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface);
    const VotingContract = web3.eth.contract(abiDefinition);

    const byteCode = compiledCode.contracts[':Voting'].bytecode;
    const options = {data: byteCode, from: web3.eth.accounts[0], gas: 4700000};

    return new Promise((resolve, reject) => {
        VotingContract.new(['Rama', 'Nick', 'Jose'], options, function(error, deployedContract) {
            if (error) {
                return reject(error);
            }

            if (deployedContract.address !== undefined) {
                const contractInstance = VotingContract.at(deployedContract.address);
                resolve(contractInstance);
                console.log('Successfully deployed Voting.sol');
            }
        });
    });
}

async function main() {
    const compiledCode = compileCode();
    const instance = await deployContract(compiledCode);

    // How many votes does Rama have?
    console.log('Votes for Rama ' + instance.totalVotesFor.call('Rama').toLocaleString());

    // Vote for Rama
    instance.voteForCandidate('Rama', { from: web3.eth.accounts[0]});
    console.log('Angus Cheng voted for Rama');

    // How many does he have now?
    console.log('Votes for Rama ' + instance.totalVotesFor.call('Rama').toLocaleString());
}

main();
















