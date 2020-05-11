import web3js from './web3';
import distribution from './build/Distribution.json';

const instance = new web3js.eth.Contract(
  JSON.parse(distribution.interface),
  '0xabef0F752D484Fb1Db990842a7e9fEb2908313b9'
);

export default instance;
