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
        contrasena: String
        ncontrol: String!
        admin: Boolean!
        roles: [String]!
    }

    type Example {
        _id: String!
        ejemplo_esp: String
        ejemplo_zap: String
    }

    type More {
        examples: [Example]!
        significado: String
    }

    type Words {
        id: Int
        texto: String!
        fonetica: String!
        tipo: String
        traducciones: [String]!
        more: More
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

    input WordInput {
        esp: [String]!
        zap: String!
        tipo: Int!
    }

    type Query {
        getRols: [Rol!]
        getWords: [Words]!

        aboutMe: User
        myRoles: [String]!
    }

    type Mutation {
        newUser(input: UserInput!): JSON
        newWord(input: WordInput!): JSON

        assignRoles(rolIds: [Int!], userId: Int!): JSON
        login(user: String!, contrasena: String!): JSON
    }

    type Subscription {
        test: Boolean
    }
`;
