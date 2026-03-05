from pydantic import BaseModel, EmailStr, HttpUrl, Field
from typing import Optional

class LoginData(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=128)

class OTPVerify(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern=r'^\d{6}$')
    device_id: str = Field(..., min_length=1, max_length=256)
    secret_code: Optional[str] = None

class SiteContentBase(BaseModel):
    hero_title: str
    typing_tags: list[str]
    hero_description: str

class SiteContentUpdate(SiteContentBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class ProjectBase(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    tech_tags: str
    github_link: str

class ProjectCreate(ProjectBase):
    video_url: str

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: Optional[str] = None
    tech_tags: Optional[str] = None
    github_link: Optional[str] = None

class SkillBase(BaseModel):
    id: Optional[int] = None
    name: str
    percentage: int = Field(..., ge=0, le=100)
    description: Optional[str] = None

class JourneyBase(BaseModel):
    id: Optional[int] = None
    year: str
    milestone_title: str
    description: str

class JourneyUpdate(BaseModel):
    year: Optional[str] = None
    milestone_title: Optional[str] = None
    description: Optional[str] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    profile_pic: Optional[str] = None
    resume_pdf_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

class HomeStatBase(BaseModel):
    id: Optional[int] = None
    label: str
    value: str
    order: int = 0

class HomeStatCreate(HomeStatBase):
    pass

class HomeStatUpdate(BaseModel):
    label: Optional[str] = None
    value: Optional[str] = None
    order: Optional[int] = None

class TechStackBase(BaseModel):
    id: Optional[int] = None
    name: str
    category: Optional[str] = None
    years_of_experience: Optional[int] = 0
    percentage: Optional[int] = 0
    icon_name: Optional[str] = None

class TechStackCreate(TechStackBase):
    pass

class TechStackUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    years_of_experience: Optional[int] = None
    percentage: Optional[int] = None
    icon_name: Optional[str] = None

class ServiceBase(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    icon_name: Optional[str] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon_name: Optional[str] = None

class SocialLinkBase(BaseModel):
    id: Optional[int] = None
    platform: str
    platform_name: Optional[str] = None
    url: str
    logo_url: Optional[str] = None
    order: int = 0

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkUpdate(BaseModel):
    platform: Optional[str] = None
    platform_name: Optional[str] = None
    url: Optional[str] = None
    logo_url: Optional[str] = None
    order: Optional[int] = None

class ContactEmailBase(BaseModel):
    id: Optional[int] = None
    email: EmailStr
    label: Optional[str] = Field(default=None, max_length=50)

class ContactEmailCreate(ContactEmailBase):
    pass

class ContactEmailUpdate(BaseModel):
    email: Optional[EmailStr] = None
    label: Optional[str] = Field(default=None, max_length=50)

class ContactPhoneBase(BaseModel):
    id: Optional[int] = None
    number: str
    label: Optional[str] = None

class ContactPhoneCreate(ContactPhoneBase):
    pass

class ContactPhoneUpdate(BaseModel):
    number: Optional[str] = None
    label: Optional[str] = None

class EducationBase(BaseModel):
    id: Optional[int] = None
    year: str
    degree: str
    institution: str
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationUpdate(BaseModel):
    year: Optional[str] = None
    degree: Optional[str] = None
    institution: Optional[str] = None
    description: Optional[str] = None

class HobbyBase(BaseModel):
    id: Optional[int] = None
    name: str

class HobbyCreate(HobbyBase):
    pass

class HobbyUpdate(BaseModel):
    name: Optional[str] = None

class LanguageBase(BaseModel):
    id: Optional[int] = None
    name: str
    percentage: int = 100
    level: Optional[str] = None

class LanguageCreate(LanguageBase):
    pass

class LanguageUpdate(BaseModel):
    name: Optional[str] = None
    percentage: Optional[int] = None
    level: Optional[str] = None
