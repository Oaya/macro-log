import { gql, TypedDocumentNode } from "@apollo/client";

type LoginData = {
	login: { token: string; user: { email: string } };
};
type LoginVariables = {
	email: string;
	password: string;
};

export const LOGIN: TypedDocumentNode<LoginData, LoginVariables> = gql`
	mutation Login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			token
			user {
				email
			}
		}
	}
`;

type RegisterData = {
	register: { token: string; user: { email: string } };
};
type RegisterVariables = {
	email: string;
	username: string;
	password: string;
};

export const REGISTER: TypedDocumentNode<RegisterData, RegisterVariables> = gql`
	mutation Register($email: String!, $username: String!, $password: String!) {
		register(email: $email, username: $username, password: $password) {
			token
			user {
				email
			}
		}
	}
`;
