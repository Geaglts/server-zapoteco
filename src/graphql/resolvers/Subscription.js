export default {
    test: {
        subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(["POST_ADDED"]),
    },
};
