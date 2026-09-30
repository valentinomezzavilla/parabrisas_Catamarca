import { z } from "zod";

/**
 * Zod con mensajes en español pensados para el usuario del panel.
 * Los casos no cubiertos acá caen en el locale "es" que trae Zod.
 */
z.config(z.locales.es());
z.config({
  customError: (issue) => {
    switch (issue.code) {
      case "invalid_type":
        if (issue.input === undefined || issue.input === null || issue.input === "") return "Campo obligatorio";
        if (issue.expected === "number") return "Ingresá un número";
        return undefined;
      case "too_small":
        if (issue.input === "") return "Campo obligatorio";
        if (issue.origin === "string")
          return issue.minimum === 1 ? "Campo obligatorio" : `Debe tener al menos ${issue.minimum} caracteres`;
        if (issue.origin === "number") return `Debe ser ${issue.inclusive ? "mayor o igual a" : "mayor a"} ${issue.minimum}`;
        if (issue.origin === "array") return `Agregá al menos ${issue.minimum}`;
        return undefined;
      case "too_big":
        if (issue.origin === "string") return `Máximo ${issue.maximum} caracteres`;
        if (issue.origin === "number") return `Debe ser ${issue.inclusive ? "menor o igual a" : "menor a"} ${issue.maximum}`;
        return undefined;
      case "invalid_format":
        if (issue.format === "email") return "Email inválido";
        return undefined;
      case "invalid_value":
        return "Elegí una opción válida";
      default:
        return undefined;
    }
  },
});

export { z };
