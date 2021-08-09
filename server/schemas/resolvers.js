// Imports
const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

// Create the functions that fulfill the queries defined in `typeDefs.js`
const resolvers = {
  Query: {
    // apollographql doc resolver function
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
        .select("-__v -password")
        .populate('books')
        return userData;
      }
      throw new AuthenticationError("Sorry, you are not logged in");
    },
  },

  Mutation: {
    // New user creation
    addUser: async (parent, {username, email, password}) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    // User logging in
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      // If there is no user:
      if (!user) {
        throw new AuthenticationError("Please enter correct credentials");
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError("Please enter correct credentials");
      }
      const token = signToken(user);
      return { token, user };
    },

    // Save book
    saveBook: async (parent, { input }, context) => {
      console.log(context);
      console.log(bookInfo);
      
      if (context.user) {
        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true, runValidations: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("You must log in");
    },

    // Remove book
    removeBook: async (parent, {bookId}, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true, runValidations: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("You must log in");
    },
  },
};

module.exports = resolvers;
