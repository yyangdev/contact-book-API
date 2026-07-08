from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

tasks = []

total = 1

class Task(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

@app.post("/todos")
def create(task: Task):
    global total
    new_task = {
        "id": total,
        "title": task.title,
        "description": task.description,
        "completed": task.completed
    }
    total += 1
    tasks.append(new_task)
    return new_task

@app.get("/todos")
def get_task():
    return tasks

@app.get("/todos/{task_id}")
def get_for_id(task_id : int):
    for task in tasks:
        if task["id"] == task_id:
            return task
        
    raise HTTPException(status_code=404,
                        detail="not found")

@app.patch("/todos/{task_id}")
def patch_task(task_id: int, completed: bool):
    for task in tasks:
        if task["id"] == task_id:
            task["completed"] = completed
            return task

    raise HTTPException(status_code=404,
                        detail="not found")

@app.delete("/todos/{task_id}")
def del_task(task_id: int):
    for i, task in enumerate(tasks):  
        if task["id"] == task_id:
            del tasks[i]              
            return {"message": "Task deleted"}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Task not found"
    )

    