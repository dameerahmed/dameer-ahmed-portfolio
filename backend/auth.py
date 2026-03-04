from datetime import datetime, timedelta, timezone
import bcrypt
from jose import JWTError, jwt
from config import settings
from fastapi import Request, HTTPException, status

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_password_hash(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # User requested 7 days persistence
        expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_admin(request: Request):
    # Try to get token from HTTP-only cookie
    token = request.cookies.get("admin_session")
    
    # Fallback to Authorization header for flexibility (if needed)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
        )
    
    # Device ID Verification
    stored_device_id = payload.get("device_id")
    current_device_id = request.headers.get("X-Device-ID")

    # If the token is bound to a device, the request MUST present a matching header.
    # Missing header when token has a device_id = rejected (prevents token theft without device context).
    if stored_device_id:
        if not current_device_id or stored_device_id != current_device_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Session tied to another device",
            )

    return payload
