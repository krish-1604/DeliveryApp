# 🚚 Delivery App (React Native)

Welcome to the **Delivery App** repository!

This repository is designed for **version control** and **collaborative development** of a React Native mobile application using the Expo framework.  
It follows clean code practices using tools like **Husky**, **Commitizen**, **Prettier**, **ESLint**, and **lint-staged** to ensure a consistent and professional development workflow.

---

## 📦 Tech Stack

- **React Native (Expo)**
- **TypeScript**
- **Tailwind CSS (NativeWind)**
- **React Navigation**
- **Jest** for testing
- **Prettier** + **ESLint** for code formatting and linting
- **Husky** + **Commitizen** + **Commitlint** for commit standardization

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/delivery-app.git
cd delivery-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run start
```

#### Or run:

- ```npm run android``` — Launch on Android
- ```npm run ios``` — Launch on iOS
- ```npm run web``` — Launch on Web

---

## ✨ Code Quality & Formatting

We use the following tools to maintain code quality:

- **ESLint** — Identifies and fixes code issues.
- **Prettier** — Formats code for consistency.
- **lint-staged** — Applies Prettier and ESLint only on staged files during commit

| 		Task	  	  |		 Command 	          |
|---------------------|------------------         |
|Lint all files		  | ```npm run lint```              |
Auto-fix lint issues  | ```npm run lintFixAll```        |
Format all code       | ```npm run prettierFixAll```    |
Format + Lint fix     |```npm run fix:lintPrettier```  |

---

## 💬 Commit Message Convention
This project enforces commit message formatting using Husky, Commitizen, and Commitlint.
All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

### How to Commit

```bash
git add <filenames | .>
npm run commit

# After above commands you will be asked questions regarding the commit and commit message to write
```

---

## ✅ Pre-commit Hook with lint-staged
Before each commit, Husky runs lint-staged to:

- Format .ts and .tsx files using Prettier
- Lint and auto-fix them using ESLint

Only staged files are affected to ensure clean commits.


## 🤝 Contribution Guidelines

#### 1. Pull the latest code from ```master```.
#### 2. Create a new branch for your feature or bugfix.
#### 3. Write clean and tested code.
#### 4. Stage changes with:
```bash
git add .
```
#### 5. Commit using:
```bash
npm run commit
```
#### 6. Push and open a pull request.