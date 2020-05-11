import React from 'react';
import { Menu, Header } from 'semantic-ui-react';

export default props => {

  return (
    <Menu style = {{marginTop: '30px'}}>
    <Menu.Menu >
     <Menu.Item>
     <Header as = 'h2'>Supply Chain Distribution Contract </Header>
     </Menu.Item>
     </Menu.Menu>
     <Menu.Menu position = "right">
     <Menu.Item>
     <Header as = 'h3'>Current Week: {props.week}</Header>
     </Menu.Item>
     <Menu.Item>
     <Header as = 'h3'>Delay in the system (in weeks): {props.delay}</Header>
     </Menu.Item>
     <Menu.Item>
     <Header as = 'h3'>Average Weekly Demand: {props.avgDemand}</Header>
     </Menu.Item>
     </Menu.Menu>
    </Menu>
  );
};
