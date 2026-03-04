from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from core.auth_dependencies import get_current_user
from core.supabase_client import supabase
from .models import (
    SubscriptionPlan,
    CheckoutRequest,
    CheckoutResponse,
    ConfirmPaymentRequest,
    ConfirmPaymentResponse,
)
from .service import get_plans, create_checkout, confirm_dummy_payment

router = APIRouter(prefix="/api/v1/subscription", tags=["Subscription"])


@router.get("/plans", response_model=list[SubscriptionPlan])
async def list_plans():
    return get_plans()


@router.post("/checkout", response_model=CheckoutResponse)
async def start_checkout(
    payload: CheckoutRequest,
    current_user: dict = Depends(get_current_user),
):
    if not current_user.get("id"):
        raise HTTPException(status_code=401, detail="Authentication required")

    checkout = create_checkout(payload.billing_cycle)
    return CheckoutResponse(**checkout)


@router.post("/confirm", response_model=ConfirmPaymentResponse)
async def confirm_checkout(
    payload: ConfirmPaymentRequest,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    end_date = confirm_dummy_payment(
        user_id=user_id,
        order_id=payload.order_id,
        billing_cycle=payload.billing_cycle,
        card_number=payload.card_number,
        cvv=payload.cvv,
        expiry_date=payload.expiry_date,
    )

    return ConfirmPaymentResponse(
        success=True,
        message="Sandbox payment successful",
        order_id=payload.order_id,
        subscription_end_date=end_date,
    )


@router.get("/me")
async def my_subscription(current_user: dict = Depends(get_current_user)):
    user_id = current_user.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    profile = (
        supabase.table("profiles")
        .select(
            "is_paid_user, subscription_plan, subscription_start_date, "
            "subscription_end_date, last_payment_order_id, last_payment_amount_lkr"
        )
        .eq("id", user_id)
        .single()
        .execute()
    )

    data = profile.data or {}
    end_raw = data.get("subscription_end_date")
    is_active = False
    if end_raw:
        try:
            end_date = datetime.fromisoformat(str(end_raw).replace("Z", "+00:00"))
            is_active = end_date > datetime.now(timezone.utc)
        except ValueError:
            is_active = False

    return {
        "is_paid_user": bool(data.get("is_paid_user")) and is_active,
        "subscription_plan": data.get("subscription_plan"),
        "subscription_start_date": data.get("subscription_start_date"),
        "subscription_end_date": data.get("subscription_end_date"),
        "last_payment_order_id": data.get("last_payment_order_id"),
        "last_payment_amount_lkr": data.get("last_payment_amount_lkr"),
        "is_active": is_active,
    }
