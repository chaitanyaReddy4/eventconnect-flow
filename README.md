# eventconnect Requirement Posting Flow

A full-stack requirement posting application built for the GoPratle Full-Stack Developer Intern technical assignment.

The application allows event organizers to create structured requirements for **Event Planners, Performers, and Event Crew** through a multi-step form. Requirements are validated on the frontend, submitted through a REST API, and persisted in MongoDB Atlas.

---

## Features

### Multi-Step Requirement Form

The application follows a four-step requirement creation flow:

1. **Event Basics**
   - Event name
   - Event type
   - Start and end dates
   - Location
   - Optional venue
   - Requirement category

2. **Category Details**
   - Dynamic fields based on the selected category
   - Event Planner requirements
   - Performer requirements
   - Event Crew requirements

3. **Additional Requirements**
   - Additional requirements
   - Special instructions
   - Equipment requirements
   - Setup and timing notes
   - Other preferences

4. **Review & Submit**
   - Review all entered information
   - Edit previous sections
   - Submit the final requirement

---

## Supported Categories

### Event Planner

Planner-specific information includes:

- Planning type
- Expected guest count
- Services required
- Budget range
- Experience preference
- Planner notes

### Performer

Supports both **individual performers and bands/groups**.

#### Individual Performers

Supported performer types include:

- DJ
- Singer
- Dancer
- Instrumentalist
- Comedian
- Other

Depending on the performer type, the form dynamically collects relevant information such as:

- Performance style
- Genre
- Equipment requirements
- Vocal style
- Instrument
- Number of songs
- Number of dancers
- Performance/set duration
- Experience preference
- Budget

#### Bands / Groups

Band requirements include:

- Group name
- Number of members
- Performance style
- Genre
- Performance duration
- Experience preference
- Budget
- Equipment provided/required
- Sound check requirements
- Stage/setup requirements
- Member roles and quantities

### Event Crew

Crew requirements support categories such as:

- Photography
- Videography
- Sound
- Lighting
- Stage Management
- Event Support
- Security
- Other

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- JavaScript
- Mongoose

### Database

- MongoDB Atlas

### Development Tools

- Git
- GitHub
- Postman
- VS Code

---

## Architecture

```text
┌──────────────────────────────┐
│          Next.js             │
│          Frontend            │
│                              │
│  Multi-Step Requirement Form │
└──────────────┬───────────────┘
               │
               │ HTTP REST API
               ▼
┌──────────────────────────────┐
│       Node.js + Express      │
│                              │
│   POST /api/requirements     │
│   GET  /api/requirements     │
└──────────────┬───────────────┘
               │
               │ Mongoose
               ▼
┌──────────────────────────────┐
│        MongoDB Atlas         │
│                              │
│   gopratle                   │
│      └── requirements        │
└──────────────────────────────┘
API Endpoints
Create Requirement
POST /api/requirements

Example request:

{
  "eventName": "Summer Music Festival",
  "eventType": "Festival",
  "startDate": "2026-11-10",
  "endDate": "2026-11-10",
  "location": "Hyderabad",
  "venue": "Open Grounds",
  "category": "performer",
  "categoryDetails": {
    "performerMode": "individual",
    "performerType": "DJ",
    "equipment": "Professional DJ setup",
    "performanceStyle": "EDM",
    "setDuration": "2 hours",
    "experience": "Experienced",
    "budget": "₹20,000 - ₹40,000"
  },
  "additionalRequirements": "Sound check required before the event."
}
Get Requirements
GET /api/requirements

Returns submitted requirements sorted by most recent submission.

Data Model

Each requirement contains:

Requirement
├── eventName
├── eventType
├── startDate
├── endDate
├── location
├── venue
├── category
├── categoryDetails
├── additionalRequirements
├── createdAt
└── updatedAt

categoryDetails uses a flexible MongoDB structure because each requirement category has different fields.

Project Structure
eventconnect-flow/
│
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   └── RequirementForm.tsx
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── requirementController.js
│   │   ├── models/
│   │   │   └── Requirement.js
│   │   ├── routes/
│   │   │   └── requirementRoutes.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
Local Setup
Prerequisites

Make sure the following are installed:

Node.js
npm
Git
MongoDB Atlas account
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/eventconnect-flow.git
cd eventconnect-flow
2. Setup Backend
cd backend
npm install

Create a .env file:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_ORIGIN=http://localhost:3000

Start the backend:

npm run dev

The API will run on:

http://localhost:5000
3. Setup Frontend

Open another terminal:

cd frontend
npm install

Create .env.local:

NEXT_PUBLIC_API_URL=http://localhost:5000

Start the frontend:

npm run dev

Open:

http://localhost:3000
Environment Variables
Backend
Variable	Description
PORT	Backend server port
MONGODB_URI	MongoDB Atlas connection string
FRONTEND_ORIGIN	Frontend URL allowed by CORS
Frontend
Variable	Description
NEXT_PUBLIC_API_URL	Backend API base URL

Never commit .env or .env.local files to GitHub.

Validation

The application performs validation throughout the multi-step flow.

Examples include:

Required event information
Required category selection
End date cannot be before start date
Custom event type is required when Other is selected
Category-specific required fields
Required additional requirements before submission

The form separates navigation from submission:

Step 3
   │
   │ Continue
   ▼
Step 4 Review
   │
   │ Submit Requirement
   ▼
POST /api/requirements
   │
   ▼
MongoDB Atlas

This prevents accidental API submission while navigating between form steps.

Database Persistence

Requirements are stored in MongoDB Atlas.

Current database structure:

gopratle
└── requirements
    └── Requirement documents

Each submitted requirement receives a MongoDB-generated _id along with createdAt and updatedAt timestamps.

Testing the Flow

A complete submission can be tested by:

Opening the frontend.
Entering Event Basics.
Selecting Planner, Performer, or Crew.
Completing category-specific fields.
Adding additional requirements.
Continuing to the Review page.
Reviewing the entered information.
Clicking Submit Requirement.
Checking the API response.
Verifying the document in MongoDB Atlas.
API Response

A successful submission returns a response containing the saved requirement.

Example:

{
  "success": true,
  "data": {
    "_id": "mongodb-generated-id",
    "eventName": "Summer Music Festival",
    "eventType": "Festival",
    "category": "performer",
    "createdAt": "2026-09-16T00:00:00.000Z",
    "updatedAt": "2026-09-16T00:00:00.000Z"
  }
}
Design Approach

The form uses a dynamic data structure so that common event information is stored consistently while category-specific requirements remain flexible.

The categoryDetails field allows different categories to have different data without requiring separate MongoDB collections for planners, performers, and crew.

This keeps the API simple while allowing the frontend to adapt the form based on user selections.

Future Improvements

Possible future improvements include:

User authentication
Requirement editing after submission
Requirement search and filtering
Requirement management dashboard
Image/file uploads
Vendor/performer matching
Notifications
Admin management interface
Pagination for large numbers of requirements
Assignment Deliverables

This project includes:

Working full-stack requirement posting flow
Responsive frontend
REST API
MongoDB Atlas persistence
Category-specific dynamic requirements
GitHub repository
Production deployment
Demo walkthrough
Author

Chaitu Reddy
