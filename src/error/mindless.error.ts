export class MindlessError extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, MindlessError.prototype)

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor)
  }
}
