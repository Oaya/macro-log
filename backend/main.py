from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter

from schema import schema

# 2. Build the schema from the Query type.
#    This is the GraphQL "brain" — it knows all your types, queries, mutations.


# Wrap the schema in a router that speaks HTTP.
#    GraphQLRouter serves both the GraphQL endpoint AND the GraphiQL playground.
graphql_app = GraphQLRouter(schema)


# Create the FastAPI app and mount the GraphQL router at /graphql.
app = FastAPI(title="MacroLog API")
app.include_router(graphql_app, prefix="/graphql")
