import { gql } from "apollo-server-express";

export default gql`
    scalar JSON

    type Rol {
        id: Int!
        rol: String!
        desc: String
    }

    type User {
        id: Int!
        nombre: String!
        amaterno: String!
        apaterno: String!
        usuario: String!
        correo: String!
        contrasena: String!
        ncontrol: String!
        admin: Boolean!
    }

    input UserInput {
        nombre: String!
        amaterno: String!
        apaterno: String!
        usuario: String!
        correo: String!
        contrasena: String!
        ncontrol: String
    }

    type Query {
        getRols: [Rol!]
    }

    type Mutation {
        newUser(input: UserInput): JSON
        assignRoles(rolIds: [Int!], userId: Int!): JSON
        login(user: String!, contrasena: String!): JSON
    }
`;
