const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledDistribution = require('./build/Distribution.json');

const provider = new HDWalletProvider(
  'acid pause ready average slush glad slide smoke test silver junk rug',
  'https://rinkeby.infura.io/v3/74b79e3d23e64a16891ae236b04b4ef5'
);

const web3 = new Web3(provider);
const deploy = async () => {
  const accounts  = await web3.eth.getAccounts();
  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(compiledDistribution.interface))
  .deploy({data:'0x' + compiledDistribution.bytecode, arguments: [1,5,2,2]})
  .send({gas:'1000000', from: accounts[0]});

  console.log('Contract deployed to', result.options.address);

};
deploy();
