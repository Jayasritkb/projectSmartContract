import React, { Component } from 'react';
import { Form, Button, Input, Message } from 'semantic-ui-react';
import distribution from '../../ethereum/distribution.js';
import Layout from '../../components/Layout.js';
import web3js from '../../ethereum/web3.js';
import { Link, Router }  from '../../routes.js';

class UpstreamPlayerRegister extends Component {
  state = {
    inventory: '',
    errorMessage: '',
    loading: false
  };
   onSubmit = async(event) => {
    event.preventDefault();
    const accounts = await web3js.eth.getAccounts();
    const currentAccount = accounts[0];
    try{
      this.setState({loading : true});
      console.log("Inventory value is ---> " + this.state.inventory);
    await distribution.methods
    .registerAsUpstreamPlayer(this.state.inventory)
    .send({
      from: currentAccount
    });
    console.log("registered successfully as upstream player!");
  }
  catch(err){
    console.log("errorMessage is " + err.message);
    this.setState({errorMessage: err.message});
  }
  this.setState({loading: false});
  Router.pushRoute('/upstreamplayer/view');
};
  static async getInitialProps(){
    const week = await distribution.methods.getWeekValue().call();
    const delay = await distribution.methods.getDelayValue().call();
    const avgDemand = await distribution.methods.getWeeklyAverageDemandValue().call();
    return{week, delay,avgDemand };
  }
  render(){
    return (
      <Layout week= {this.props.week} delay={this.props.delay} avgDemand={this.props.avgDemand}   >
    <h2> Please enter your current inventory below and register as upstream player</h2>
    <Form onSubmit = {this.onSubmit} error= {!!this.state.errorMessage}>
    <Form.Field>
    <label>Current Inventory:</label>
    <Input maxLength = "10" label = "units" labelPosition = "right" value = {this.state.inventory} onChange = {event => this.setState({inventory:event.target.value})}/>
      </Form.Field>
      <Message error header = "Oops! Error Occured" content = {this.state.errorMessage} />
      <Button primary floated = "left" loading = {this.state.loading} content = "Register as upstream player!"/>
      </Form>
      </Layout>);
  };

}


export default UpstreamPlayerRegister;
