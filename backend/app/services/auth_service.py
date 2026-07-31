from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from backend.app.models.user import User
from backend.app.models.candidate import CandidateProfile
from backend.app.schemas.auth import UserRegister, UserLogin
from backend.app.core.security import get_password_hash, verify_password, create_access_token

def register_user(db: Session, user_in: UserRegister) -> dict:
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    new_user = User(
        name=user_in.name,
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        role="candidate",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize candidate profile
    profile = CandidateProfile(
        user_id=new_user.id,
        target_role="Software Engineer",
        years_experience=3,
        skills=["Python", "System Design", "SQL"],
    )
    db.add(profile)
    db.commit()

    token = create_access_token(subject=new_user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": "candidate"
        }
    }

def authenticate_user(db: Session, login_in: UserLogin) -> dict:
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user:
        # Synthesize auto-registration for candidate demo seamless login if needed, or check password
        hashed_pwd = get_password_hash(login_in.password)
        user = User(
            name=login_in.email.split("@")[0].capitalize(),
            email=login_in.email.lower(),
            hashed_password=hashed_pwd,
            role="candidate",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = CandidateProfile(
            user_id=user.id,
            target_role="Software Engineer",
            years_experience=3,
            skills=["Python", "System Design", "SQL"],
        )
        db.add(profile)
        db.commit()
    else:
        if not verify_password(login_in.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials provided."
            )

    token = create_access_token(subject=user.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": "candidate"
        }
    }
