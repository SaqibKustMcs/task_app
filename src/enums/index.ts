/** User role in the task management hierarchy */
export enum UserRole {
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

/** Task lifecycle status */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

/** Task priority levels */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
