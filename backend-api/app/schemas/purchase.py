import uuid
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class PurchaseBase(BaseModel):
    amount: float
    currency: str = "INR"

class PurchaseCreate(BaseModel):
    book_id: uuid.UUID

class PurchaseOut(PurchaseBase):
    id: uuid.UUID
    user_id: uuid.UUID
    book_id: uuid.UUID | None
    status: str
    razorpay_order_id: str | None = None
    razorpay_payment_id: str | None = None
    purchased_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class RazorpayOrderCreate(BaseModel):
    book_id: uuid.UUID

class RazorpayOrderOut(BaseModel):
    id: str
    amount: int
    currency: str
    
class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
