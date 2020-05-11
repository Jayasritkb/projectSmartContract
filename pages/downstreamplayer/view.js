import React, { Component } from 'react';
import { Card, Grid,Form, Button, Input, Message} from 'semantic-ui-react';
import distribution from '../../ethereum/distribution.js';
import Layout from '../../components/Layout.js';
import web3js from '../../ethereum/web3.js';
import { Link, Router }  from '../../routes.js';
//import server from '../../server.js';

class DownstreamPlayerView extends Component {
  state = {
    orderQuantity: '',
    errorMessage1: '',
    errorMessage2: '',
    loading: false,
  };
   onSubmitPlaceOrder = async(event) => {
    event.preventDefault();
    const accounts = await web3js.eth.getAccounts();
    const currentAccount = accounts[0];
    const week = await distribution.methods.getWeekValue().call();
    try{
      this.setState({loading : true});
     console.log("inside onSubmitPlaceOrder");
     const downstreamOrdersPlaced = await distribution.methods.downstreamOrdersPlaced(week).call();
     if(downstreamOrdersPlaced == false){
      const orderQuantity = this.state.orderQuantity;
       console.log("orderQuantity is ---> " + orderQuantity);
      if(orderQuantity > 0){
        console.log("OrderQuantity value is just before submitting---> " + this.state.orderQuantity);
        await distribution.methods
      .fulfillAndPlaceNewOrdersDownstream(this.state.orderQuantity)
      .send({
        from: currentAccount
      });
      console.log("Placed order successfully for downstream player!");
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

       const upstreamOrdersPlaced = await distribution.methods.upstreamOrdersPlaced(week).call();
       console.log("upstreamOrdersPlaced is ---> " + upstreamOrdersPlaced);
        if(upstreamOrdersPlaced == false){
         Router.pushRoute('/downstreamplayer/status');
       }
       else{
         await distribution.methods.updateOrderAndIncrementToNextWeek().send({
           from: currentAccount
         });
          Router.pushRoute('/downstreamplayer/view');
       }
       this.setState({loading: false});
  }
  catch(err){
    this.setState({loading: false});
    console.log("errorMessage1 is " + err.message);
    this.setState({errorMessage1: err.message});
  }
};
onSubmitExpediteOrder = async(event) => {
 event.preventDefault();
 const accounts = await web3js.eth.getAccounts();
 const currentAccount = accounts[0];
  const week = await distribution.methods.getWeekValue().call();
 try{
   this.setState({loading : true});
   console.log("OrderQuantity value is ---> " + this.state.orderQuantity);
  console.log("this.state.button is ---> 2");
  const downstreamOrdersPlaced = await distribution.methods.downstreamOrdersPlaced(week).call();

  if(downstreamOrdersPlaced == false){
   const orderQuantity = this.state.orderQuantity;
   if(orderQuantity > 0){
     await distribution.methods
   .expediteNewOrder(this.state.orderQuantity)
   .send({
     from: currentAccount
   });
 }
 else{
   this.setState({loading: false});
   const errorMessage = "Order quantity is zero, please enter a some value";
   this.setState({errorMessage1: errorMessage});
 }

 }
 else{
   this.setState({loading: false});
   const errorMessage = "Order is already placed for this week";
   this.setState({errorMessage1: errorMessage});
 }
    console.log("this.state.week is ---> this.state.week");
    const upstreamOrdersPlaced = await distribution.methods.upstreamOrdersPlaced(week).call();
    console.log("upstreamOrdersPlaced is ---> " + upstreamOrdersPlaced);
     if(upstreamOrdersPlaced == false){
         Router.pushRoute('/downstreamplayer/status');
    }
    if(upstreamOrdersPlaced == true){
      console.log("before updateOrderAndIncrementToNextWeek");
      await distribution.methods.updateOrderAndIncrementToNextWeek().send({
        from: currentAccount
      });
    }
    console.log("Placed order successfully for downstream player!");
      this.setState({loading: false});
     Router.pushRoute('/downstreamplayer/view');
}
catch(err){
  this.setState({loading: false});
 console.log("errorMessage1 is " + err.message);
 this.setState({errorMessage1: err.message});
}
};

onSubmitExpeditePipeline = async(event) => {
 event.preventDefault();
 const accounts = await web3js.eth.getAccounts();
 const currentAccount = accounts[0];
 try{
   this.setState({loading : true});
   const downstreamPlayer = await distribution.methods.downstreamPlayer().call();
   const orderQuantity = downstreamPlayer.inPipeline;
   if(orderQuantity > 0){
      await distribution.methods
      .expeditePipelineOrder(this.state.orderQuantity)
      .send({
        from: currentAccount
      });
      console.log("Expedited pipeline order for downstream player!");
    }
    else{
      const errorMessage = "Pipeline quantity is zero, nothing to expetite!";
      this.setState({errorMessage2: errorMessage});
    }

}
catch(err){
 console.log("errorMessage2 is " + err.message);
 this.setState({errorMessage2: err.message});
}
this.setState({loading: false});
};
  static async getInitialProps(){
    const week = await distribution.methods.getWeekValue().call();
    const delay = await distribution.methods.getDelayValue().call();
    const avgDemand = await distribution.methods.getWeeklyAverageDemandValue().call();
    const downstreamPlayer = await distribution.methods.downstreamPlayer().call();
    const upstreamPlayer = await distribution.methods.upstreamPlayer().call();
    const accounts = await web3js.eth.getAccounts();
    const currentAccount = accounts[0];
    const inventory = downstreamPlayer.inStock;
    const inPipeline = downstreamPlayer.inPipeline;
    const backlog = downstreamPlayer.backlog;
    const cummulativeCost = downstreamPlayer.cummulativeCost;
    const earnedCredits = downstreamPlayer.earnedCredits;
    let customerDemand;
    const demandForThisWeek = await distribution.methods.downstreamDemands(week).call();
    console.log("demandForThisWeek is ---> " + demandForThisWeek);
let randomDemand;
    if(demandForThisWeek == 0){

       randomDemand = Math.ceil(Math.random() * 10);

      await distribution.methods.updateDownstreamDemandForTheWeek(randomDemand)
      .send({
        from: currentAccount
      });
      customerDemand = randomDemand;
    }
    else{

      customerDemand = demandForThisWeek;
    }
    console.log("customerDemand is ---> " + customerDemand);
     const downstreamOrdersPlaced = await distribution.methods.downstreamOrdersPlaced(week).call();
  console.log("downstreamOrdersPlaced is ---> " + downstreamOrdersPlaced);
     let disabled = false;
     if(downstreamOrdersPlaced == true){
       disabled = true;
     }
     const address = upstreamPlayer.playerAddress;
     const emptyAddress = /^0x0{40}$/.test(address);
     console.log("emptyAddress inside isUpstreamPlayerEmpty  ==" + emptyAddress);
     let errorMessage2 = "";
     if(emptyAddress){disabled = true;
       errorMessage2 = "There is no upstream player registered for this contract";
     }
    return{week, delay, avgDemand, downstreamPlayer, inventory, inPipeline, backlog, cummulativeCost, earnedCredits,customerDemand, disabled, errorMessage2 };
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
     <Layout week= {this.props.week} delay={this.props.delay}  avgDemand={this.props.avgDemand}  >
      <h1> This week's demand from customer is: {this.props.customerDemand} units!</h1>
      <h1> !</h1>
      <Grid>
      <Grid.Row>
      <Grid.Column width = {10}>

      {this.renderCards()}

      </Grid.Column>
      <Grid.Column width = {6}>
      <Form error= {!!this.state.errorMessage1}>
      <Form.Field >
      <label>Order Quantity: </label>
      {this.props.disabled ? (
      <Input
      label = "units"
      labelPosition = "right"
      value = {this.state.orderQuantity}
      onChange = {event => this.setState({orderQuantity:event.target.value})}
      disabled/>
    ) : (
      <Input
      label = "units"
      labelPosition = "right"
      value = {this.state.orderQuantity}
      onChange = {event => this.setState({orderQuantity:event.target.value})}/>
    )}
        </Form.Field>
        <Message error header = "Oops! Error occured" content = {this.state.errorMessage2} />
        {this.props.disabled? (<Button primary onClick = {this.onSubmitPlaceOrder} floated = "left" loading = {this.state.loading} content = "Place Order!" disabled/>
      ): (<Button primary onClick = {this.onSubmitPlaceOrder} floated = "left" loading = {this.state.loading} content = "Place Order!"/>
      )}
      {this.props.disabled? (<Button secondary onClick = {this.onSubmitExpediteOrder} floated = "left" loading = {this.state.loading} content = "Expedite Order!" disabled/>
    ): (<Button secondary onClick = {this.onSubmitExpediteOrder} floated = "left" loading = {this.state.loading} content = "Expedite Order!"/>
    )}

    </Form>
      </Grid.Column>
      </Grid.Row>
      <Grid.Row>
      <Grid.Column>
      <Form error= {!!this.state.errorMessage2}>
        <Message error content = {this.state.errorMessage2} />
      {this.props.disabled? (<Button primary onClick = {this.onSubmitExpeditePipeline} floated = "left" loading = {this.state.loading} content ="Expedite Pipeline Order!" disabled />
      ): (<Button primary onClick = {this.onSubmitExpeditePipeline} floated = "left" loading = {this.state.loading} content ="Expedite Pipeline Order!"/>
      )}
      </Form>
      </Grid.Column>
      </Grid.Row>
      </Grid>

    </Layout>);
  };

}


export default DownstreamPlayerView;
