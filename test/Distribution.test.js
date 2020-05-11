const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledDistribution = require('../ethereum/build/Distribution.json');

let distribution;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  //console.log("interface: " + compiledDistribution.interface);
  distribution = await new web3.eth.Contract(JSON.parse(compiledDistribution.interface))
  .deploy({data: compiledDistribution.bytecode, arguments:['1','5','2','2']})
  .send({from: accounts[0], gas: '1000000'})
});

describe('distribution Contract', () => {
  it('deploys a contract', () => {
    assert.ok(distribution.options.address);
  });

  it('Checks the week value', async () => {
      const weekValue = await distribution.methods.getWeekValue().call();
      assert.equal(weekValue, 1);
  });

  it('Checks the delay value', async () => {
    const delayValue = await distribution.methods.delay().call();
    assert.equal(delayValue, 2);
  });

  it('Checks the averageDemand value', async () => {
    const averageDemandValue = await distribution.methods.weeklyAverageDemand().call();
    assert.equal(averageDemandValue, 5);
  });

  it('Checks the averageDemand value', async () => {
    const stdDev = await distribution.methods.stdDev().call();
    assert.equal(stdDev, 2);
  });
});
