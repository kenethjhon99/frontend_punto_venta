export const getUserRoleNames = (user) => {
  const roles = Array.isArray(user?.roles) ? user.roles : [];

  return roles
    .map((rol) => {
      if (typeof rol === "string") {
        const normalized = rol.trim().toUpperCase();
        return normalized === "SUPERADMIN" ? "SUPER_ADMIN" : normalized;
      }

      const normalized = String(
        rol?.nombre_rol || rol?.nombre || rol?.rol || rol?.role || ""
      )
        .trim()
        .toUpperCase();
      return normalized === "SUPERADMIN" ? "SUPER_ADMIN" : normalized;
    })
    .map((role) => {
      if (role === "ADMINISTRADOR") return "ADMIN";
      if (role === "VENDEDOR") return "CAJERO";
      if (role === "CAJERA") return "CAJERO";
      if (role === "ENCARGADO_SERVICIO") return "ENCARGADO_SERVICIOS";
      return role;
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

export const isServiciosManagerUser = (user) =>
  userHasRole(user, "ENCARGADO_SERVICIOS") &&
  !userHasRole(user, "SUPER_ADMIN", "ADMIN");

const OPERATIVE_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "CAJERO",
  "MECANICO",
  "ENCARGADO_SERVICIOS",
];

export const getDefaultRoute = (user) => {
  if (userHasRole(user, "SUPER_ADMIN", "ADMIN")) {
    return "/dashboard";
  }

  if (userHasRole(user, "ENCARGADO_SERVICIOS")) {
    return "/servicios";
  }

  if (userHasRole(user, "LECTURA")) {
    return "/dashboard";
  }

  if (userHasRole(user, "CAJERO")) {
    return "/ventas";
  }

   if (userHasRole(user, "MECANICO")) {
    return "/carwash/reparacion";
  }

  return "/login";
};

export const isReadOnlyUser = (user) => {
  const roles = getUserRoleNames(user);
  const hasLectura = roles.includes("LECTURA");
  const hasOperativeRole = roles.some((role) => OPERATIVE_ROLES.includes(role));

  return hasLectura && !hasOperativeRole;
};
