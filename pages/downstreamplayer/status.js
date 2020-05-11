import React, { Component } from 'react';
import distribution from '../../ethereum/distribution.js';
import Layout from '../../components/Layout.js';
import web3js from '../../ethereum/web3.js';
import { Router} from '../../routes.js';
import { Form, Button} from 'semantic-ui-react';


class DownstreamStatus extends Component {
  state = {
    errorMessage: '',
    loading: false
  };
   onSubmit = async(event) => {
    event.preventDefault();
    this.setState({loading: true});
    const accounts = await web3js.eth.getAccounts();
    const currentAccount = accounts[0];
      const week = await distribution.methods.getWeekValue().call();
    const upstreamOrdersPlaced = await distribution.methods.upstreamOrdersPlaced(week).call();
    console.log("upstreamOrdersPlaced ---> " + upstreamOrdersPlaced);
    if(upstreamOrdersPlaced == true){
      await distribution.methods.updateOrderAndIncrementToNextWeek().send({
        from: currentAccount
      });
      Router.pushRoute('/downstreamplayer/view');
    }
    else{
      this.setState({loading: false});
      Router.replaceRoute('/downstreamplayer/status');
    }
  };
  static async getInitialProps(){
    const week = await distribution.methods.getWeekValue().call();
    const delay = await distribution.methods.getDelayValue().call();
    const avgDemand = await distribution.methods.getWeeklyAverageDemandValue().call();
    return{week, delay, avgDemand};
  }

  render(){
    return (
      <Layout week= {this.props.week} delay={this.props.delay} avgDemand={this.props.avgDemand}  >
      <h1>Upstream Player has not submitted their order for this week!</h1>
      <br/>
      <h1>Please check again by clicking the button below:
      <Form onSubmit = {this.onSubmit} error= {!!this.state.errorMessage}>
        <Button primary floated = "left" loading = {this.state.loading} content ="Check Again!" />
        </Form>
      </h1>

  </Layout>);
  };

}

export default DownstreamStatus;
