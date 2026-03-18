export const getUserRoleNames = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return roles
    .map((rol) => {
      if (typeof rol === "string") {
        return rol.trim().toUpperCase();
      }

      return String(rol?.nombre_rol || "")
        .trim()
        .toUpperCase();
    })
    .filter(Boolean);
};

export const userHasRole = (user, ...allowedRoles) => {
  const roles = getUserRoleNames(user);
  const normalizedAllowed = allowedRoles.map((rol) =>
    String(rol).trim().toUpperCase()
  );

  return normalizedAllowed.some((rol) => roles.includes(rol));
};

export const getDefaultRoute = (user) => {
  if (userHasRole(user, "SUPER_ADMIN", "ADMIN")) {
    return "/dashboard";
  }

  if (userHasRole(user, "CAJERO")) {
    return "/ventas";
  }

  return "/login";
};
