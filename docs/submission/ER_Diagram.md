# ER Diagram - FRMS

```mermaid
erDiagram
    USER {
      ObjectId _id PK
      string name
      string email UK
      string role
      ObjectId department FK
      string designation
      bool isActive
    }

    DEPARTMENT {
      ObjectId _id PK
      string name UK
      string code UK
      ObjectId hod FK
      bool isActive
    }

    FACULTY_PROFILE {
      ObjectId _id PK
      ObjectId user FK UK
      string employeeId
      string qualification
      string[] researchInterests
    }

    PUBLICATION {
      ObjectId _id PK
      string title
      string type
      ObjectId submittedBy FK
      ObjectId department FK
      string approvalStatus
      number score
    }

    RESEARCH_PROJECT {
      ObjectId _id PK
      string projectTitle
      ObjectId submittedBy FK
      ObjectId department FK
      string approvalStatus
    }

    PATENT {
      ObjectId _id PK
      string patentTitle
      ObjectId submittedBy FK
      ObjectId department FK
      string approvalStatus
    }

    GRANT {
      ObjectId _id PK
      string grantProposal
      ObjectId submittedBy FK
      ObjectId department FK
      string approvalStatus
    }

    EVENT {
      ObjectId _id PK
      string eventName
      ObjectId submittedBy FK
      ObjectId department FK
      string approvalStatus
    }

    REPORT {
      ObjectId _id PK
      ObjectId generatedBy FK
      string type
      string format
      string filePath
    }

    NOTIFICATION {
      ObjectId _id PK
      ObjectId recipient FK
      string type
      bool isRead
    }

    LOOKUP {
      ObjectId _id PK
      string type
      string value
      bool isActive
    }

    AI_RESEARCH_PAPER {
      ObjectId _id PK
      ObjectId uploadedBy FK
      string fileUrl
    }

    AI_SEMANTIC_DOCUMENT {
      ObjectId _id PK
      string sourceType
      ObjectId sourceId
      ObjectId faculty FK
      ObjectId department FK
    }

    PLAGIARISM_REPORT {
      ObjectId _id PK
      ObjectId publication FK
      ObjectId submittedBy FK
      number similarityPercentage
      bool flagged
    }

    SYSTEM_SETTING {
      ObjectId _id PK
      string key UK
      mixed value
      ObjectId updatedBy FK
    }

    AUDIT_LOG {
      ObjectId _id PK
      ObjectId actor FK
      string action
      string module
      string status
    }

    ANALYTICS_SNAPSHOT {
      ObjectId _id PK
      string type
      object payload
      date generatedAt
    }

    DEPARTMENT ||--o{ USER : has_members
    USER ||--|| FACULTY_PROFILE : owns
    USER ||--o{ PUBLICATION : submits
    USER ||--o{ RESEARCH_PROJECT : submits
    USER ||--o{ PATENT : submits
    USER ||--o{ GRANT : submits
    USER ||--o{ EVENT : submits
    USER ||--o{ REPORT : generates
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ AI_RESEARCH_PAPER : uploads
    USER ||--o{ PLAGIARISM_REPORT : submits
    USER ||--o{ AUDIT_LOG : performs
    USER ||--o{ SYSTEM_SETTING : updates
    DEPARTMENT ||--o{ PUBLICATION : groups
    DEPARTMENT ||--o{ RESEARCH_PROJECT : groups
    DEPARTMENT ||--o{ PATENT : groups
    DEPARTMENT ||--o{ GRANT : groups
    DEPARTMENT ||--o{ EVENT : groups
    DEPARTMENT ||--o{ AI_SEMANTIC_DOCUMENT : indexes
    PUBLICATION ||--o{ PLAGIARISM_REPORT : has_report
```

