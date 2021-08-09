import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
// Import to use Apollo server
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
//import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { setContext } from "@apollo/client/link/context";
// Insert pages & component
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';

// Create Apollo Provider
// GraphQL API 
const httpLink = createHttpLink({
  uri: '/graphql',
});
// Middleware to attach the token to requests as an `authorization` header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
const client = new ApolloClient({
  // Set up our client to execute the `authLink` middleware prior to making the request to our GraphQL API
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// Added <ApolloProvider/>
function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Switch>
            <Route exact path="/" component={SearchBooks} />
            <Route exact path="/saved" component={SavedBooks} />
            <Route render={() => <h1 className="display-2">Wrong page!</h1>} />
          </Switch>
        </>
      </Router>
    </ApolloProvider>
  );
}

export default App;
