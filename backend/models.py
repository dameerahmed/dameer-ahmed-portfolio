from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, JSON
from datetime import datetime, timezone
from database import Base

class AdminUser(Base):
    __tablename__ = "admin_users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    recovery_key = Column(String, nullable=True) # Hashed recovery key

class AdminOTP(Base):
    __tablename__ = "admin_otps"
    id = Column(Integer, primary_key=True, index=True)
    otp_code = Column(String)
    expires_at = Column(DateTime)
    failed_attempts = Column(Integer, default=0, nullable=False)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)

class AdminPasswordOverride(Base):
    """Stores a bcrypt-hashed password set via the forgot-password flow, overriding .env ADMIN_PASSWORD."""
    __tablename__ = "admin_password_override"
    id = Column(Integer, primary_key=True, index=True)
    hashed_password = Column(String, nullable=False)

class SiteContent(Base):
    __tablename__ = "site_content"
    id = Column(Integer, primary_key=True, index=True)
    hero_title = Column(String)
    typing_tags = Column(JSON) # Stored as JSON array
    hero_description = Column(Text)

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    video_url = Column(String)
    tech_tags = Column(String) # Stored as comma-separated or JSON
    github_link = Column(String)

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    percentage = Column(Integer)
    description = Column(String, nullable=True) # For Services page

class JourneyTimeline(Base):
    __tablename__ = "journey_timeline"
    id = Column(Integer, primary_key=True, index=True)
    year = Column(String)
    milestone_title = Column(String)
    description = Column(Text)

class SiteMetadata(Base):
    __tablename__ = "site_metadata"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    bio = Column(Text)
    profile_pic = Column(String)
    resume_pdf_url = Column(String)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(String)  # ISO timestamp string

class HomeStat(Base):
    __tablename__ = "home_stats"
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String)
    value = Column(String)
    order = Column(Integer, default=0)

class TechStack(Base):
    __tablename__ = "tech_stack"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, nullable=True)
    years_of_experience = Column(Integer, default=0)
    percentage = Column(Integer, default=0)
    icon_name = Column(String, nullable=True)

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    icon_name = Column(String, nullable=True)

class SocialLink(Base):
    __tablename__ = "social_links"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, index=True) # Keyword like 'LinkedIn', 'Github'
    platform_name = Column(String, nullable=True) # Display name like 'LinkedIn Profile'
    url = Column(String)
    logo_url = Column(String, nullable=True)
    order = Column(Integer, default=0)

class ContactEmail(Base):
    __tablename__ = "contact_emails"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    label = Column(String, nullable=True) # e.g. 'Primary', 'Work'

class ContactPhone(Base):
    __tablename__ = "contact_phones"
    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, index=True)
    label = Column(String, nullable=True) # e.g. 'WhatsApp', 'Personal'

class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    year = Column(String)
    degree = Column(String)
    institution = Column(String)
    description = Column(Text, nullable=True)

class Hobby(Base):
    __tablename__ = "hobbies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    percentage = Column(Integer, default=100)
    level = Column(String, nullable=True) # e.g. 'Native', 'Fluent', 'Intermediate'

class AdminSession(Base):
    __tablename__ = "admin_sessions"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, index=True)
    device_name = Column(String, nullable=True) # User-defined name
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    last_active = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
    is_active = Column(Boolean, default=True)
    is_protected = Column(Boolean, default=False) # Cannot be terminated by others
    created_at = Column(DateTime, default=datetime.now(timezone.utc).replace(tzinfo=None))
