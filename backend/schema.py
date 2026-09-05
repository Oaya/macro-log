import strawberry
from strawberry.tools import merge_types

from gql.auth import AuthMutation, AuthQuery
from gql.food import FoodMutation, FoodQuery

# Merge partial Query/Mutation classes into single root types
Query = merge_types("Query", (AuthQuery, FoodQuery))
Mutation = merge_types("Mutation", (AuthMutation, FoodMutation))

schema = strawberry.Schema(query=Query, mutation=Mutation)
