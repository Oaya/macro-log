import strawberry
from strawberry.tools import merge_types

from gql.auth import AuthMutation, AuthQuery
from gql.food import FoodMutation, FoodQuery
from gql.user import UserMutation, UserQuery
from gql.workout import WorkoutMutation, WorkoutQuery

# Merge partial Query/Mutation classes into single root types
Query = merge_types("Query", (AuthQuery, FoodQuery, UserQuery, WorkoutQuery))
Mutation = merge_types(
    "Mutation", (AuthMutation, FoodMutation, UserMutation, WorkoutMutation)
)

schema = strawberry.Schema(query=Query, mutation=Mutation)
