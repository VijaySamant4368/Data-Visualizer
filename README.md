
# VijaySamant_PlotTest

An interactive, full-stack web application that enables users to upload CSV datasets and generate dynamic scatter plots using customizable X and Y axes.

---

## Features

-  User authentication (JWT-based)
-  Secure CSV upload with validation
-  MongoDB metadata and user's data storage
-  Scatter plot generation with Plotly
-  Live axis switching without page reload
-  Full frontend-backend separation using Next.js and FastAPI

---

## Project Structure

```
Root
├── frontend/     # Next.js application
├── backend/      # FastAPI backend
├── README.md
```

---

## Tech Stack

| Layer      | Tech Used         |
|------------|-------------------|
| Frontend   | Next.js (React, TypeScript) |
| Backend    | FastAPI (Python)  |
| Database   | MongoDB |
| Auth       | JWT               |
| Charts     | Plotly.js         |

---

## Setup Instructions

### Clone the repo
```
git clone https://github.com/VijaySamant4368//VijaySamant_PlotTest.git
cd VijaySamant_PlotTest
```

###  Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
````
 Before running the backend, create a .env file in the backend/ directory with the following:
```
MONGO_URI="your_mongodb_connection_string"
SECRET_KEY="your_jwt_secret_key"
```
Backend runs on: `http://localhost:8000`

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```
Before running the frontend, create a .env file in the frontend/ directory with the following:
```
NEXT_PUBLIC_BACKEND_URL="Backend-URL"
```
> Frontend runs on: `http://localhost:3000`

---

## Authentication APIs

### `POST /auth/signup`

Register a new user.

**Request Body:**

```json
{
  "username": "John_Doe",
  "email": "email123@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

---

### `POST /auth/login`

Authenticate and get JWT token.

**Request Body:**

```json
{
  "username": "John_Doe",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

> Use this token in `Authorization: Bearer <token>` headers for protected routes.\
> Automatically added to the localstorage of the broswer used for signing in

---

##  Dataset Upload/Download API

### `POST api/upload`

Uploads a CSV file.

**Headers:**

```
Authorization: Bearer <token>
```

**Form Data:**


| Field          | Type    | Required/Default | Description                           |
| -------------- | ------- | ---------------- | ------------------------------------- |
| `file`         | File    | ✅        | CSV file to upload                    |
| `title`        | String  | ✅        | Title for the dataset                 |
| `description`  | String  | ❌        | Optional description                  |
| `hasHeaders`   | Boolean | Defaults as false        | If `True`, uses first row as headers  |
| `defaultValue` | Number     | ❌        | Value to fill in missing cells (if any) |

**Missing Value Handling:**\
If `defaultValue` is provided, all missing cells in the dataset will be filled with this value.

If `defaultValue` is not provided, and the dataset contains missing values, the upload will be rejected with a 400 error.

**Response:**

```json
{
  "dataSet": [[1.1, 2.3, 3.4], [4.2, 5.6, 6.7], ...],
  "columns": ["col1", "col2", "col3", ...],
  "title": "My Dataset",
  "description": "Optional notes about the dataset",
  "file_id": "uuid-1234-abcd"
}

```

> Requires at least **5 numeric columns**. Validated server-side.

---

###  `GET api/download/{file_id}`

Fetches the full dataset (including column names and values) for a file previously uploaded by the authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

**Path Parameter:**

| Param     | Type   | Required | Description               |
| --------- | ------ | -------- | ------------------------- |
| `file_id` | String | ✅        | The unique ID of the file |


### Access Control

* Only the original owner of the file can download it.
* The backend checks that the file exists on disk and belongs to the requesting user.

### Successful Response

```json
{
  "metadata": {
    "file_id": "uuid",
    "title": "Dataset title",
    "description": "Optional description",
    "owner": "user_id",
    "upload_time": "timestamp"
  },
  "columns": ["col1", "col2", "col3", ...],
  "data": [
    [1.1, 2.2, 3.3],
    [4.4, 5.5, 6.6],
    ...
  ]
}
```

### Error Responses

* `403 Forbidden`: User is not the owner of the file.
* `404 Not Found`: File metadata or file on disk not found.
* `500 Internal Server Error`: Error reading the CSV file.
---

## File APIs

### `DELETE api/files/{file_id}` 

Deletes a file owned by the authenticated user. Also removes the file from disk.

**Headers:**

```
Authorization: Bearer <token>
```

**Path Parameter:**

| Param     | Type   | Required | Description              |
| --------- | ------ | -------- | ------------------------ |
| `file_id` | String | ✅        | ID of the file to delete |

### Successful Response

```json
{
  "message": "File deleted"
}
```


### Error Response

* `404 Not Found`: File not found or does not belong to the user.

---
##  List User's Files
### `GET api/files/by-user`

Returns a list of files uploaded by the currently authenticated user.

**Headers:**

```
Authorization: Bearer <token>
```

---

### Successful Response

```json
[
  {
    "id": "abc123",
    "file_id": "uuid-xyz",
    "title": "Example Dataset",
    "description": "Optional note",
    "uploadDate": "2025-07-12T15:34:00Z",
    "owner": "user_id",
  },
  ...
]
```

> Results are sorted by `uploadDate` in **descending order** (most recent first).

---

## Frontend Flow

Below is a visual representation of the user interaction flow:

![Frontend Flow](./frontend/public/FrontendFlow.drawio.svg)

---

## Edge Case Handling

| Scenario| Behavior|
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| CSV has fewer than 5 numeric columns                                   |  Upload is **rejected** with a `400` error.                                                                       |
| Dataset contains missing values                                        | If `defaultValue` is provided, missing cells are **auto-filled**. <br> If not provided, upload is **rejected**. |
| CSV lacks headers (`hasHeaders=False`)                                 | Columns are **automatically named**: `Col1`, `Col2`, `Col3`, ...                                                     |
| Some headers are missing (`hasHeaders=True`)                           | Blank headers are **replaced with auto-generated ones**: e.g., `Col3`, while preserving others.                      |
---

## Demo Video

[Watch the demo](#)

---

## Assumptions & Design Choices

* JWT used for secure token-based authentication.
* Uploaded files are stored locally; metadata is stored in a database.
* Plot generation handled client-side via Plotly using column data fetched from the backend.
* Axis dropdown is dynamic and populated from the uploaded CSV's headers.
* Only numeric columns are accepted for plotting.

---

## Author

Made with ❤️ by Vijay Samant

---
