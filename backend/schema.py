import strawberry
from strawberry.tools import merge_types

from gql.auth import AuthMutation, AuthQuery
from gql.food import FoodMutation, FoodQuery
from gql.goal import GoalMutation, GoalQuery
from gql.user import UserMutation, UserQuery
from gql.workout import WorkoutMutation, WorkoutQuery

# Merge partial Query/Mutation classes into single root types
Query = merge_types("Query", (AuthQuery, FoodQuery, UserQuery, WorkoutQuery, GoalQuery))
Mutation = merge_types(
    "Mutation",
    (AuthMutation, FoodMutation, UserMutation, WorkoutMutation, GoalMutation),
)

schema = strawberry.Schema(query=Query, mutation=Mutation)
