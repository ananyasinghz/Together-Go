from fastapi import FastAPI, APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from jose import JWTError, jwt
import json
import pandas as pd
import io

from auth_utils import (
    ALGORITHM,
    SECRET_KEY,
    create_access_token,
    hash_password,
    verify_password,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except:
                self.disconnect(user_id)

    async def broadcast_to_group(self, user_ids: List[str], message: dict):
        for user_id in user_ids:
            await self.send_personal_message(user_id, message)

manager = ConnectionManager()

# Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    registration_no: str
    name: str
    is_admin: bool = False
    first_login: bool = True
    created_at: str

class LoginRequest(BaseModel):
    registration_no: str
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class CarpoolCreate(BaseModel):
    source: str
    destination: str
    date_time: str
    seats: int
    notes: Optional[str] = ""

class Carpool(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    creator_id: str
    creator_name: str
    source: str
    destination: str
    date_time: str
    seats: int
    notes: str
    members: List[dict]
    requests: List[dict]
    created_at: str

class EventPoolCreate(BaseModel):
    event_name: str
    event_date: str
    event_link: Optional[str] = ""
    members_needed: int
    requirements: Optional[str] = ""

class EventPool(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    creator_id: str
    creator_name: str
    event_name: str
    event_date: str
    event_link: str
    members_needed: int
    requirements: str
    members: List[dict]
    requests: List[dict]
    created_at: str

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    group_id: str
    group_type: str  # 'carpool' or 'event'
    sender_id: str
    sender_name: str
    message: str
    timestamp: str

class MessageCreate(BaseModel):
    group_id: str
    group_type: str
    message: str

class Notification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    type: str
    content: str
    read: bool
    created_at: str

class JoinRequest(BaseModel):
    group_id: str

class RequestAction(BaseModel):
    group_id: str
    user_id: str
    action: str  # 'accept' or 'reject'

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        registration_no: str = payload.get("sub")
        if registration_no is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"registration_no": registration_no}, {"_id": 0, "password_hash": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def create_notification(user_id: str, notification_type: str, content: str):
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": notification_type,
        "content": content,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    
    # Send real-time notification via WebSocket
    await manager.send_personal_message(user_id, {
        "type": "notification",
        "data": notification
    })

# Auth endpoints
@api_router.post("/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    user = await db.users.find_one({"registration_no": request.registration_no.lower()})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["registration_no"]})
    
    user_data = {k: v for k, v in user.items() if k not in ["_id", "password_hash"]}
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_data
    }

@api_router.post("/auth/change-password")
async def change_password(request: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"registration_no": current_user["registration_no"]})
    
    if not verify_password(request.old_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    
    new_hash = hash_password(request.new_password)
    await db.users.update_one(
        {"registration_no": current_user["registration_no"]},
        {"$set": {"password_hash": new_hash, "first_login": False}}
    )
    
    return {"message": "Password changed successfully"}

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

# Admin endpoints
@api_router.post("/admin/upload-students")
async def upload_students(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        uploaded_count = 0
        for _, row in df.iterrows():
            reg_no = str(row['Reg. No.']).lower().strip()
            name = str(row['Name']).strip()
            
            # Generate default password: first_name + last 4 digits
            first_name = name.split()[0].lower()
            last_4_digits = reg_no[-4:]
            default_password = f"{first_name}{last_4_digits}"
            
            existing = await db.users.find_one({"registration_no": reg_no})
            if not existing:
                user_doc = {
                    "registration_no": reg_no,
                    "name": name,
                    "password_hash": hash_password(default_password),
                    "is_admin": False,
                    "first_login": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(user_doc)
                uploaded_count += 1
        
        return {"message": f"Successfully uploaded {uploaded_count} students"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.post("/admin/reset-password")
async def reset_password(registration_no: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = await db.users.find_one({"registration_no": registration_no.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Reset to default password
    first_name = user["name"].split()[0].lower()
    last_4_digits = registration_no[-4:]
    default_password = f"{first_name}{last_4_digits}"
    
    await db.users.update_one(
        {"registration_no": registration_no.lower()},
        {"$set": {"password_hash": hash_password(default_password), "first_login": True}}
    )
    
    return {"message": "Password reset successfully"}

# Carpool endpoints
@api_router.post("/carpools", response_model=Carpool)
async def create_carpool(carpool: CarpoolCreate, current_user: dict = Depends(get_current_user)):
    carpool_doc = {
        "id": str(uuid.uuid4()),
        "creator_id": current_user["registration_no"],
        "creator_name": current_user["name"],
        "source": carpool.source,
        "destination": carpool.destination,
        "date_time": carpool.date_time,
        "seats": carpool.seats,
        "notes": carpool.notes,
        "members": [{"id": current_user["registration_no"], "name": current_user["name"]}],
        "requests": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.carpools.insert_one(carpool_doc)
    return {k: v for k, v in carpool_doc.items() if k != "_id"}

@api_router.get("/carpools", response_model=List[Carpool])
async def get_carpools(current_user: dict = Depends(get_current_user)):
    carpools = await db.carpools.find({}, {"_id": 0}).to_list(1000)
    return carpools

@api_router.delete("/carpools/{carpool_id}")
async def delete_carpool(carpool_id: str, current_user: dict = Depends(get_current_user)):
    carpool = await db.carpools.find_one({"id": carpool_id})
    
    if not carpool:
        raise HTTPException(status_code=404, detail="Carpool not found")
    
    if carpool["creator_id"] != current_user["registration_no"]:
        raise HTTPException(status_code=403, detail="Only creator can delete carpool")
    
    await db.carpools.delete_one({"id": carpool_id})
    
    # Notify all members
    member_ids = [m["id"] for m in carpool["members"] if m["id"] != current_user["registration_no"]]
    for member_id in member_ids:
        await create_notification(
            member_id,
            "carpool_deleted",
            f"Carpool from {carpool['source']} to {carpool['destination']} has been deleted"
        )
    
    return {"message": "Carpool deleted successfully"}

@api_router.post("/carpools/join")
async def join_carpool(request: JoinRequest, current_user: dict = Depends(get_current_user)):
    carpool = await db.carpools.find_one({"id": request.group_id})
    
    if not carpool:
        raise HTTPException(status_code=404, detail="Carpool not found")
    
    # Check if already a member
    if any(m["id"] == current_user["registration_no"] for m in carpool["members"]):
        raise HTTPException(status_code=400, detail="Already a member")
    
    # Check if already requested
    if any(r["id"] == current_user["registration_no"] for r in carpool["requests"]):
        raise HTTPException(status_code=400, detail="Request already sent")
    
    # Add to requests
    await db.carpools.update_one(
        {"id": request.group_id},
        {"$push": {"requests": {"id": current_user["registration_no"], "name": current_user["name"]}}}
    )
    
    # Notify creator
    await create_notification(
        carpool["creator_id"],
        "carpool_join_request",
        f"{current_user['name']} requested to join your carpool from {carpool['source']} to {carpool['destination']}"
    )
    
    return {"message": "Join request sent"}

@api_router.post("/carpools/request-action")
async def handle_carpool_request(action: RequestAction, current_user: dict = Depends(get_current_user)):
    carpool = await db.carpools.find_one({"id": action.group_id})
    
    if not carpool:
        raise HTTPException(status_code=404, detail="Carpool not found")
    
    if carpool["creator_id"] != current_user["registration_no"]:
        raise HTTPException(status_code=403, detail="Only creator can accept/reject requests")
    
    request_user = next((r for r in carpool["requests"] if r["id"] == action.user_id), None)
    if not request_user:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Remove from requests
    await db.carpools.update_one(
        {"id": action.group_id},
        {"$pull": {"requests": {"id": action.user_id}}}
    )
    
    if action.action == "accept":
        # Check if seats available
        if len(carpool["members"]) >= carpool["seats"]:
            raise HTTPException(status_code=400, detail="No seats available")
        
        # Add to members
        await db.carpools.update_one(
            {"id": action.group_id},
            {"$push": {"members": {"id": action.user_id, "name": request_user["name"]}}}
        )
        
        await create_notification(
            action.user_id,
            "carpool_request_accepted",
            f"Your request to join carpool from {carpool['source']} to {carpool['destination']} was accepted"
        )
    else:
        await create_notification(
            action.user_id,
            "carpool_request_rejected",
            f"Your request to join carpool from {carpool['source']} to {carpool['destination']} was rejected"
        )
    
    return {"message": f"Request {action.action}ed successfully"}

# Event Pool endpoints
@api_router.post("/event-pools", response_model=EventPool)
async def create_event_pool(event: EventPoolCreate, current_user: dict = Depends(get_current_user)):
    event_doc = {
        "id": str(uuid.uuid4()),
        "creator_id": current_user["registration_no"],
        "creator_name": current_user["name"],
        "event_name": event.event_name,
        "event_date": event.event_date,
        "event_link": event.event_link,
        "members_needed": event.members_needed,
        "requirements": event.requirements,
        "members": [{"id": current_user["registration_no"], "name": current_user["name"]}],
        "requests": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.event_pools.insert_one(event_doc)
    return {k: v for k, v in event_doc.items() if k != "_id"}

@api_router.get("/event-pools", response_model=List[EventPool])
async def get_event_pools(current_user: dict = Depends(get_current_user)):
    events = await db.event_pools.find({}, {"_id": 0}).to_list(1000)
    return events

@api_router.delete("/event-pools/{event_id}")
async def delete_event_pool(event_id: str, current_user: dict = Depends(get_current_user)):
    event = await db.event_pools.find_one({"id": event_id})
    
    if not event:
        raise HTTPException(status_code=404, detail="Event pool not found")
    
    if event["creator_id"] != current_user["registration_no"]:
        raise HTTPException(status_code=403, detail="Only creator can delete event pool")
    
    await db.event_pools.delete_one({"id": event_id})
    
    # Notify all members
    member_ids = [m["id"] for m in event["members"] if m["id"] != current_user["registration_no"]]
    for member_id in member_ids:
        await create_notification(
            member_id,
            "event_deleted",
            f"Event pool for {event['event_name']} has been deleted"
        )
    
    return {"message": "Event pool deleted successfully"}

@api_router.post("/event-pools/join")
async def join_event_pool(request: JoinRequest, current_user: dict = Depends(get_current_user)):
    event = await db.event_pools.find_one({"id": request.group_id})
    
    if not event:
        raise HTTPException(status_code=404, detail="Event pool not found")
    
    if any(m["id"] == current_user["registration_no"] for m in event["members"]):
        raise HTTPException(status_code=400, detail="Already a member")
    
    if any(r["id"] == current_user["registration_no"] for r in event["requests"]):
        raise HTTPException(status_code=400, detail="Request already sent")
    
    await db.event_pools.update_one(
        {"id": request.group_id},
        {"$push": {"requests": {"id": current_user["registration_no"], "name": current_user["name"]}}}
    )
    
    await create_notification(
        event["creator_id"],
        "event_join_request",
        f"{current_user['name']} requested to join your event pool for {event['event_name']}"
    )
    
    return {"message": "Join request sent"}

@api_router.post("/event-pools/request-action")
async def handle_event_request(action: RequestAction, current_user: dict = Depends(get_current_user)):
    event = await db.event_pools.find_one({"id": action.group_id})
    
    if not event:
        raise HTTPException(status_code=404, detail="Event pool not found")
    
    if event["creator_id"] != current_user["registration_no"]:
        raise HTTPException(status_code=403, detail="Only creator can accept/reject requests")
    
    request_user = next((r for r in event["requests"] if r["id"] == action.user_id), None)
    if not request_user:
        raise HTTPException(status_code=404, detail="Request not found")
    
    await db.event_pools.update_one(
        {"id": action.group_id},
        {"$pull": {"requests": {"id": action.user_id}}}
    )
    
    if action.action == "accept":
        if len(event["members"]) >= event["members_needed"]:
            raise HTTPException(status_code=400, detail="Group is full")
        
        await db.event_pools.update_one(
            {"id": action.group_id},
            {"$push": {"members": {"id": action.user_id, "name": request_user["name"]}}}
        )
        
        await create_notification(
            action.user_id,
            "event_request_accepted",
            f"Your request to join event pool for {event['event_name']} was accepted"
        )
        
        # Check if group is now full
        updated_event = await db.event_pools.find_one({"id": action.group_id})
        if len(updated_event["members"]) == event["members_needed"]:
            for member in updated_event["members"]:
                await create_notification(
                    member["id"],
                    "event_group_full",
                    f"Event pool for {event['event_name']} is now full! You can proceed with registration."
                )
    else:
        await create_notification(
            action.user_id,
            "event_request_rejected",
            f"Your request to join event pool for {event['event_name']} was rejected"
        )
    
    return {"message": f"Request {action.action}ed successfully"}

# Messages endpoints
@api_router.post("/messages", response_model=Message)
async def create_message(msg: MessageCreate, current_user: dict = Depends(get_current_user)):
    message_doc = {
        "id": str(uuid.uuid4()),
        "group_id": msg.group_id,
        "group_type": msg.group_type,
        "sender_id": current_user["registration_no"],
        "sender_name": current_user["name"],
        "message": msg.message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    
    # Get group members and broadcast
    if msg.group_type == "carpool":
        group = await db.carpools.find_one({"id": msg.group_id})
    else:
        group = await db.event_pools.find_one({"id": msg.group_id})
    
    if group:
        member_ids = [m["id"] for m in group["members"] if m["id"] != current_user["registration_no"]]
        message_data = {k: v for k, v in message_doc.items() if k != "_id"}
        await manager.broadcast_to_group(member_ids, {
            "type": "message",
            "data": message_data
        })
    
    return {k: v for k, v in message_doc.items() if k != "_id"}

@api_router.get("/messages/{group_id}", response_model=List[Message])
async def get_messages(group_id: str, current_user: dict = Depends(get_current_user)):
    messages = await db.messages.find({"group_id": group_id}, {"_id": 0}).to_list(1000)
    return messages

# Notifications endpoints
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user["registration_no"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user["registration_no"]},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db():
    # Create admin user if not exists
    admin = await db.users.find_one({"registration_no": "id101"})
    if not admin:
        admin_doc = {
            "registration_no": "id101",
            "name": "Admin",
            "password_hash": hash_password("prerna08"),
            "is_admin": True,
            "first_login": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_doc)
        logger.info("Admin user created")

    # Seed student if not exists (same default-password rule as Excel upload)
    seed_reg = "23bce1380"
    if not await db.users.find_one({"registration_no": seed_reg}):
        seed_name = "Ananya Singh"
        first_name = seed_name.split()[0].lower()
        last_4 = seed_reg[-4:]
        default_password = f"{first_name}{last_4}"
        await db.users.insert_one(
            {
                "registration_no": seed_reg,
                "name": seed_name,
                "password_hash": hash_password(default_password),
                "is_admin": False,
                "first_login": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        logger.info("Seed student %s created", seed_reg)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
