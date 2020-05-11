import React, {Component} from 'react';
import distribution from '../ethereum/distribution.js';
import web3js from '../ethereum/web3.js';
import Layout from '../components/Layout.js';
import { Link, Router}  from '../routes.js';


class DistributionIndex extends Component{
static async getInitialProps(){
  const week = await distribution.methods.getWeekValue().call();
  const delay = await distribution.methods.getDelayValue().call();
  const avgDemand = await distribution.methods.getWeeklyAverageDemandValue().call();

  const downstreamPlayer = await distribution.methods.downstreamPlayer().call();
  const upstreamPlayer = await distribution.methods.upstreamPlayer().call();
  const accounts = await web3js.eth.getAccounts();
  const currentAccount = accounts[0];

  const currentPlayerDownstream = this.isCurrentPlayerDownstream(downstreamPlayer, currentAccount);
  const currentPlayerUpstream = this.isCurrentPlayerUpstream(upstreamPlayer, currentAccount);
  const isDownstreamPlayerEmpty = this.isDownstreamPlayerEmpty(downstreamPlayer);
  const isUpstreamPlayerEmpty = this.isUpstreamPlayerEmpty(upstreamPlayer);

  let route;
  let welcomeMessage;
  if(isDownstreamPlayerEmpty !== undefined && isUpstreamPlayerEmpty !== undefined){
    route = '/registerTwo';
    welcomeMessage = "Please register as one of the following roles: Downstream player or Upstream player";
    console.log("Inside ---> 1" );
  }
  else if(currentPlayerDownstream !== undefined){
  //Router.pushRoute('downstreamplar/view');
    route = 'downstreamplayer/view';
    welcomeMessage = "Welcome to the smart contract application, your role is downstream";
    console.log("Inside ---> 2" );
  }
  else if(currentPlayerUpstream !== undefined){
  //Router.pushRoute('upstreamplayer/view');
    route = 'upstreamplayer/view';
    welcomeMessage = "Welcome to the smart contract application, your role is upstream";
    console.log("Inside ---> 3" );
  }
  else if(isUpstreamPlayerEmpty !== undefined){
      route = 'upstreamplayer/register';
      welcomeMessage = "Welcome to the smart contract application, this contract has a registered downstream player. You can register yourself as an upstream player";
      console.log("Inside ---> 4" );
  }
  else if(isDownstreamPlayerEmpty !== undefined){
    route = 'downstreamplayer/register';
    welcomeMessage = "Welcome to the smart contract application, this contract has a registered downstream player. You can register yourself as downstream player";
    console.log("Inside ---> 5" );
  }
  else{
      route = '/';
      welcomeMessage = "Welcome to the smart contract application, please refresh this page!";
  }
  console.log("avgDemand ---> "  + avgDemand);
  return{week, delay, route, avgDemand, welcomeMessage  };
}

static isCurrentPlayerDownstream(downstreamPlayer, currentAccount ){
  const downstreamPlayerAddress = downstreamPlayer.playerAddress;
  if(downstreamPlayerAddress === currentAccount){
    console.log("Current Player is downstream player" );
    return  "downstream";
  }
}

static isCurrentPlayerUpstream(upstreamPlayer, currentAccount){
  const upstreamPlayerAddress = upstreamPlayer.playerAddress;
  if(upstreamPlayerAddress === currentAccount){
    console.log("Current Player is upstream player" );
      return  "upstream";
  }
}
static isDownstreamPlayerEmpty(downstreamPlayer){
  const address = downstreamPlayer.playerAddress;
  const emptyAddress = /^0x0{40}$/.test(address);
  console.log("emptyAddress inside isDownstreamPlayerEmpty  ==" + emptyAddress);
  if(emptyAddress){return "down stream player is empty";}

}
static isUpstreamPlayerEmpty(upstreamPlayer){
  const address = upstreamPlayer.playerAddress;
  const emptyAddress = /^0x0{40}$/.test(address);
  console.log("emptyAddress inside isUpstreamPlayerEmpty  ==" + emptyAddress);
  if(emptyAddress){return "up stream Player is empty";}
}
  render(){
    return (
  <Layout week= {this.props.week} delay={this.props.delay}  avgDemand={this.props.avgDemand} >
  <div>
<h2 align = "center">{this.props.welcomeMessage}. Please <Link route = {this.props.route} >click here</Link></h2>

</div>
</Layout>
  );

}
}

export default DistributionIndex;
