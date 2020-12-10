import { gql } from "apollo-server-express";

export default gql`
    scalar JSON

    type Rol {
        id: Int!
        rol: String!
        desc: String
    }

    type Example {
        _id: String!
        ejemplo_esp: String
        ejemplo_zap: String
    }

    type WordType {
        id: Int!
        tipo: String!
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
        getTypes: [WordType]!

        aboutMe: User
        myRoles: [String]!
    }

    type Mutation {
        newUser(input: UserInput!): JSON
        newWord(input: WordInput!): JSON

        assignRoles(rolIds: [Int!], userId: Int!): JSON
        login(user: String!, contrasena: String!): JSON

        newType(tipo: String!): JSON
        updateType(id: Int!, tipo: String!): JSON
    }

    # Usuarios
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

    extend type Query {
        getUser(correo: String!): User
    }

    # Palabras
    type More {
        examples: [Example]!
        significado: String
    }

    type Words {
        id: Int
        texto: String!
        fonetica: String
        tipo: String
        traducciones: [String]
        usuarioid: Int
        categoria: String
        contextos: [Contexto]
        base: Base
        more: More
    }

    extend type Mutation {
        checkPendingWord(id_usuario: Int!, id_palabra_p: Int!): JSON
    }

    # Palabras pendientes
    input newWordPendingInput {
        texto: String!
        fonetica: String!
        traduccion: String!

        base_id: Int!
        idcontexto: Int!
        categoria_id: Int!
        idtipo: Int!

        ejemplo_esp: String!
        ejemplo_zap: String!
    }

    extend type Query {
        getPendingWords: [Words]
    }

    extend type Mutation {
        newWordPending(input: newWordPendingInput): Words
    }

    # Categorias
    type Category {
        id: Int!
        categoria: String!
    }

    extend type Query {
        getCategories: [Category]!
    }

    extend type Mutation {
        newCategory(categoria: String!): JSON
        updateCategory(id: Int!, categoria: String!): JSON
    }

    # Contexto
    type Contexto {
        id: Int
        contexto: String
    }

    extend type Query {
        getContextos: [Contexto]!
    }

    extend type Mutation {
        newContexto(contexto: String!): Contexto
        updateContexto(id: Int!, contexto: String!): Contexto
    }

    # Roles
    extend type Mutation {
        setRols(rolids: [Int], usuarioid: Int!): JSON
    }

    type Subscription {
        test: Boolean
    }

    # Bases
    type Base {
        id: ID
        base_esp: String
        base_zap: String
        significado: String
    }

    input BaseInput {
        id: ID
        base_esp: String
        base_zap: String
        significado: String
    }

    extend type Query {
        allTheBases: [Base]
    }

    extend type Mutation {
        newBase(input: BaseInput!): Base
        updateBase(input: BaseInput!): Base
        assignBaseToWord(base_id: String!, word_id: Int!): Words
        assignBaseToPendingWord(base_id: String!, pending_word_id: Int!): Words
    }
`;
