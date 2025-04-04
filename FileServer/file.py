from fastapi import FastAPI, File, UploadFile, HTTPException, APIRouter
from fastapi.staticfiles import StaticFiles
from typing import List
from pathlib import Path
import uuid
from datetime import datetime

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [ "*" ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPORTED_FORMATS = ("pdf", "docx")
SERVER_URL = "http://localhost:8000"


from datetime import datetime
import psycopg2


db_config = {
    'dbname': 'mydb',  
    'user': 'postgres',        
    'password': 'kima2002',     
    'host': 'localhost',             
    'port': '5432'                   
}

import re
import os
from pdfminer.high_level import extract_text
from docx import Document


def extract_contact_info(file_path):
    # Determine file type
    file_ext = os.path.splitext(file_path)[1].lower()
    
    # Extract text based on file type
    if file_ext == '.pdf':
        text = extract_text(file_path)
    elif file_ext == '.docx':
        doc = Document(file_path)
        text = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
    else:
        raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")
    
    # Regular expression for phone numbers (improved pattern)
    phone_regex = re.compile(
        r'(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})'  # Common formats
        r'|\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'  # US-style numbers
        r'|\b\d{10}\b'  # 10-digit numbers
    )
    
    # Regular expression for email addresses
    email_regex = re.compile(
        r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'
    )
    
    # Find matches and deduplicate
    phone_numbers = list(set(phone_regex.findall(text)))
    emails = list(set(email_regex.findall(text)))
    
    # Clean phone numbers (join tuple matches from regex groups)
    cleaned_phones = []
    for number in phone_numbers:
        if isinstance(number, tuple):
            # Join non-empty groups and remove non-numeric characters
            cleaned = ''.join(number).replace('(', '').replace(')', '')
            cleaned_phones.append(cleaned)
        else:
            cleaned_phones.append(number)
    
    return {
        'phone_numbers': cleaned_phones,
        'emails': emails
    }

def insert_resumes_db(file_path, cvId, cvUrl, jobOfferId=None):
    contact_info = extract_contact_info(file_path)
    print("Phone Numbers:", contact_info['phone_numbers'])
    print("Emails:", contact_info['emails'])

    email = ""
    phoneNumber = ""

    if contact_info['emails']:
        email = contact_info['emails'][0]
    if contact_info['phone_numbers']:
        phoneNumber = contact_info['phone_numbers'][0]

    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()
        print("Connected to the database successfully!")

        # First insert the user
        insert_user_query = """
        INSERT INTO "User" (
            "email", 
            "phoneNumber", 
            "role", 
            "cvId",
            "cvUrl"
        ) VALUES (
            %s, %s, %s, %s, %s
        ) RETURNING "UserId";
        """
        cursor.execute(insert_user_query, (
            email,
            phoneNumber,
            "user",
            cvId,
            cvUrl
        ))
        user_id = cursor.fetchone()[0]

        # If jobOfferId is provided, create a job application
        if jobOfferId:
            insert_application_query = """
            INSERT INTO "JobApplication" (
                "userId",
                "jobOfferId",
                "createdAt",
                "updatedAt"
            ) VALUES (
                %s, %s, NOW(), NOW()
            );
            """
            cursor.execute(insert_application_query, (user_id, jobOfferId))

        connection.commit()
        print("Data inserted successfully!")

    except psycopg2.Error as e:
        print(e)
    finally:
        if connection:
            connection.close()




# Mount static files directory
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), job_offer_id: int = None):
    # Validate PDF file
    if not file.filename.lower().endswith(SUPORTED_FORMATS):
        raise HTTPException(400, "File must be a PDF or DOCX")
    
    # Generate Path Name
    year = datetime.now().year
    unique_id = uuid.uuid4().hex
    dir_path = Path(f"static/resumes/{year}-{unique_id}")
    
    # Create directory and save file
    dir_path.mkdir(parents=True, exist_ok=True)
    file_path = dir_path / file.filename
    
    try:
        contents = await file.read()

        with open(file_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(500, f"Error saving file: {str(e)}")
    
    try:

        resume_id = f"{year}-{unique_id}"
        resume_url = f"{SERVER_URL}/static/resumes/{year}-{unique_id}/{file.filename}"

        insert_resumes_db(file_path, resume_id, resume_url, job_offer_id)
    except Exception as e:
        print(f"Error: {e}")
    
    return {"url": f"{SERVER_URL}/static/resumes/{year}-{unique_id}/{file.filename}"}

@app.post("/upload-resumes-hr/{job_offer_id}")
async def upload_resumes_hr(job_offer_id: int, files: List[UploadFile] = File(...)):
    # Validate all files first
    invalid_files = []
    
    for file in files:
        if not file.filename.lower().endswith(SUPORTED_FORMATS):
            invalid_files.append(file.filename)

    if invalid_files:
        raise HTTPException(400, 
            f"Invalid files: {', '.join(invalid_files)}. All files must be PDFs")

    # Create directory and save file
    urls = []

    # Generate Path Name
    for file in files:
        year = datetime.now().year
        unique_id = uuid.uuid4().hex
        dir_path = Path(f"static/resumes/{year}-{unique_id}")
    
        dir_path.mkdir(parents=True, exist_ok=True)
        file_path = dir_path / file.filename

        try:
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            urls.append(f"{SERVER_URL}/static/resumes/{year}-{unique_id}/{file.filename}")

            try:
                resume_id = f"{year}-{unique_id}"
                resume_url = f"{SERVER_URL}/static/resumes/{year}-{unique_id}/{file.filename}"
                insert_resumes_db(file_path, resume_id, resume_url, job_offer_id)
                
            except Exception as e:
                print(f"Error: {e}")

        except Exception as e:
            raise HTTPException(500, f"Error saving {file.filename}: {str(e)}")

    return {"urls": urls}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)