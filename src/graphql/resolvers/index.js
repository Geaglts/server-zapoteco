import GraphQLJSON from 'graphql-type-json';
import Query from './Query';
import Mutation from './Mutation';
import Parent from './Parent';
import Subscription from './Subscription';

export default {
  JSON: GraphQLJSON,
  Query,
  Mutation,
  ...Parent,
  Subscription,
};
