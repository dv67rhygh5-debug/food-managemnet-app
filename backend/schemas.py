from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr

Role = Literal["restaurant", "ngo", "admin"]


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    role: Role
    org_name: str
    city: Optional[str] = None
    phone: Optional[str] = None
    admin_invite_code: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyLoginOtpRequest(BaseModel):
    email: EmailStr
    token: str


class SurplusLogCreate(BaseModel):
    food_type: str
    quantity_kg: float
    storage: Optional[str] = None
    pickup_time: Optional[datetime] = None
    packaging: Optional[str] = None
    notes: Optional[str] = None


class ListToMarketplace(BaseModel):
    log_id: str
    pickup_window: Optional[str] = None


class ClaimCreate(BaseModel):
    listing_id: str


class ClaimStatusUpdate(BaseModel):
    status: Literal["confirmed", "picked_up", "cancelled"]


class VerificationDecision(BaseModel):
    approve: bool


class PaymentSubmission(BaseModel):
    plan: Literal["basic", "pro"]
    reference_note: str
    paid: bool  # the "Yes, I have paid" tick box — must be true to submit


class PaymentDecision(BaseModel):
    approve: bool
    reason: Optional[str] = None


class ProfileUpdate(BaseModel):
    org_name: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    verified: Optional[bool] = None


class LogUpdate(BaseModel):
    food_type: Optional[str] = None
    quantity_kg: Optional[float] = None
    notes: Optional[str] = None


class AdminClaimUpdate(BaseModel):
    status: Literal["pending", "confirmed", "picked_up", "cancelled"]


class AdminSubscriptionUpdate(BaseModel):
    plan: Literal["basic", "pro"]
    status: Literal["inactive", "pending_verification", "active", "rejected"]
    current_period_end: Optional[datetime] = None


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AssistantRequest(BaseModel):
    messages: list[ChatMessage]
