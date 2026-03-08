# Project Name

## Prerequisites
Make sure you have these installed before running the project:
- [Node.js] (v18 or higher)
- [.NET SDK] (v8)
- [Visual Studio] (for backend)
- [VSCode](for frontend)
- [Sql Server] 

---

## Getting Started

### 1. Clone the repository
tao clone tu git

### 2. Setup the Backend (ASP.NET API)
mo file (.sin) backend trong virtual studio,
tu tao file appsettings.json(lay tu cac bai khac) va them : 
{
  "ConnectionStrings": {
    "DefaultConnection": "Server:'server sql connect';Database=p3_MyImage_2;Trusted_Connection=True;TrustServerCertificate=True"
  }
}

roi chay thu


### 3. Setup the Frontend (React)
mo file frontend trong vscode va mo terminal hay cmd, roi chay:
npm install
npm start



## Branching Rules
- `main` — stable only, no direct pushes
- `team member` — merge your features here first
