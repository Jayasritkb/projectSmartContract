import React from 'react';
import Header from './Header.js';
import { Container } from 'semantic-ui-react';
import Head from 'next/head';

export default props => {
  return(
    <Container>
    <Head>
      <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
    </Head>
    <Header week= {props.week} delay={props.delay} avgDemand={props.avgDemand}/>
    {props.children}
    </Container>
  );
};
