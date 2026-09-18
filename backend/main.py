from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from database import SessionLocal
from models import User as UserModel
from schema import schema
from security import decode_access_token


async def get_context(request: Request):
    """Runs once per request. Reads the token from the Authorization header,
    decodes it, looks up the user, and puts them in the context."""

    current_user = None

    # Read the authorization header
    auth_header = request.headers.get("Authorization")

    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]

        # Decode and verify the token
        user_id = decode_access_token(token)

        if user_id:
            db = SessionLocal()
            try:
                current_user = db.get(UserModel, user_id)
            finally:
                db.close()
    return {"current_user": current_user}


# Wrap the schema in a router that speaks HTTP.
#    GraphQLRouter serves both the GraphQL endpoint AND the GraphiQL playground.
graphql_app = GraphQLRouter(schema, context_getter=get_context)


# Create the FastAPI app and mount the GraphQL router at /graphql.
app = FastAPI(title="MacroLog API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://192.168.1.91:3000",  # if you ever test the web build from another device on your network
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(graphql_app, prefix="/graphql")
