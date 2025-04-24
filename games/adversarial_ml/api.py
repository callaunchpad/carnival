# To run it: uvicorn main:app --reload

from fastapi import FastAPI, Body
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.get("/items/{item_id}")
async def get_item(item_id: int):
    return {"item_id": item_id, "message": "Item retrieved"}

@app.post("/items/")
async def create_item(item: Item = Body(...)):
    return {"name": item.name, "price": item.price, "message": "Item created"}