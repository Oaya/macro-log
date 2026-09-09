from strawberry.types import Info

from models import User as UserModel


def require_user(info: Info) -> UserModel:
    """Return the authenticated user or raise if the request is anonymous.
    Use this at the top of any resolver that needs a signed-in user:
    """
    current_user = info.context["current_user"]
    if current_user is None:
        raise Exception("Not authenticated")
    return current_user
