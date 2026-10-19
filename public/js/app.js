// Mejoras chicas de la interfaz. Todo funciona sin este archivo (los formularios van al servidor);
// acá solo se suman comodidades: deshabilitar el botón mientras se envía, cerrar menús, filas dinámicas…

(() => {
  "use strict";

  // Mientras un formulario se envía, su botón queda deshabilitado y muestra `data-enviando`.
  // Se hace después del evento: un botón deshabilitado antes no viajaría en el formulario.
  document.addEventListener("submit", (e) => {
    const boton = e.submitter;
    if (!boton || e.defaultPrevented) return;
    setTimeout(() => {
      boton.disabled = true;
      if (boton.dataset.enviando) boton.textContent = boton.dataset.enviando;
    }, 0);
  });

  // Al volver con el botón "atrás" el navegador puede restaurar la página con el botón deshabilitado.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    for (const b of document.querySelectorAll("button[disabled][data-enviando]")) b.disabled = false;
  });

  // `[data-cerrar]` cierra el <details> que lo contiene (confirmaciones en dos pasos, menú "Más").
  document.addEventListener("click", (e) => {
    const cerrar = e.target.closest("[data-cerrar]");
    if (!cerrar) return;
    const details = cerrar.closest("details");
    if (details) details.open = false;
  });

  // Escape cierra el menú "Más" del celular.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    for (const d of document.querySelectorAll("details[data-menu][open], details[data-confirmar][open]")) d.open = false;
  });

  // Filas que se agregan y quitan (vehículos compatibles, franjas horarias).
  // `[data-agregar="x"]` clona `<template data-plantilla="x">` dentro de `[data-filas="x"]` (o del id `data-destino`).
  document.addEventListener("click", (e) => {
    const agregar = e.target.closest("[data-agregar]");
    if (agregar) {
      const nombre = agregar.dataset.agregar;
      const plantilla = document.querySelector(`template[data-plantilla="${nombre}"]`);
      const destino = document.getElementById(agregar.dataset.destino) ?? document.querySelector(`[data-filas="${nombre}"]`);
      if (!plantilla || !destino) return;
      const fila = plantilla.content.firstElementChild.cloneNode(true);
      // Segunda franja del día: lo habitual es el turno tarde.
      if (nombre.startsWith("franja-") && destino.querySelector("[data-fila]")) {
        fila.querySelector('[data-campo="desde"]').value = "16:30";
        fila.querySelector('[data-campo="hasta"]').value = "20:00";
      }
      destino.append(fila);
      actualizarFranjas();
      fila.querySelector("input:not([type=hidden]), select")?.focus();
      return;
    }
    const quitar = e.target.closest("[data-quitar]");
    if (quitar) {
      quitar.closest("[data-fila]")?.remove();
      actualizarFranjas();
    }
  });

  // Horarios de un servicio: "Cerrado" cuando un día no tiene franjas y el texto del botón ("Abrir" / "Franja").
  function actualizarFranjas() {
    for (const dia of document.querySelectorAll("[data-dia-horario]")) {
      const hay = dia.querySelector("[data-fila]") !== null;
      dia.querySelector("[data-cerrado]")?.classList.toggle("hidden", hay);
      const etiqueta = dia.querySelector("[data-agregar] [data-texto]");
      if (etiqueta) etiqueta.textContent = hay ? "Franja" : "Abrir";
    }
  }

  // "Copiar lunes a días hábiles": reemplaza las franjas de martes a viernes por las del lunes.
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-copiar-lunes]")) return;
    const lunes = document.getElementById("franjas-1");
    if (!lunes) return;
    for (const dia of [2, 3, 4, 5]) {
      const destino = document.getElementById(`franjas-${dia}`);
      const plantilla = document.querySelector(`template[data-plantilla="franja-${dia}"]`);
      if (!destino || !plantilla) continue;
      destino.replaceChildren(
        ...[...lunes.querySelectorAll("[data-fila]")].map((fila) => {
          // Se parte de la plantilla del día (etiquetas y día correctos) y se copian los horarios del lunes.
          const copia = plantilla.content.firstElementChild.cloneNode(true);
          for (const campo of ["desde", "hasta"]) {
            copia.querySelector(`[data-campo="${campo}"]`).value = fila.querySelector(`[data-campo="${campo}"]`).value;
          }
          return copia;
        }),
      );
    }
    actualizarFranjas();
  });

  // Cristal: el lado (izq./der.) solo se elige si la ubicación lo tiene.
  function actualizarLado() {
    const ubicacion = document.querySelector("select[data-ubicacion]");
    const lado = document.querySelector("select[data-lado]");
    if (!ubicacion || !lado) return;
    const tiene = ubicacion.selectedOptions[0]?.dataset.tieneLado === "1";
    lado.disabled = !tiene;
  }

  // Controles que se muestran según otro: `data-mostrar-si="tipo=LISTA"`, `"tipo!=SI_NO"` o varias condiciones
  // unidas con `&` (todas deben cumplirse).
  function actualizarCondicionales() {
    for (const el of document.querySelectorAll("[data-mostrar-si]")) {
      const form = el.closest("form");
      const cumple = el.dataset.mostrarSi.split("&").every((condicion) => {
        const [, nombre, distinto, valor] = /^(\w+)(!?)=(.*)$/.exec(condicion) ?? [];
        const control = form?.elements.namedItem(nombre);
        if (!control) return true;
        return distinto ? control.value !== valor : control.value === valor;
      });
      el.hidden = !cumple;
    }
  }

  // Texto de ayuda según la opción elegida: `<select data-ayuda="id">` con `<option data-ayuda="…">`.
  function actualizarAyudas() {
    for (const select of document.querySelectorAll("select[data-ayuda]")) {
      const destino = document.getElementById(select.dataset.ayuda);
      if (destino) destino.textContent = select.selectedOptions[0]?.dataset.ayuda ?? "";
    }
  }

  // Renombrar en línea: el botón "Guardar nombre" aparece solo cuando el texto cambió.
  document.addEventListener("input", (e) => {
    if (!e.target.matches("input[data-original]")) return;
    const boton = e.target.form?.querySelector("[data-si-cambia]");
    if (boton) boton.hidden = e.target.value === e.target.defaultValue;
  });

  document.addEventListener("change", (e) => {
    // Controles que envían su formulario apenas cambian (por ejemplo, "Tiene lado" en las listas o el servicio al dar turno).
    if (e.target.matches("input[data-enviar-al-cambiar], select[data-enviar-al-cambiar]")) e.target.form?.requestSubmit();
    actualizarLado();
    actualizarCondicionales();
    actualizarAyudas();
  });

  // `<input type="file" data-cargar-en="id">` copia el contenido del archivo de texto elegido en el campo con ese id
  // (importar el CSV de Notion sin subir archivos: viaja como texto en el formulario).
  document.addEventListener("change", async (e) => {
    const input = e.target.closest?.("input[type=file][data-cargar-en]");
    const archivo = input?.files?.[0];
    const destino = input && document.getElementById(input.dataset.cargarEn);
    if (archivo && destino) destino.value = await archivo.text();
  });

  // Filtros del stock en celular: se pliegan detrás de un botón; desde `md` se ven siempre.
  document.addEventListener("click", (e) => {
    const boton = e.target.closest("[data-plegar]");
    if (!boton) return;
    const panel = document.getElementById(boton.getAttribute("aria-controls"));
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto));
    panel?.classList.toggle("hidden", abierto);
    panel?.classList.toggle("grid", !abierto);
    boton.querySelector("[data-flecha]")?.classList.toggle("rotate-180", !abierto);
  });

  // "Mostrar contraseña": `<input type="checkbox" data-mostrar-clave="id">` alterna el tipo del campo con ese id.
  document.addEventListener("change", (e) => {
    const casilla = e.target.closest?.("input[data-mostrar-clave]");
    const campo = casilla && document.getElementById(casilla.dataset.mostrarClave);
    if (campo) campo.type = casilla.checked ? "text" : "password";
  });

  // Controles que solo tienen sentido con JavaScript: arrancan con `hidden` y acá se muestran.
  for (const el of document.querySelectorAll("[data-requiere-js]")) el.hidden = false;

  actualizarLado();
  actualizarCondicionales();
  actualizarAyudas();
  actualizarFranjas();
})();
