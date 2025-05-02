# Task Master Instructions

This document serves as a comprehensive guide for Claude to implement a task-based project management system directly through the conversation interface. No external API or installation is required - this system operates entirely through structured prompts and responses within our conversation.

## Project Structure

When working on any software project, we'll follow this structure:

1. **Requirements Document** - Detailed description of features and functionality
2. **Task Breakdown** - Structured list of implementation tasks
3. **Development Workflow** - Systematic approach to task implementation
4. **Documentation** - Project documentation and code explanations

## Task Structure

Each task follows this format:

```
# Task ID: [NUMBER]
# Title: [BRIEF_DESCRIPTIVE_TITLE]
# Status: [pending/in-progress/done/deferred]
# Dependencies: [COMMA_SEPARATED_IDS_OR_"None"]
# Priority: [high/medium/low]
# Description: [BRIEF_TASK_DESCRIPTION]
# Details:
[DETAILED_IMPLEMENTATION_INSTRUCTIONS]
- [BULLET_POINTS_WITH_SPECIFICS]
- [IMPLEMENTATION_CONSIDERATIONS]
- [EDGE_CASES_TO_HANDLE]

# Test Strategy:
[HOW_TO_VERIFY_TASK_COMPLETION]
- [TEST_CASES]
- [VALIDATION_APPROACH]
```

For subtasks, use:

```
# Subtasks:
## Subtask ID: [PARENT_ID].[NUMBER] (e.g., 1.1)
## Title: [BRIEF_DESCRIPTIVE_TITLE]
## Status: [pending/in-progress/done/deferred]
## Description: [BRIEF_SUBTASK_DESCRIPTION]
## Details: [IMPLEMENTATION_DETAILS]
```

## Workflow Commands

Claude will respond to the following commands to manage tasks:

### 1. Initialize Project

```
Initialize project: [PROJECT_NAME]
Description: [PROJECT_DESCRIPTION]
Requirements: [PROJECT_REQUIREMENTS]
```

This will set up the project structure and generate an initial task list.

### 2. List Tasks

```
List tasks
```

Shows all tasks with ID, title, status, and dependencies.

```
List [STATUS] tasks
```

Shows tasks with a specific status (pending, in-progress, done, deferred).

### 3. Show Task Details

```
Show task [ID]
```

Displays complete details for a specific task.

### 4. Next Task

```
What's the next task?
```

Identifies the next task to work on based on dependencies and priorities.

### 5. Update Task Status

```
Set task [ID] status to [STATUS]
```

Updates the status of a task (pending, in-progress, done, deferred).

### 6. Add Task

```
Add task: [TITLE]
Description: [DESCRIPTION]
Dependencies: [COMMA_SEPARATED_IDS or "None"]
Priority: [high/medium/low]
Details: [IMPLEMENTATION_DETAILS]
Test Strategy: [TEST_STRATEGY]
```

Adds a new task to the project.

### 7. Expand Task

```
Expand task [ID]
```

Breaks down a complex task into subtasks.

```
Expand task [ID]: [CONTEXT]
```

Provides additional context for task expansion.

### 8. Implement Task

```
Implement task [ID]
```

Claude will help implement the specific task and provide code and explanations.

### 9. Project Summary

```
Project summary
```

Provides an overview of project progress and pending tasks.

## Task Management Rules

Claude should follow these rules when managing tasks:

1. **Dependencies First**: Tasks can only be started when all dependencies are completed
2. **Priority Order**: Higher priority tasks should be suggested first
3. **Status Tracking**: Task status should be updated throughout the conversation
4. **Task ID Consistency**: Task IDs remain constant once assigned
5. **Task Revision**: Task details can be updated but should maintain ID continuity
6. **Task Storage**: Claude should maintain the complete task list in context
7. **Progress Tracking**: Claude should track overall project progress
8. **Task Analysis**: Claude should analyze task complexity and suggest breakdowns for complex tasks

## Implementation Guidance

When implementing tasks, Claude should:

1. Reference the task details and test strategy
2. Provide complete, working code that addresses all requirements
3. Explain key implementation concepts and decisions
4. Address edge cases identified in the task
5. Demonstrate how the implementation meets the test strategy
6. Suggest tests or validation approaches

## Best Practices

1. **Start with detailed requirements**: Provide comprehensive requirements for better task generation
2. **Break down complex tasks**: Aim for tasks that can be completed in a reasonable timeframe
3. **Maintain dependencies**: Ensure logical progression through proper task dependencies
4. **Descriptive task titles**: Use specific and action-oriented titles
5. **Detailed test strategies**: Define clear verification methods for each task
6. **Regular status updates**: Update task statuses as work progresses
7. **Implementation change management**: When approach changes, update future tasks to maintain consistency

## Example Workflow

When starting a new project:

1. Begin by initializing the project with a name, description, and requirements
2. Review the generated task list and request modifications if needed 
3. Start with the first task that has no dependencies
4. Update task status as you progress
5. Request task details or implementation help as needed
6. Update and expand tasks as the project evolves

Each time we work on the project, we'll:
1. Get a project summary to understand current status
2. Identify the next task to work on
3. Implement or continue implementing that task
4. Update task status when complete
5. Move to the next appropriate task