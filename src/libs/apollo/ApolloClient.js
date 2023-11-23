import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { getCookies } from '../../apis/cookies';
import { useDependentFetch } from '../../hooks/useFetch';

const httpLink = createHttpLink({
  uri: 'https://www.facebook.com/api/graphql/',
  credentials: 'same-origin',
});

const authLink = setContext((_, { headers }) => {
  const { data } = useDependentFetch([getCookies]);
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      Cookie: data,
    },
  };
});
const client = new ApolloClient({
  httpLink,
  cache: new InMemoryCache(),
});
export default client;
