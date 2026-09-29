const sanitizeUser = (user) => {
  if (!user) return null;

  const source = typeof user.toObject === "function" ? user.toObject() : user;

  return {
    id: source._id?.toString?.() || source.id,
    _id: source._id?.toString?.() || source.id,
    first_name: source.first_name,
    last_name: source.last_name,
    email: source.email,
    role: source.role,
    accountStatus: source.accountStatus,
    emailVerificationStatus: source.emailVerificationStatus,
    image: source.image,
    last_login: source.last_login,
    register_Date: source.register_Date,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
  };
};

const sanitizeUsers = (users) => users.map((user) => sanitizeUser(user));

module.exports = {
  sanitizeUser,
  sanitizeUsers,
};
