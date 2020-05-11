pragma solidity ^0.4.17;

contract Distribution{
    // struct for holding the player object, commonly used for both downstream and upstream
    struct Player{
        uint playerType;
        address playerAddress;
        uint inStock;
        uint inPipeline;
        uint backlog;
        uint cummulativeCost;
        uint earnedCredits;
    }
//class variables, the values below are passed through by the constructor
    uint public week;
    uint public delay;
    uint public weeklyAverageDemand;
    uint public stdDev;
    // z-score for customer service level 97.72
    uint public zvalue = 2;
    //to save the address values to check whether it is empty
    address public downstreamPlayerAddress;
    address public upstreamPlayerAddress;
     //to save the players object
    Player public downstreamPlayer;
    Player public upstreamPlayer;
    //mapping to save the weekly orders of downstream player
    mapping(uint => uint) public downstreamOrders;
    //mapping to save the fulfilled orders by upstream player
    mapping(uint => uint) public upstreamFulfillments;
    //mapping to save the weekly orders of upstream player
    mapping(uint => uint) public upstreamOrders;
    //mapping to save the weekly orders of downstream demands from the customers
    mapping(uint => uint) public downstreamDemands;
     //mapping to save the weekly orders of downstream fulfillments
    mapping(uint => uint) public downstreamFulfillments;
     //mapping to save whether downstream player had placed order for the corresponding week or not
    mapping(uint => bool) public downstreamOrdersPlaced;
    //mapping to save whether upstream player had placed order for the corresponding week or not
    mapping(uint => bool) public upstreamOrdersPlaced;
    //mapping to save the weeklyCost for Downstream player
    mapping(uint => uint) public weeklyCostDownstream;
     //mapping to save the weeklyCost for upstream player
    mapping(uint => uint) public weeklyCostUpstream;

    //constructor that is called to create a contract, passes the weeknumber (usually 1 during the creation), average weekly demand, lead time, standardDeviation for weekly demand
    constructor (uint weekNumber,uint averageDemand, uint delayInWeeks, uint standardDeviation) public{
        week = weekNumber;
        delay = delayInWeeks;
        weeklyAverageDemand = averageDemand;
        stdDev = standardDeviation;
    }
    //function to get the current week value
    function getWeekValue() public view returns (uint){
      return week;
    }
    //function to get the leadtime value in the system
    function getDelayValue() public view returns (uint){
      return delay;
    }
    //function to get the leadtime value in the system
    function getWeeklyAverageDemandValue() public view returns (uint){
      return weeklyAverageDemand;
    }
    // restrict upstream player from registering as downstream player
    modifier restrictUpstreamPlayer(){
        require(msg.sender  != upstreamPlayerAddress);
        _;
    }
    // restrict downstream player from registering as upstream player
    modifier restrictDownstreamPlayer(){
        require(msg.sender != downstreamPlayerAddress);
        _;
    }

    //This function is called when a player wants to register as upstream
    //Downstream player is restricted to register himself as upstream player
    function registerAsUpstreamPlayer(uint inStock) public restrictDownstreamPlayer{
        Player memory definedPlayer = Player({
           playerType:  2,
           playerAddress: msg.sender,
           inStock: inStock,
           inPipeline: 0,
           backlog: 0,
           cummulativeCost:0,
           earnedCredits:0
        });

         upstreamPlayer = definedPlayer;
         upstreamPlayerAddress = msg.sender;
    }
    //This function is called when a player wants to register as downstream
    //Upstream player is restricted to register himself as downstream player
     function registerAsDownstreamPlayer(uint inStock) public restrictUpstreamPlayer{
        Player memory definedPlayer = Player({
           playerType:  1,
           playerAddress: msg.sender,
           inStock: inStock,
           inPipeline: 0,
           backlog: 0,
           cummulativeCost:0,
           earnedCredits:0
        });
        downstreamPlayer = definedPlayer;
        downstreamPlayerAddress = msg.sender;
    }
    // This function is called to check whether both the players have ordered for the week, before moving to next week
    modifier checkBothPlayersOrderedForTheWeek() {
       bool downstreamOrdered =  downstreamOrdersPlaced[week];
       bool upstreamOrdered =  upstreamOrdersPlaced[week];
       assert(downstreamOrdered && upstreamOrdered);
        _;
    }
    //This function is called to fulfill downstream orders from customers and also to update the orders placed by downstream to upstream
    function fulfillAndPlaceNewOrdersDownstream(uint orderQuantity) public {
        // update the order quantity  to the orders array of downstream player for the current week
        downstreamOrders[week] = orderQuantity;
        // get the order quantity  to the orders array of dewnstream player for the current week
        uint customerDemand = downstreamDemands[week];
        //fulfill downstream orders corresponding to the current week, after adjusting for delay
        fulfillOrdersDownstream( customerDemand);
        //update the orders placed array with true, so that the system knows that downstream player has placed order
        downstreamOrdersPlaced[week] = true;
        //check and update the inventory automatically, if it goes below the leadtime demand
        checkAndUpdateInventoryDownstream();

    }
    //This function is called to fulfill the customer orders from downstream
    function fulfillOrdersDownstream ( uint customerDemand) public{
        // get backlog inventory for downstream player
        uint backlogQuantity = downstreamPlayer.backlog;
        //get current inventory for the downstream player
          uint currentInventory = downstreamPlayer.inStock;
          uint ordersFulfilled = customerDemand + backlogQuantity;
          //clear backlog
          downstreamPlayer.backlog = 0;
          //check whether the current demand is less than the current inventory
        if(ordersFulfilled < currentInventory){
            // subtract the customer demand from current inventory
            currentInventory = currentInventory - ordersFulfilled;
         }
         //if current demand is more than the current inventory, current inventory is fully cleared and sent to the customers,
         //remaining orders are entered into the backlog of downstream player
        else{
            ordersFulfilled =  currentInventory;
            currentInventory = 0;
            //calculate backlog and update it to the downstream player object
            backlogQuantity = customerDemand - ordersFulfilled;
            updateBacklogDownstream(backlogQuantity);
         }
        //update the currrent inventory to the downstream player object
        downstreamPlayer.inStock = currentInventory;
        //update the orders fulfilled mapping for the week
        downstreamFulfillments[week] = ordersFulfilled;
        //update the weekly cost mapping with the inventory cost, backorder cost and other costs.
        updateWeeklyCostDownstream();
    }
    //This function is called to fulfill upstream orders from downstream player and also to fulfill the downstream player's orders
    function fulfillAndPlaceNewOrdersUpstream( uint orderQuantity) public {
        //call the fulfill orders method
         fulfillOrdersUpstream();
         //update the upstream order quantity of this week
        upstreamOrders[week] = orderQuantity;
        //update the orders placed mapping with 'true' to indicate that the upstream player has placed the order for the current week
        upstreamOrdersPlaced[week] = true;
        //check the upstream inventory to update it automatically

    }
    //This function is called to update the units in pipeline for downstream player
    function updatePipelineDownstream(uint pipelineQuantity ) public{
       uint alreadyInPipeline= downstreamPlayer.inPipeline;
       uint newPipeline = alreadyInPipeline + pipelineQuantity;
       downstreamPlayer.inPipeline = newPipeline;
    }
    //This function is called to update the units in pipeline for upstream player
    function updatePipelineUpstream(uint pipelineQuantity ) public{
       uint alreadyInPipeline= upstreamPlayer.inPipeline;
       uint newPipeline = alreadyInPipeline + pipelineQuantity;
       upstreamPlayer.inPipeline = newPipeline;
    }
    //This function is used to get the demand for the week for upstream
    function getUpstreamDemandForWeek() public view returns (uint){
        uint currentWeekDemand = downstreamOrders[week-delay];
        return currentWeekDemand;
    }
    //This function is called to update the customer demand for downstream player
    function updateDownstreamDemandForTheWeek(uint customerDemand) public{
        downstreamDemands[week] = customerDemand;
    }
    //This function is called to fulfill orders for upstream player
    function fulfillOrdersUpstream () public{
        // fulfill orders for the previous week, considering the delay into account
        if(week > delay){
       uint orderQuantity = getUpstreamDemandForWeek();
       //call the fulfill orders function
        fulfillOrdersUpstreamForQuantity(orderQuantity, false,false);
        }
        // calculate weekly cost and add it to cummulative cost of upstream player
         uint inventoryCost = upstreamPlayer.inStock * 2;
         uint backorderCost = upstreamPlayer.backlog * 1;
         uint weeklyCost = inventoryCost + backorderCost;
         weeklyCostUpstream[week] = weeklyCost + weeklyCostUpstream[week];
         addToCummulativeCost(weeklyCost, 2);
     }
    //This function is called to fulfill orders for upstream player by the fulfillOrdersUpstream function
      function fulfillOrdersUpstreamForQuantity (uint orderQuantity, bool expedited, bool newOrder) private{
          // get backlog inventory for upstream player
          uint backlogQuantity = upstreamPlayer.backlog;
          //create a new variable called orderfulfilled
           uint ordersFulfilled =  orderQuantity;
          if(!expedited){
            // only if it is not expedited order add the backlog as well to order
            ordersFulfilled = orderQuantity + backlogQuantity;
            //clear the backlog
            upstreamPlayer.backlog = 0;
          }
        //get current inventory for the upstream player
         uint currentInventory = upstreamPlayer.inStock;
         //check whether the orders to be fulfilled is less than current inventory
        if(ordersFulfilled < currentInventory){
            currentInventory = currentInventory - ordersFulfilled;
            //add the order quantity with already fulfilled orders for this week
            upstreamFulfillments[week] = upstreamFulfillments[week] + ordersFulfilled;

        }
        else{
            //update the upstream fulfillments with the current inventory as there are not enough units
            upstreamFulfillments[week] = upstreamFulfillments[week] + currentInventory;
            // find how much is the backlog orders
            backlogQuantity = ordersFulfilled - currentInventory;
            // only those units in current inventory can be sent to downstream player
            ordersFulfilled = currentInventory;
            // update the back log oof the upstream player
            updateBacklogUpstream(backlogQuantity);
            //clear current inventory as all the units were sent to downstream pipeline.
            currentInventory = 0;
         }
         if(!expedited){
            //update the pipeline for the downstream, only if it is not expedited as expedited orders don't go to pipeline, instead go straight to the stock of downstream
            updatePipelineDownstream(ordersFulfilled);
        }
        else{
            //expedition cost for pipeline order is set to $3
            uint expediteCost = ordersFulfilled * 3;
            if(newOrder){
                //expedition cost for new order is set to $5
             expediteCost = ordersFulfilled * 5;
            }
            //update the upstream player's earned credits with the number of units expedited.
            upstreamPlayer.earnedCredits = upstreamPlayer.earnedCredits + ordersFulfilled;
            weeklyCostDownstream[week] = expediteCost + weeklyCostDownstream[week];
            addToCummulativeCost(expediteCost, 1);
        }
        // update upstream player in stock units.
            upstreamPlayer.inStock = currentInventory;
            downstreamPlayer.inStock = ordersFulfilled;



     }
    // This fuction is called to update the backlog of upstream player
    function updateBacklogUpstream(uint backlogOrders) public{
        uint existingBacklog = upstreamPlayer.backlog;
        upstreamPlayer.backlog = existingBacklog + backlogOrders;
    }
    // This fuction is called to update the backlog of downstream player
    function updateBacklogDownstream(uint backlogOrders) public{
        uint existingBacklog = downstreamPlayer.backlog;
        downstreamPlayer.backlog = existingBacklog + backlogOrders;
    }
    //This function is called when the downstream player clicks on the expedite pipleine orders button
    function expeditePipelineOrder() public{
        //get the pipeline quantity
        uint pipelineQuantity = downstreamPlayer.inPipeline;
        //clear the pipeline
        downstreamPlayer.inPipeline = 0;
        //Call the fulfille orders for the order quantity method for upstream player
        fulfillOrdersUpstreamForQuantity(pipelineQuantity, true,false);
     }
    //This function is called to expedite new orders by downstream player
    function expediteNewOrderDownstream(uint orderQuantity) public{
       // call the fulfill orders upstream for the order quantity mentioned
       fulfillOrdersUpstreamForQuantity(orderQuantity,true, true);
    }
    //This function is called to expedite new orders by upstream player
    function expediteNewOrderUpstream(uint orderQuantity) public{
         //The cost for expediting new orders is set to $5
        uint expediteCost = orderQuantity * 5;
        uint currentUpstreamInventory = upstreamPlayer.inStock;
        //order quantity for upstream player is expected to be updated immediately.
        upstreamPlayer.inStock = currentUpstreamInventory + orderQuantity;
       weeklyCostUpstream[week] = expediteCost + weeklyCostUpstream[week];
        addToCummulativeCost(expediteCost, 2);
    }
    //This function is called to update weekly cose for downstream player.
    function updateWeeklyCostDownstream() public{
        //Inventory cost is set to $2 per week
        uint inventoryCost = downstreamPlayer.inStock * 2;
        //Backorder cost is set to $1 per week
         uint backorderCost = downstreamPlayer.backlog * 1;
         //weekly cost is calculated by adding all the relevant costs.
        uint weeklyCost =  inventoryCost + backorderCost;
        //weekly cost is updated to the weekly cost map
        weeklyCostDownstream[week] = weeklyCost + weeklyCostDownstream[week];
        //add the weekly cost to the cummulative cost
        addToCummulativeCost(weeklyCost, 1);

    }
   //This function is called to expedite new order
    function expediteNewOrder(uint orderQuantity) public{
       expediteNewOrderDownstream(orderQuantity);
        updateWeeklyCostDownstream();
        downstreamOrdersPlaced[week] = true;
    }
    //This function is called to automatically check the inventory for downstream player and update with the leadtime demand units instantly.
    function checkAndUpdateInventoryDownstream() public{
        //Get the inventory in stock for downstream player
       uint downstreamInventory = downstreamPlayer.inStock;
       //calculate the lead time demand
       uint leadTimeDemand = calculateOrderQuantity();
        //If the current inventory is less than the leadtime demand then expedite the lead time demand units
       if(downstreamInventory < leadTimeDemand){
           expediteNewOrderDownstream(leadTimeDemand);
       }
      }

    // This function is used to calculate the lead time demand order quantity
    function calculateOrderQuantity() public view returns (uint){
        //calculate the safety stock
        uint safetystock = zvalue * stdDev;
        //calculate the lead time demand
       uint leadTimeDemand = weeklyAverageDemand * delay;
       uint quantToOrder = leadTimeDemand + safetystock;
       return quantToOrder;
    }
    //This function is called when both the players place the order for the week, upstream orders are updated during this time.
    function updateOrderAndIncrementToNextWeek() public checkBothPlayersOrderedForTheWeek{
        uint upstreamOrder = upstreamOrders[week];
        //increment the week
        week = week + 1;
        //update the upstream inventory with the current order
        uint currentUpstreamInventory = upstreamPlayer.inStock;
        upstreamPlayer.inStock = currentUpstreamInventory + upstreamOrder;
    }
    // This fucntion is used to add to the cummulative cost
    function addToCummulativeCost(uint cummCost, uint playerType ) public{
      if(playerType == 1){
          downstreamPlayer.cummulativeCost = downstreamPlayer.cummulativeCost + cummCost;
      }
      if(playerType == 2){
          upstreamPlayer.cummulativeCost = upstreamPlayer.cummulativeCost + cummCost;
      }
     }
  }
