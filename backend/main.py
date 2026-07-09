from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

contacts = []
total = 1

class Contact(BaseModel):
    name: str
    surname: str
    photo: str
    number: str
    email: str

@app.get("/info")
def get_contacts(q: Optional[str] = None):
    if q:
        result = []
        for contact in contacts:
            if q.lower() in contact["name"].lower() or q.lower() in contact["surname"].lower():
                result.append(contact)
        return result
    return contacts

@app.post("/info")
def create_contact(contact: Contact):
    global total
    new_contact = {
        "id": total,
        "name": contact.name,
        "surname": contact.surname,
        "photo": contact.photo,
        "number": contact.number,
        "email": contact.email
    }
    total += 1
    contacts.append(new_contact)
    return new_contact

@app.get("/info/{id}")
def get_contact(id: int):
    for contact in contacts:
        if contact["id"] == id:
            return contact
    raise HTTPException(status_code=404, detail="Contact not found")

@app.patch("/info/{id}")
def update_contact(id: int, updated_contact: Contact):
    for i, existing in enumerate(contacts):
        if existing["id"] == id:
            contacts[i] = {
                "id": id,
                "name": updated_contact.name,
                "surname": updated_contact.surname,
                "photo": updated_contact.photo,
                "number": updated_contact.number,
                "email": updated_contact.email
            }
            return contacts[i]
    raise HTTPException(status_code=404, detail="Contact not found")

@app.delete("/info/{id}")
def delete_contact(id: int):
    for i, contact in enumerate(contacts):
        if contact["id"] == id:
            del contacts[i]
            return {"message": "Contact deleted"}
    raise HTTPException(status_code=404, detail="Contact not found")

@app.get("/")
def root():
    return {"message": "Contact Book API is running"}