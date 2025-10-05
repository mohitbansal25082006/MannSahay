# Contributing to MannSahay

First off, thank you for considering contributing to MannSahay! It's people like you that make MannSahay such a great tool for supporting student mental health across India.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Community](#community)

---

## Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Examples of behavior that contributes to creating a positive environment include:**

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Examples of unacceptable behavior include:**

- The use of sexualized language or imagery and unwelcome sexual attention or advances
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at mohitbansal25082006@gmail.com. All complaints will be reviewed and investigated promptly and fairly.

---

## How Can I Contribute?

### Types of Contributions

We welcome many types of contributions, including:

- **Bug Reports**: Found a bug? Let us know!
- **Feature Requests**: Have an idea? Share it!
- **Code Contributions**: Ready to code? Jump in!
- **Documentation**: Improve our docs
- **Translations**: Help us reach more students
- **Design**: Enhance our UI/UX
- **Testing**: Help us maintain quality

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **PostgreSQL** (or a Neon account)
- **Code Editor** (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/MannSahay.git
   cd MannSahay
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/mohitbansal25082006/MannSahay.git
   ```

---

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

Fill in your environment variables (see README.md for details).

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npm run seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 to see your changes.

---

## Project Structure

```
MannSahay/
├── prisma/              # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js app directory
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard pages
│   │   └── auth/        # Authentication pages
│   ├── components/      # React components
│   │   ├── ui/          # UI primitives
│   │   ├── dashboard/   # Dashboard components
│   │   ├── forum/       # Forum components
│   │   ├── booking/     # Booking components
│   │   └── resources/   # Resource components
│   ├── lib/             # Utility functions
│   │   ├── db.ts        # Prisma client
│   │   ├── auth.ts      # NextAuth config
│   │   ├── openai.ts    # AI integration
│   │   └── utils.ts     # Helper functions
│   └── types/           # TypeScript types
├── .env.local           # Environment variables
├── package.json
└── tsconfig.json
```

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React Components

```typescript
// Good: Functional component with proper types
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {children}
    </button>
  );
}
```

### API Routes

```typescript
// Good: Proper error handling and types
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await prisma.post.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use semantic class names for custom CSS
- Maintain consistent spacing and colors

### Code Formatting

We use ESLint and Prettier for code formatting:

```bash
# Run linter
npm run lint

# Format code
npm run format
```

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types**: PascalCase with descriptive names (e.g., `UserProfile`, `ApiResponse`)

---

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code refactoring without changing functionality
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Changes to build process or auxiliary tools

### Examples

```bash
feat(forum): add multilingual post translation

Add translation feature that allows users to view posts in their preferred language using OpenAI API.

Closes #123

---

fix(booking): resolve calendar date selection bug

Fixed issue where selecting dates in the past was possible. Added validation to prevent past date selection.

Fixes #456

---

docs(readme): update installation instructions

Added detailed steps for setting up local development environment including database configuration.
```

### Best Practices

- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep subject line under 50 characters
- Capitalize first letter of subject
- No period at the end of subject
- Separate subject from body with blank line
- Wrap body at 72 characters
- Reference issues and pull requests in footer

---

## Pull Request Process

### Before Submitting

1. **Update your fork** with the latest upstream changes:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following our coding standards

4. **Test your changes**:
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

5. **Commit your changes** following commit guidelines

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting Pull Request

1. Go to the [MannSahay repository](https://github.com/mohitbansal25082006/MannSahay)
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill in the PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
```

### Review Process

1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: Team members will review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, your PR will be merged

### After Merge

1. Delete your feature branch:
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. Update your local main branch:
   ```bash
   git checkout main
   git pull upstream main
   ```

---

## Reporting Bugs

### Before Submitting a Bug Report

- Check if the bug has already been reported
- Verify it's not a configuration issue
- Collect information about the bug

### How to Submit a Bug Report

Use the [GitHub issue tracker](https://github.com/mohitbansal25082006/MannSahay/issues) and include:

**Title**: Clear and descriptive title

**Environment**:
- OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [e.g., Chrome 96, Firefox 94, Safari 15]
- Node version: [e.g., 18.0.0]
- MannSahay version/commit: [e.g., v1.0.0 or commit hash]

**Description**:
- Clear description of the bug
- Expected behavior
- Actual behavior

**Steps to Reproduce**:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Screenshots**: If applicable, add screenshots

**Additional Context**: Any other relevant information

**Error Logs**: Include relevant console output or error messages

---

## Suggesting Enhancements

### Before Submitting

- Check if the enhancement has already been suggested
- Determine if it aligns with project goals
- Gather details about the proposed enhancement

### How to Submit an Enhancement

Use the [GitHub issue tracker](https://github.com/mohitbansal25082006/MannSahay/issues) and include:

**Title**: Clear and descriptive title

**Problem Statement**: What problem does this solve?

**Proposed Solution**: Detailed description of the enhancement

**Alternatives Considered**: Other solutions you've thought about

**Additional Context**: Mockups, examples, or references

**Impact**: Who benefits from this enhancement?

---

## Community

### Communication Channels

- **GitHub Issues**: [Bug reports and feature requests](https://github.com/mohitbansal25082006/MannSahay/issues)
- **GitHub Discussions**: [General questions and discussions](https://github.com/mohitbansal25082006/MannSahay/discussions)
- **Email**: mohitbansal25082006@gmail.com

### Getting Help

If you need help:

1. Check existing documentation
2. Search closed issues
3. Ask in GitHub Discussions
4. Contact the maintainers

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Acknowledged in the project

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)

---

## License

By contributing to MannSahay, you agree that your contributions will be licensed under the MIT License.

---

## Thank You!

Your contributions to MannSahay help make mental health support more accessible to millions of Indian students. Every contribution, no matter how small, makes a difference!

**Team BotZilla**
