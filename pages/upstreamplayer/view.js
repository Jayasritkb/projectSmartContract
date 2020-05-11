import React, { Component } from 'react';
import { Card, Grid,Form, Button, Input, Message} from 'semantic-ui-react';
import distribution from '../../ethereum/distribution.js';
import Layout from '../../components/Layout.js';
import web3js from '../../ethereum/web3.js';
import { Link, Router}  from '../../routes.js';

class UpstreamPlayerView extends Component {
  state = {
    orderQuantity: '',
    errorMessage: '',
    loading: false
  };

onSubmit = async(event) => {
 event.preventDefault();
 const accounts = await web3js.eth.getAccounts();
 const currentAccount = accounts[0];
 const week = await distribution.methods.getWeekValue().call();
 try{
   this.setState({loading : true});
  console.log("inside onSubmitPlaceOrder");
  const upstreamOrdersPlaced = await distribution.methods.upstreamOrdersPlaced(week).call();
  if(upstreamOrdersPlaced == false){
   const orderQuantity = this.state.orderQuantity;
    console.log("orderQuantity is ---> " + orderQuantity);
   if(orderQuantity > 0){
     console.log("OrderQuantity value is just before submitting---> " + this.state.orderQuantity);
     await distribution.methods
   .fulfillAndPlaceNewOrdersUpstream(this.state.orderQuantity)
   .send({
     from: currentAccount
   });
   console.log("Placed order successfully for upstream player!");
 }
 else{
   this.setState({loading: false});
   const errorMessage = "Order quantity is zero,  please enter some value ";
   this.setState({errorMessage1: errorMessage});
 }

 }
 else{
   this.setState({loading: false});
   const errorMessage = "Order is already placed for this week";
   this.setState({errorMessage1: errorMessage});
 }

    const downstreamOrdersPlaced = await distribution.methods.downstreamOrdersPlaced(week).call();
     if(downstreamOrdersPlaced == false){
       console.log("downstreamOrdersPlaced is ---> " + downstreamOrdersPlaced);
        Router.pushRoute('/upstreamplayer/status');
    }
    else{
      await distribution.methods.updateOrderAndIncrementToNextWeek().send({
        from: currentAccount
      });
       Router.pushRoute('/upstreamplayer/view');
    }
    this.setState({loading: false});
}
catch(err){
 this.setState({loading: false});
 console.log("errorMessage1 is " + err.message);
 this.setState({errorMessage1: err.message});
}
};
  static async getInitialProps(){
    const week = await distribution.methods.getWeekValue().call();
    const delay = await distribution.methods.getDelayValue().call();
    const avgDemand = await distribution.methods.getWeeklyAverageDemandValue().call();
    const upstreamPlayer = await distribution.methods.upstreamPlayer().call();
    const accounts = await web3js.eth.getAccounts();
    const currentAccount = accounts[0];
    const inventory = upstreamPlayer.inStock;
    const inPipeline = upstreamPlayer.inPipeline;
    const backlog = upstreamPlayer.backlog;
    const cummulativeCost = upstreamPlayer.cummulativeCost;
    const earnedCredits = upstreamPlayer.earnedCredits;

    const customerDemand = await distribution.methods.getUpstreamDemandForWeek().call();
    console.log("customerDemand is ---> " + customerDemand);
     const upstreamOrdersPlaced = await distribution.methods.upstreamOrdersPlaced(week).call();
  console.log("upstreamOrdersPlaced is ---> " + upstreamOrdersPlaced);
     let disabled = false;
     if(upstreamOrdersPlaced == true){
       disabled = true;
     }
  console.log("disabled is ---> " + disabled);
    return{week, delay,avgDemand, upstreamPlayer, inventory, inPipeline, backlog, cummulativeCost, earnedCredits,customerDemand, disabled};
  }
  renderCards(){
    const {
      inventory,
      inPipeline,
      backlog,
      cummulativeCost,
      earnedCredits
    } = this.props;

    const items = [
      {
        header:inventory,
        meta:'Units in stock',
        description:'Inventory details',
        style: { overflowWrap: 'break-word'}
      },
      {
        header:inPipeline,
        meta:'Units available in pipeline',
        description:'Pipeline/ in-transit inventory'

      },
      {
        header:backlog,
        meta:'Backlog Inventory',
        description:'Orders not fulfilled'

      },
      {
        header:cummulativeCost,
        meta:'Cummulative cost',
        description:'Total cost incurred so far'
      },
      {
        header:earnedCredits,
        meta:'Credits',
        description:'Total credits earned for helping to expedite orders'
      }
    ];
    return <Card.Group items ={items}/>;
  }
  render(){
    return (
      <Layout week= {this.props.week} delay={this.props.delay}   >
        <h1> This week's demand from customer is: {this.props.customerDemand} units!</h1>
      <Grid>
      <Grid.Column width = {10}>
      
      <br/>
      {this.renderCards()}
      </Grid.Column>
      <Grid.Column width = {6}>
      <Form onSubmit = {this.onSubmit} error= {!!this.state.errorMessage}>
      <Form.Field>
      <label>Order Quantity:</label>
      <Input
      label = "units"
      labelPosition = "right"
      value = {this.state.orderQuantity}
      onChange = {event => this.setState({orderQuantity:event.target.value})}/>
        </Form.Field>
        <Message error header = "Oops! Error occured" content = {this.state.errorMessage} />

        {this.props.disabled? (<Button primary floated = "left" loading = {this.state.loading} content = "Place Order!" disabled/>
      ): (<Button primary floated = "left" loading = {this.state.loading} content = "Place Order!"/>
      )}
        </Form>

      </Grid.Column>
      </Grid>
      </Layout>
    );
  };

}
export default UpstreamPlayerView;
