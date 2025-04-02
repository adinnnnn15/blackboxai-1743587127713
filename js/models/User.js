// Base User class with TypeScript-like typing
class User {
  constructor(id, username, email, role = 'customer') {
    this._id = id;
    this._username = username;
    this._email = email;
    this._role = role;
  }

  // Properties with getters/setters
  get id() { return this._id; }
  get username() { return this._username; }
  set username(value) { this._username = value; }
  get email() { return this._email; }
  get role() { return this._role; }

  // Interface method
  displayInfo() {
    return `${this.username} (${this.email}) - ${this.role}`;
  }
}

// Admin user inheriting from User
class AdminUser extends User {
  constructor(id, username, email) {
    super(id, username, email, 'admin');
    this._permissions = ['create', 'read', 'update', 'delete'];
  }

  // Polymorphic method override
  displayInfo() {
    return `${super.displayInfo()} - Permissions: ${this._permissions.join(', ')}`;
  }

  // Method overloading simulation
  hasPermission(permission, resource = null) {
    if (resource) {
      return this._permissions.includes(permission) && 
             this._hasResourceAccess(resource);
    }
    return this._permissions.includes(permission);
  }

  _hasResourceAccess(resource) {
    // Implementation for resource-specific access
    return true;
  }
}

export { User, AdminUser };