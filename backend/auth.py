from fastapi import Header, HTTPException, Depends

# Simple fake user check
async def get_user_role(x_role: str = Header(...)):
    if x_role not in ["admin", "viewer", "analyst"]:
        raise HTTPException(status_code=403, detail="Invalid role")
    return x_role
