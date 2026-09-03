import strawberry
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter


# 1. Define the Query type.
#    @strawberry.type turns this class into a GraphQL object type.
#    Each method decorated with @strawberry.field becomes a queryable field.
@strawberry.type
class Query:
    @strawberry.field
    def hello(self) -> str:
        return "world"


# 2. Build the schema from the Query type.
#    This is the GraphQL "brain" — it knows all your types, queries, mutations.
schema = strawberry.Schema(query=Query)


# 3. Wrap the schema in a router that speaks HTTP.
#    GraphQLRouter serves both the GraphQL endpoint AND the GraphiQL playground.
graphql_app = GraphQLRouter(schema)


# 4. Create the FastAPI app and mount the GraphQL router at /graphql.
app = FastAPI()
app.include_router(graphql_app, prefix="/graphql")