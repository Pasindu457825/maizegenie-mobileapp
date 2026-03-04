from pydantic import BaseModel, Field
from typing import Literal, Optional

BillingCycle = Literal["monthly", "annual"]


class SubscriptionPlan(BaseModel):
    code: str
    title: str
    billing_cycle: BillingCycle
    amount_lkr: int
    duration_days: int


class CheckoutRequest(BaseModel):
    billing_cycle: BillingCycle


class CheckoutResponse(BaseModel):
    order_id: str
    amount_lkr: int
    billing_cycle: BillingCycle
    currency: str = "LKR"


class ConfirmPaymentRequest(BaseModel):
    order_id: str = Field(min_length=5)
    billing_cycle: BillingCycle
    card_number: str = Field(min_length=12)
    card_holder: str = Field(min_length=2)
    expiry_date: str = Field(min_length=4)
    cvv: str = Field(min_length=3, max_length=4)


class ConfirmPaymentResponse(BaseModel):
    success: bool
    message: str
    order_id: str
    subscription_end_date: Optional[str] = None
