from datetime import datetime, timedelta, timezone
import re
import uuid
from fastapi import HTTPException
from core.supabase_client import supabase
from .models import BillingCycle, SubscriptionPlan


PLANS = {
    "monthly": SubscriptionPlan(
        code="pro_monthly",
        title="MaizeGenie Pro Monthly",
        billing_cycle="monthly",
        amount_lkr=300,
        duration_days=30,
    ),
    "annual": SubscriptionPlan(
        code="pro_annual",
        title="MaizeGenie Pro Annual",
        billing_cycle="annual",
        amount_lkr=2500,
        duration_days=365,
    ),
}


def get_plans() -> list[SubscriptionPlan]:
    return [PLANS["monthly"], PLANS["annual"]]


def create_checkout(billing_cycle: BillingCycle) -> dict:
    plan = PLANS[billing_cycle]
    return {
        "order_id": f"SUB_{uuid.uuid4().hex[:12].upper()}",
        "amount_lkr": plan.amount_lkr,
        "billing_cycle": billing_cycle,
        "currency": "LKR",
    }


def _validate_dummy_card(card_number: str, cvv: str, expiry_date: str) -> None:
    clean = re.sub(r"\s+", "", card_number)
    if clean not in {"4242424242424242", "4111111111111111", "5555555555554444"}:
        raise HTTPException(
            status_code=400,
            detail="Use a sandbox test card number (e.g., 4242 4242 4242 4242).",
        )

    if not re.fullmatch(r"\d{3,4}", cvv):
        raise HTTPException(status_code=400, detail="Invalid CVV for sandbox payment.")

    if not re.fullmatch(r"(0[1-9]|1[0-2])/\d{2}", expiry_date):
        raise HTTPException(status_code=400, detail="Expiry must be in MM/YY format.")


def confirm_dummy_payment(
    user_id: str,
    order_id: str,
    billing_cycle: BillingCycle,
    card_number: str,
    cvv: str,
    expiry_date: str,
) -> str:
    _validate_dummy_card(card_number=card_number, cvv=cvv, expiry_date=expiry_date)

    plan = PLANS[billing_cycle]
    now = datetime.now(timezone.utc)

    profile_res = (
        supabase.table("profiles")
        .select("subscription_end_date")
        .eq("id", user_id)
        .single()
        .execute()
    )

    existing_end_raw = (profile_res.data or {}).get("subscription_end_date")
    existing_end = None
    if isinstance(existing_end_raw, str):
        try:
            existing_end = datetime.fromisoformat(existing_end_raw.replace("Z", "+00:00"))
        except ValueError:
            existing_end = None

    base_date = existing_end if existing_end and existing_end > now else now
    new_end = base_date + timedelta(days=plan.duration_days)

    update_payload = {
        "is_paid_user": True,
        "subscription_plan": plan.code,
        "subscription_start_date": now.isoformat(),
        "subscription_end_date": new_end.isoformat(),
        "last_payment_order_id": order_id,
        "last_payment_amount_lkr": plan.amount_lkr,
    }

    try:
        supabase.table("profiles").update(update_payload).eq("id", user_id).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to update subscription. Ensure profiles table has "
                "is_paid_user, subscription_plan, subscription_start_date, "
                f"subscription_end_date columns. Error: {e}"
            ),
        )

    return new_end.isoformat()
