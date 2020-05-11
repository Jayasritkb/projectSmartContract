import React, { Component } from 'react';
import distribution from '../ethereum/distribution.js';
import Layout from '../components/Layout.js';
import web3js from '../ethereum/web3.js';
import Router  from '../routes.js';
import { Link }  from '../routes.js';

class Register extends Component {

  static async getInitialProps(){
    const week = await distribution.methods.getWeekValue().call();
    const delay = await distribution.methods.getDelayValue().call();
    const avgDemand = await distribution.methods.getWeeklyAverageDemandValue().call();
    return{week, delay, avgDemand};
  }

  render(){
    return (
      <Layout week= {this.props.week} delay={this.props.delay} avgDemand={this.props.avgDemand}  >
      <h1> There are no players currently registered for this contract! < /h1>,
    <h2> To register as a downstream player,  <Link route = '/downstreamplayer/register'>click here</Link></h2>,
    <h2> To register as a upstream player,  <Link route = '/upstreamplayer/register' >click here</Link></h2>
  </Layout>);
  };

}

export default Register;
