# SkillMate

## 1. Problem Statement

Students possess different skills and knowledge, but there is no simple platform for them to exchange these skills with each other.

For example, a student who knows Python may want to learn UI/UX, while another student who knows UI/UX may want to learn Python. Finding the right person for such an exchange can be difficult.

**SkillMate** is a student-focused skill exchange platform that helps students discover suitable learning partners based on the skills they can teach, the skills they want to learn, their availability, and other preferences. The platform uses an intelligent matching system to recommend compatible skill partners.

---

## 2. Architecture / Flowchart

```text
                    ┌──────────────────┐
                    │     Student      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Web Interface  │
                    │   Registration    │
                    │    & Profile      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Skill Selection │
                    │                  │
                    │ Can Teach        │
                    │ Want to Learn    │
                    │ Availability     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Matching Engine  │
                    │                  │
                    │ Skill            │
                    │ Compatibility    │
                    │ Availability     │
                    │ Preferences      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Recommended      │
                    │ Skill Partners   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Connection /     │
                    │ Chat / Sessions  │
                    └──────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Learning & Skill │
                    │    Exchange      │
                    └──────────────────┘
```

---

## 3. Tech Stack

### Frontend

* HTML
* CSS
* JavaScript
* React.js

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Intelligent Matching

* Rule-based skill matching algorithm
* AI/LLM integration for intelligent skill identification and recommendations

### Hosting

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

### Development Tools

* Git
* GitHub
* VS Code

---

## 4. Team Name and Members

### Team Name

**[VEXORA]**

### Team Members

1. **[Hariharan G]**
2. **[Kiruthika S]**
3. **[Swedha Jasmine L]**
4. **[Harikrishnan K]**

---

## 5. College Name

**Erode Sengunthar Engineering College**

Tamil Nadu, India
