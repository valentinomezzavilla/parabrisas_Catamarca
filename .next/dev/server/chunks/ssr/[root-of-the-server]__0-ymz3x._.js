module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/node:url [external] (node:url, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:url", () => require("node:url"));

module.exports = mod;
}),
"[project]/src/app/(publico)/reservar/confirmado/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "default",
    ()=>PaginaConfirmado,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.mjs [app-rsc] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.mjs [app-rsc] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.mjs [app-rsc] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/index.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$formato$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/formato.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tiempo.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$pagos$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/pagos/pagos.service.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$vista$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/pagos/vista.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$turno$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/turnos/turno.service.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$pagos$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$turno$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$pagos$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$turno$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
;
;
const metadata = {
    title: "Tu turno"
};
async function PaginaConfirmado({ searchParams }) {
    const { turno: id } = await searchParams;
    if (!id) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    // Nada de lo que diga la URL sobre el pago se toma como cierto: se consulta a Mercado Pago.
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$pagos$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sincronizarPago"])(id);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$pagos$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["liberarVencidos"])();
    const turno = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$turno$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["obtenerTurno"])(id);
    if (!turno) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const pago = turno.pagos[0];
    const vista = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$vista$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["vistaConfirmacion"])({
        turnoEstado: turno.estado,
        venceEn: turno.venceEn,
        pago: pago ? {
            requiereDevolucion: pago.requiereDevolucion,
            devuelto: !!pago.devueltoEn
        } : null,
        ahora: new Date()
    });
    const Icono = vista.tipo === "esperando" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"] : vista.tipo === "sin_turno" || vista.tipo === "no_completado" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"];
    const claseIcono = vista.tipo === "esperando" ? "text-alerta" : vista.tipo === "sin_turno" || vista.tipo === "no_completado" ? "text-peligro" : "text-exito";
    const nombre = turno.cliente.nombre.split(" ")[0];
    const titulo = {
        esperando: "Estamos esperando tu pago",
        sin_turno: "Recibimos tu pago, pero…",
        no_completado: "No se completó el pago",
        confirmado: `¡Listo, ${nombre}!`,
        reservado: `¡Listo, ${nombre}!`
    }[vista.tipo];
    const hayTurno = vista.tipo === "esperando" || vista.tipo === "confirmado" || vista.tipo === "reservado";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tarjeta"]} space-y-5 p-6 text-center`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Icono, {
                className: `mx-auto size-14 ${claseIcono}`,
                "aria-hidden": true
            }, void 0, false, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "font-display text-2xl font-extrabold",
                        children: titulo
                    }, void 0, false, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    vista.tipo === "esperando" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-texto-suave",
                        children: "Cuando Mercado Pago nos avise, tu turno queda confirmado."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 48,
                        columnNumber: 40
                    }, this),
                    vista.tipo === "confirmado" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-texto-suave",
                        children: [
                            "Tu turno quedó confirmado",
                            pago ? ` con la seña de ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$formato$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["pesos"])(pago.monto)}` : "",
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 50,
                        columnNumber: 11
                    }, this),
                    vista.tipo === "reservado" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-texto-suave",
                        children: "Tu turno quedó reservado."
                    }, void 0, false, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 52,
                        columnNumber: 40
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            vista.tipo === "sin_turno" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Aviso"], {
                tono: "alerta",
                children: vista.devuelto ? "No pudimos confirmar tu turno, pero ya te devolvimos la seña." : "No pudimos confirmar tu turno (el horario ya no estaba disponible o el monto no coincidía). Comunicate con el local para que te devuelvan la seña."
            }, void 0, false, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, this),
            vista.tipo === "no_completado" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Aviso"], {
                tono: "alerta",
                children: "El pago no se completó y el horario se liberó. Podés sacar un turno nuevo."
            }, void 0, false, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 63,
                columnNumber: 9
            }, this),
            vista.tipo === "confirmado" && vista.pagoDeMas && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Aviso"], {
                tono: "alerta",
                children: "Detectamos un pago de más. Comunicate con el local para que te lo devuelvan."
            }, void 0, false, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 66,
                columnNumber: 9
            }, this),
            hayTurno && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                className: "mx-auto grid max-w-sm grid-cols-2 gap-4 rounded-lg bg-marca/15 p-4 text-left text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                className: "text-xs text-texto-suave",
                                children: "Servicio"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 72,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                className: "font-semibold",
                                children: turno.servicio.nombre
                            }, void 0, false, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 73,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                className: "text-xs text-texto-suave",
                                children: "Día"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 76,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                className: "font-semibold",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatearFecha"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fechaLocal"])(turno.inicio))
                            }, void 0, false, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 77,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 75,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                className: "text-xs text-texto-suave",
                                children: "Hora"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 80,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                className: "font-semibold",
                                children: [
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatearHora"])(turno.inicio),
                                    " hs"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "col-span-2 border-t border-borde pt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                className: "text-xs text-texto-suave",
                                children: "Código de reserva"
                            }, void 0, false, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                className: "font-mono text-lg font-bold tracking-widest",
                                children: turno.codigo
                            }, void 0, false, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs text-texto-suave",
                                children: "Guardalo: lo necesitás para buscar o cancelar tu reserva."
                            }, void 0, false, {
                                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                                lineNumber: 86,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this),
            vista.tipo === "esperando" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap justify-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/reservar/confirmado?turno=${turno.id}`,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["boton"].primario,
                        children: "Ya pagué, actualizar"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 93,
                        columnNumber: 11
                    }, this),
                    pago?.mpInitPoint && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: pago.mpInitPoint,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["boton"].secundario,
                        children: "Volver a pagar"
                    }, void 0, false, {
                        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                        lineNumber: 94,
                        columnNumber: 33
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 92,
                columnNumber: 9
            }, this),
            (vista.tipo === "confirmado" || vista.tipo === "reservado") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-texto-suave",
                children: "Si necesitás cambiarlo o cancelarlo, comunicate con el local. La seña no se devuelve."
            }, void 0, false, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 99,
                columnNumber: 9
            }, this),
            vista.tipo !== "esperando" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                href: "/reservar",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$index$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["boton"].secundario,
                children: "Sacar otro turno"
            }, void 0, false, {
                fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
                lineNumber: 101,
                columnNumber: 38
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(publico)/reservar/confirmado/page.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/(publico)/reservar/confirmado/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(publico)/reservar/confirmado/page.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/app/apple-icon.png (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/apple-icon.383gzvani7wo7.png" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/src/app/apple-icon.png.mjs { IMAGE => \"[project]/src/app/apple-icon.png (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$apple$2d$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/app/apple-icon.png (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$apple$2d$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 180,
    height: 180
};
}),
"[project]/src/app/icon.png (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/icon.0_m5mo5yjnts2.png" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/src/app/icon.png.mjs { IMAGE => \"[project]/src/app/icon.png (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/src/app/icon.png (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$icon$2e$png__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 512,
    height: 512
};
}),
"[project]/src/components/ui/index.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Aviso",
    ()=>Aviso,
    "Campo",
    ()=>Campo,
    "ChipIcono",
    ()=>ChipIcono,
    "EncabezadoPagina",
    ()=>EncabezadoPagina,
    "Estadistica",
    ()=>Estadistica,
    "Insignia",
    ()=>Insignia,
    "Vacio",
    ()=>Vacio,
    "boton",
    ()=>boton,
    "input",
    ()=>input,
    "tarjeta",
    ()=>tarjeta
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
// Clases compartidas: se exportan como strings para poder aplicarlas también a <Link>.
// Áreas táctiles: 44 px de alto en celular y 40 px desde `sm`; `boton.chico` es el tamaño compacto.
const baseBoton = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10";
const boton = {
    primario: `${baseBoton} bg-marca text-sobre-marca shadow-marca hover:bg-amarillo-300 hover:shadow-[0_1px_0_rgb(0_0_0/0.14),0_8px_20px_-6px_rgb(253_221_61/0.7)]`,
    secundario: `${baseBoton} border border-borde bg-superficie shadow-tarjeta hover:border-grafito-400`,
    peligro: `${baseBoton} bg-peligro text-white hover:bg-peligro/90`,
    fantasma: `${baseBoton} text-texto-suave hover:bg-grafito-500/10 hover:text-texto`,
    chico: "px-2.5 py-1 text-xs min-h-9! sm:min-h-0!"
};
const input = "w-full min-h-11 rounded-lg border border-borde bg-superficie px-3 py-2 text-base placeholder:text-grafito-400 focus:border-amarillo-500 focus:outline-none focus:ring-2 focus:ring-amarillo-500/30 aria-invalid:border-peligro sm:min-h-10 sm:text-sm";
const tarjeta = "rounded-tarjeta border border-borde bg-superficie shadow-tarjeta dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]";
function ChipIcono({ Icono, tono = "marca", className = "" }) {
    const tonos = {
        marca: "bg-marca/20 text-acento",
        alerta: "bg-alerta/15 text-alerta",
        peligro: "bg-peligro/15 text-peligro",
        exito: "bg-exito/15 text-exito",
        neutro: "bg-grafito-500/15 text-texto-suave"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `flex size-9 shrink-0 items-center justify-center rounded-lg ${tonos[tono]} ${className}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Icono, {
            className: "size-[1.15rem]"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/index.tsx",
            lineNumber: 42,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/index.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
function EncabezadoPagina({ seccion, titulo, descripcion, acciones }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: "flex flex-wrap items-end justify-between gap-x-4 gap-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-w-0 gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        "aria-hidden": true,
                        className: "mt-1 hidden h-11 w-1 shrink-0 rounded-full bg-marca sm:block"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/index.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold tracking-widest text-acento uppercase sm:text-sm",
                                children: seccion
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/index.tsx",
                                lineNumber: 63,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-display text-2xl leading-tight font-extrabold sm:text-3xl",
                                children: titulo
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/index.tsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            descripcion && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm text-texto-suave",
                                children: descripcion
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/index.tsx",
                                lineNumber: 65,
                                columnNumber: 27
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/index.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            acciones && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-2",
                children: acciones
            }, void 0, false, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 68,
                columnNumber: 20
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/index.tsx",
        lineNumber: 59,
        columnNumber: 5
    }, this);
}
function Estadistica({ etiqueta, valor, Icono, tono = "marca" }) {
    const franja = {
        marca: "bg-marca",
        alerta: "bg-alerta",
        peligro: "bg-peligro",
        exito: "bg-exito"
    };
    const numero = {
        marca: "",
        alerta: "text-alerta",
        peligro: "text-peligro",
        exito: "text-exito"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `${tarjeta} relative overflow-hidden p-3 sm:p-5`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                "aria-hidden": true,
                className: `absolute inset-x-0 top-0 h-1 ${franja[tono]}`
            }, void 0, false, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs leading-snug text-texto-suave sm:text-sm",
                        children: etiqueta
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/index.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ChipIcono, {
                        Icono: Icono,
                        tono: tono,
                        className: "hidden sm:flex"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/index.tsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `mt-1 font-display text-3xl font-extrabold tabular-nums sm:mt-3 sm:text-4xl ${numero[tono]}`,
                children: valor
            }, void 0, false, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 94,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/index.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
function Campo({ etiqueta, htmlFor, error, ayuda, className = "", children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `space-y-1.5 ${className}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: htmlFor,
                className: "block text-sm font-medium",
                children: etiqueta
            }, void 0, false, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            children,
            error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-peligro",
                children: error
            }, void 0, false, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 121,
                columnNumber: 9
            }, this) : ayuda && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-texto-suave",
                children: ayuda
            }, void 0, false, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 123,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/index.tsx",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
const tonos = {
    neutro: "bg-grafito-500/15 text-texto-suave",
    marca: "bg-marca text-sobre-marca",
    exito: "bg-exito/15 text-exito",
    alerta: "bg-alerta/15 text-alerta",
    peligro: "bg-peligro/15 text-peligro"
};
function Insignia({ tono = "neutro", children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${tonos[tono]}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/index.tsx",
        lineNumber: 139,
        columnNumber: 5
    }, this);
}
function Aviso({ tono = "exito", children }) {
    const estilos = {
        exito: "border-exito/40 bg-exito/10",
        alerta: "border-alerta/40 bg-alerta/10",
        peligro: "border-peligro/40 bg-peligro/10"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        role: "status",
        className: `rounded-lg border px-4 py-3 text-sm ${estilos[tono]}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/ui/index.tsx",
        lineNumber: 152,
        columnNumber: 5
    }, this);
}
function Vacio({ children, Icono }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center gap-3 rounded-tarjeta border border-dashed border-borde p-8 text-center text-sm text-texto-suave",
        children: [
            Icono && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ChipIcono, {
                Icono: Icono,
                tono: "neutro"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 161,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/ui/index.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/index.tsx",
        lineNumber: 160,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/generated/prisma/client.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/* !!! This is code generated by Prisma. Do not edit directly. !!! */ /* eslint-disable */ // biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * This file should be your main import to use Prisma. Through it you get access to all the models, enums, and input types.
 * If you're looking for something you can import in the client-side of your application, please refer to the `browser.ts` file instead.
 *
 * 🟢 You can import this file directly.
 */ __turbopack_context__.s([
    "PrismaClient",
    ()=>PrismaClient
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$class$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/generated/prisma/internal/class.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/generated/prisma/internal/prismaNamespace.ts [app-rsc] (ecmascript)");
var __TURBOPACK__import$2e$meta__ = {
    get url () {
        return __turbopack_context__.F("src/generated/prisma/client.ts");
    },
    env: {
        DEV: true,
        PROD: false,
        MODE: "development",
        BASE_URL: "/",
        SSR: true
    },
    get turbopackHot () {
        return __turbopack_context__.m.hot;
    }
};
;
;
globalThis['__dirname'] = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["dirname"]((0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__["fileURLToPath"])(__TURBOPACK__import$2e$meta__.url));
;
;
;
;
const PrismaClient = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$class$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPrismaClientClass"]();
;
}),
"[project]/src/generated/prisma/internal/class.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPrismaClientClass",
    ()=>getPrismaClientClass
]);
/* !!! This is code generated by Prisma. Do not edit directly. !!! */ /* eslint-disable */ // biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * WARNING: This is an internal file that is subject to change!
 *
 * 🛑 Under no circumstances should you import this file directly! 🛑
 *
 * Please import the `PrismaClient` class from the `client.ts` file instead.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client/runtime/client [external] (@prisma/client/runtime/client, cjs, [project]/node_modules/@prisma/client)");
;
const config = {
    "previewFeatures": [],
    "clientVersion": "7.10.0",
    "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
    "activeProvider": "postgresql",
    "inlineSchema": "// Parabrisas Catamarca — esquema de base de datos (PostgreSQL)\n// Convención: modelos en PascalCase (español), tablas y columnas en snake_case.\n\ngenerator client {\n  provider = \"prisma-client\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n}\n\n// =====================================================================\n//  MÓDULO INVENTARIO (STOCK DE CRISTALES)\n// =====================================================================\n\n/// Fabricante del cristal (Pilkington, Fuyao, Vitro, AGC...).\nmodel MarcaCristal {\n  id        String    @id @default(cuid())\n  nombre    String    @unique\n  activo    Boolean   @default(true)\n  cristales Cristal[]\n\n  @@map(\"marcas_cristal\")\n}\n\n/// Laminado, templado, laminado acústico... Es un catálogo editable, no un enum,\n/// para poder sumar tipos nuevos sin migrar la base.\nmodel TipoCristal {\n  id          String    @id @default(cuid())\n  nombre      String    @unique\n  descripcion String?\n  activo      Boolean   @default(true)\n  cristales   Cristal[]\n\n  @@map(\"tipos_cristal\")\n}\n\n/// Posición del cristal en el vehículo (parabrisas, luneta, puerta delantera...).\n/// El lado (izquierdo/derecho) se guarda en el cristal, así no se duplica cada ubicación.\nmodel UbicacionVehiculo {\n  id        String    @id @default(cuid())\n  nombre    String    @unique\n  tieneLado Boolean   @default(false) @map(\"tiene_lado\")\n  orden     Int       @default(0)\n  activo    Boolean   @default(true)\n  cristales Cristal[]\n\n  @@map(\"ubicaciones_vehiculo\")\n}\n\nenum Lado {\n  NO_APLICA\n  IZQUIERDO\n  DERECHO\n}\n\n/// Artículo de stock. `cantidad` es un valor desnormalizado: solo se modifica\n/// junto con un MovimientoStock, dentro de la misma transacción.\nmodel Cristal {\n  id               String  @id @default(cuid())\n  codigo           String  @unique // SKU interno\n  codigoFabricante String? @map(\"codigo_fabricante\") // Eurocode / código de catálogo\n  descripcion      String\n\n  marcaId     String            @map(\"marca_id\")\n  marca       MarcaCristal      @relation(fields: [marcaId], references: [id])\n  tipoId      String            @map(\"tipo_id\")\n  tipo        TipoCristal       @relation(fields: [tipoId], references: [id])\n  ubicacionId String            @map(\"ubicacion_id\")\n  ubicacion   UbicacionVehiculo @relation(fields: [ubicacionId], references: [id])\n  lado        Lado              @default(NO_APLICA)\n\n  // Tamaño en milímetros\n  anchoMm   Int?     @map(\"ancho_mm\")\n  altoMm    Int?     @map(\"alto_mm\")\n  espesorMm Decimal? @map(\"espesor_mm\") @db.Decimal(4, 1)\n\n  cantidad          Int      @default(0)\n  stockMinimo       Int      @default(0) @map(\"stock_minimo\")\n  ubicacionDeposito String?  @map(\"ubicacion_deposito\") // estantería / rack\n  costo             Decimal? @db.Decimal(12, 2)\n  precioVenta       Decimal? @map(\"precio_venta\") @db.Decimal(12, 2)\n\n  activo        Boolean  @default(true)\n  extras        Json     @default(\"{}\") // valores de campos propios: { [clave]: valor }\n  creadoEn      DateTime @default(now()) @map(\"creado_en\")\n  actualizadoEn DateTime @updatedAt @map(\"actualizado_en\")\n\n  compatibilidades CompatibilidadVehiculo[]\n  movimientos      MovimientoStock[]\n  turnos           Turno[]\n\n  @@index([ubicacionId])\n  @@index([marcaId])\n  @@index([tipoId])\n  @@map(\"cristales\")\n}\n\nmodel MarcaVehiculo {\n  id      String           @id @default(cuid())\n  nombre  String           @unique\n  activo  Boolean          @default(true)\n  modelos ModeloVehiculo[]\n\n  @@map(\"marcas_vehiculo\")\n}\n\nmodel ModeloVehiculo {\n  id               String                   @id @default(cuid())\n  marcaId          String                   @map(\"marca_id\")\n  marca            MarcaVehiculo            @relation(fields: [marcaId], references: [id])\n  nombre           String\n  activo           Boolean                  @default(true)\n  compatibilidades CompatibilidadVehiculo[]\n\n  @@unique([marcaId, nombre])\n  @@map(\"modelos_vehiculo\")\n}\n\n/// Un cristal sirve para N modelos, en un rango de años y opcionalmente\n/// una carrocería o versión (ej. \"5 puertas\", \"cabina doble\").\nmodel CompatibilidadVehiculo {\n  id         String         @id @default(cuid())\n  cristalId  String         @map(\"cristal_id\")\n  cristal    Cristal        @relation(fields: [cristalId], references: [id], onDelete: Cascade)\n  modeloId   String         @map(\"modelo_id\")\n  modelo     ModeloVehiculo @relation(fields: [modeloId], references: [id])\n  anioDesde  Int?           @map(\"anio_desde\")\n  anioHasta  Int?           @map(\"anio_hasta\") // null = vigente\n  carroceria String?\n  notas      String?\n\n  @@index([modeloId])\n  @@index([cristalId])\n  @@map(\"compatibilidades_vehiculo\")\n}\n\nenum TipoMovimiento {\n  INGRESO // compra a proveedor, devolución\n  EGRESO // venta, colocación\n  AJUSTE // conteo físico, rotura en depósito (cantidad con signo)\n}\n\n/// Historial auditable de todo cambio de stock.\nmodel MovimientoStock {\n  id        String         @id @default(cuid())\n  cristalId String         @map(\"cristal_id\")\n  cristal   Cristal        @relation(fields: [cristalId], references: [id])\n  tipo      TipoMovimiento\n  cantidad  Int // variación con signo aplicada a Cristal.cantidad\n  saldo     Int // stock resultante luego del movimiento\n  motivo    String?\n  turnoId   String?        @map(\"turno_id\")\n  turno     Turno?         @relation(fields: [turnoId], references: [id])\n  creadoEn  DateTime       @default(now()) @map(\"creado_en\")\n\n  @@index([cristalId, creadoEn])\n  @@map(\"movimientos_stock\")\n}\n\n// =====================================================================\n//  MÓDULO TURNOS (TURNERO)\n// =====================================================================\n\n/// Servicio ofrecido por el local. Se administra desde el panel: alta,\n/// modificación y baja (archivado si ya tiene turnos, para conservar historial).\nmodel Servicio {\n  id                  String    @id @default(cuid())\n  nombre              String    @unique\n  slug                String    @unique\n  descripcion         String?\n  duracionMinutos     Int       @map(\"duracion_minutos\") // duración estimada del trabajo\n  intervaloMinutos    Int       @default(30) @map(\"intervalo_minutos\") // cada cuánto se ofrece un inicio de turno\n  margenMinutos       Int       @default(0) @map(\"margen_minutos\") // limpieza/preparación entre turnos\n  capacidad           Int       @default(1) // trabajos simultáneos (boxes/operarios)\n  anticipacionMinutos Int       @default(60) @map(\"anticipacion_minutos\") // mínimo de antelación para reservar\n  precioBase          Decimal?  @map(\"precio_base\") @db.Decimal(12, 2)\n  color               String    @default(\"#FDDD3D\") // color en la agenda\n  requiereCristal     Boolean   @default(false) @map(\"requiere_cristal\") // p. ej. colocación\n  activo              Boolean   @default(true)\n  orden               Int       @default(0)\n  archivadoEn         DateTime? @map(\"archivado_en\")\n  extras              Json      @default(\"{}\") // valores de campos propios: { [clave]: valor }\n  creadoEn            DateTime  @default(now()) @map(\"creado_en\")\n  actualizadoEn       DateTime  @updatedAt @map(\"actualizado_en\")\n\n  horarios HorarioServicio[]\n  bloqueos BloqueoAgenda[]\n  turnos   Turno[]\n\n  @@map(\"servicios\")\n}\n\n/// Franja de atención de un servicio para un día de la semana.\n/// Varias franjas por día permiten horario cortado (ej. 8:30–12:30 y 16:30–20:00).\nmodel HorarioServicio {\n  id         String   @id @default(cuid())\n  servicioId String   @map(\"servicio_id\")\n  servicio   Servicio @relation(fields: [servicioId], references: [id], onDelete: Cascade)\n  diaSemana  Int      @map(\"dia_semana\") // 0 = domingo … 6 = sábado\n  horaInicio Int      @map(\"hora_inicio\") // minutos desde 00:00 (510 = 08:30)\n  horaFin    Int      @map(\"hora_fin\")\n\n  @@index([servicioId, diaSemana])\n  @@map(\"horarios_servicio\")\n}\n\n/// Feriados, vacaciones o cierres puntuales. servicioId = null bloquea todo el local.\nmodel BloqueoAgenda {\n  id         String    @id @default(cuid())\n  servicioId String?   @map(\"servicio_id\")\n  servicio   Servicio? @relation(fields: [servicioId], references: [id], onDelete: Cascade)\n  inicio     DateTime\n  fin        DateTime\n  motivo     String?\n\n  @@index([inicio, fin])\n  @@map(\"bloqueos_agenda\")\n}\n\nmodel Cliente {\n  id       String   @id @default(cuid())\n  nombre   String\n  telefono String\n  email    String?\n  notas    String?\n  creadoEn DateTime @default(now()) @map(\"creado_en\")\n  turnos   Turno[]\n\n  @@index([telefono])\n  @@map(\"clientes\")\n}\n\nenum EstadoTurno {\n  ESPERANDO_PAGO\n  PENDIENTE\n  CONFIRMADO\n  EN_CURSO\n  COMPLETADO\n  CANCELADO\n  AUSENTE\n}\n\n/// Turno reservado. `fin` y `precio` se copian del servicio al reservar, así los\n/// cambios futuros en el servicio no alteran turnos ya dados.\nmodel Turno {\n  id            String            @id @default(cuid())\n  codigo        String            @unique // código corto para que el cliente busque o cancele su reserva\n  servicioId    String            @map(\"servicio_id\")\n  servicio      Servicio          @relation(fields: [servicioId], references: [id])\n  clienteId     String            @map(\"cliente_id\")\n  cliente       Cliente           @relation(fields: [clienteId], references: [id])\n  inicio        DateTime\n  fin           DateTime\n  estado        EstadoTurno       @default(PENDIENTE)\n  venceEn       DateTime?         @map(\"vence_en\") // solo en ESPERANDO_PAGO: hasta cuándo se retiene el horario\n  vehiculo      String? // texto libre: \"Toyota Hilux 2019\"\n  patente       String?\n  cristalId     String?           @map(\"cristal_id\") // cristal a colocar, si aplica\n  cristal       Cristal?          @relation(fields: [cristalId], references: [id])\n  precio        Decimal?          @db.Decimal(12, 2)\n  notas         String?\n  creadoEn      DateTime          @default(now()) @map(\"creado_en\")\n  actualizadoEn DateTime          @updatedAt @map(\"actualizado_en\")\n  movimientos   MovimientoStock[]\n  pagos         Pago[]\n\n  @@index([servicioId, inicio])\n  @@index([inicio])\n  @@map(\"turnos\")\n}\n\nenum EstadoPago {\n  PENDIENTE\n  APROBADO\n  RECHAZADO\n  VENCIDO\n}\n\n/// Seña de un turno cobrada con Mercado Pago. `mpPagoId` es único: un mismo pago nunca se aplica dos veces.\nmodel Pago {\n  id                  String     @id @default(cuid()) // también es el external_reference que viaja a Mercado Pago\n  turnoId             String     @map(\"turno_id\")\n  turno               Turno      @relation(fields: [turnoId], references: [id])\n  monto               Decimal    @db.Decimal(12, 2)\n  estado              EstadoPago @default(PENDIENTE)\n  mpPreferenciaId     String?    @map(\"mp_preferencia_id\")\n  mpInitPoint         String?    @map(\"mp_init_point\")\n  mpPagoId            String?    @unique @map(\"mp_pago_id\")\n  aceptoCondicionesEn DateTime   @map(\"acepto_condiciones_en\")\n  requiereDevolucion  Boolean    @default(false) @map(\"requiere_devolucion\")\n  motivoDevolucion    String?    @map(\"motivo_devolucion\")\n  devueltoEn          DateTime?  @map(\"devuelto_en\")\n  creadoEn            DateTime   @default(now()) @map(\"creado_en\")\n  actualizadoEn       DateTime   @updatedAt @map(\"actualizado_en\")\n\n  @@index([turnoId])\n  @@index([requiereDevolucion, devueltoEn])\n  @@map(\"pagos\")\n}\n\n// =====================================================================\n//  USUARIOS DEL PANEL\n// =====================================================================\n\nenum RolUsuario {\n  ADMIN\n  EMPLEADO\n}\n\n/// Persona con acceso al panel. `passwordHash` tiene el formato `scrypt$<sal>$<clave>`.\nmodel Usuario {\n  id           String     @id @default(cuid())\n  usuario      String     @unique // nombre de usuario para el login, siempre en minúsculas\n  nombre       String\n  passwordHash String     @map(\"password_hash\")\n  rol          RolUsuario @default(EMPLEADO)\n  activo       Boolean    @default(true)\n  ultimoAcceso DateTime?  @map(\"ultimo_acceso\")\n  creadoEn     DateTime   @default(now()) @map(\"creado_en\")\n\n  @@map(\"usuarios\")\n}\n\n/// Fallos de login por nombre de usuario (exista o no, para que el bloqueo no revele qué cuentas existen).\n/// Reglas en `src/modules/usuarios/limite.ts`.\nmodel IntentoLogin {\n  usuario        String    @id\n  fallos         Int       @default(0)\n  ultimoFallo    DateTime? @map(\"ultimo_fallo\")\n  bloqueadoHasta DateTime? @map(\"bloqueado_hasta\")\n\n  @@map(\"intentos_login\")\n}\n\n// =====================================================================\n//  ADMINISTRACIÓN DE CAMPOS\n// =====================================================================\n\nenum EntidadCampo {\n  CRISTAL\n  SERVICIO\n  TURNO\n  CLIENTE\n}\n\nenum TipoCampo {\n  TEXTO\n  TEXTO_LARGO\n  NUMERO\n  SI_NO\n  LISTA\n  FECHA\n}\n\n/// Campo propio definido desde Administración. Sus valores se guardan en la columna `extras`\n/// de la tabla de la entidad, indexados por `clave` (que nunca cambia).\nmodel CampoPersonalizado {\n  id          String       @id @default(cuid())\n  entidad     EntidadCampo\n  clave       String\n  etiqueta    String\n  ayuda       String?\n  tipo        TipoCampo\n  requerido   Boolean      @default(false)\n  unidad      String? // solo NUMERO\n  opciones    Json         @default(\"[]\") // solo LISTA: [{ id, etiqueta, activo }]\n  orden       Int          @default(0)\n  visible     Boolean      @default(true)\n  archivadoEn DateTime?    @map(\"archivado_en\")\n  creadoEn    DateTime     @default(now()) @map(\"creado_en\")\n\n  @@unique([entidad, clave])\n  @@map(\"campos_personalizados\")\n}\n\n/// Ajustes del Admin sobre un campo del sistema (etiqueta, ayuda, oculto, orden).\n/// Sin fila, el campo usa sus valores de fábrica (ver `src/modules/campos/registro.ts`).\nmodel ConfiguracionCampo {\n  entidad  EntidadCampo\n  clave    String\n  etiqueta String?\n  ayuda    String?\n  oculto   Boolean      @default(false)\n  orden    Int?\n\n  @@id([entidad, clave])\n  @@map(\"configuracion_campos\")\n}\n",
    "runtimeDataModel": {
        "models": {},
        "enums": {},
        "types": {}
    },
    "parameterizationSchema": {
        "strings": [],
        "graph": ""
    }
};
config.runtimeDataModel = JSON.parse("{\"models\":{\"MarcaCristal\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nombre\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"activo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"cristales\",\"kind\":\"object\",\"type\":\"Cristal\",\"relationName\":\"CristalToMarcaCristal\"}],\"dbName\":\"marcas_cristal\",\"schema\":null},\"TipoCristal\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nombre\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"activo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"cristales\",\"kind\":\"object\",\"type\":\"Cristal\",\"relationName\":\"CristalToTipoCristal\"}],\"dbName\":\"tipos_cristal\",\"schema\":null},\"UbicacionVehiculo\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nombre\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tieneLado\",\"kind\":\"scalar\",\"type\":\"Boolean\",\"dbName\":\"tiene_lado\"},{\"name\":\"orden\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"activo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"cristales\",\"kind\":\"object\",\"type\":\"Cristal\",\"relationName\":\"CristalToUbicacionVehiculo\"}],\"dbName\":\"ubicaciones_vehiculo\",\"schema\":null},\"Cristal\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"codigo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"codigoFabricante\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"codigo_fabricante\"},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"marcaId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"marca_id\"},{\"name\":\"marca\",\"kind\":\"object\",\"type\":\"MarcaCristal\",\"relationName\":\"CristalToMarcaCristal\"},{\"name\":\"tipoId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"tipo_id\"},{\"name\":\"tipo\",\"kind\":\"object\",\"type\":\"TipoCristal\",\"relationName\":\"CristalToTipoCristal\"},{\"name\":\"ubicacionId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"ubicacion_id\"},{\"name\":\"ubicacion\",\"kind\":\"object\",\"type\":\"UbicacionVehiculo\",\"relationName\":\"CristalToUbicacionVehiculo\"},{\"name\":\"lado\",\"kind\":\"enum\",\"type\":\"Lado\"},{\"name\":\"anchoMm\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"ancho_mm\"},{\"name\":\"altoMm\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"alto_mm\"},{\"name\":\"espesorMm\",\"kind\":\"scalar\",\"type\":\"Decimal\",\"dbName\":\"espesor_mm\"},{\"name\":\"cantidad\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"stockMinimo\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"stock_minimo\"},{\"name\":\"ubicacionDeposito\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"ubicacion_deposito\"},{\"name\":\"costo\",\"kind\":\"scalar\",\"type\":\"Decimal\"},{\"name\":\"precioVenta\",\"kind\":\"scalar\",\"type\":\"Decimal\",\"dbName\":\"precio_venta\"},{\"name\":\"activo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"extras\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"creadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"creado_en\"},{\"name\":\"actualizadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"actualizado_en\"},{\"name\":\"compatibilidades\",\"kind\":\"object\",\"type\":\"CompatibilidadVehiculo\",\"relationName\":\"CompatibilidadVehiculoToCristal\"},{\"name\":\"movimientos\",\"kind\":\"object\",\"type\":\"MovimientoStock\",\"relationName\":\"CristalToMovimientoStock\"},{\"name\":\"turnos\",\"kind\":\"object\",\"type\":\"Turno\",\"relationName\":\"CristalToTurno\"}],\"dbName\":\"cristales\",\"schema\":null},\"MarcaVehiculo\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nombre\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"activo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"modelos\",\"kind\":\"object\",\"type\":\"ModeloVehiculo\",\"relationName\":\"MarcaVehiculoToModeloVehiculo\"}],\"dbName\":\"marcas_vehiculo\",\"schema\":null},\"ModeloVehiculo\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"marcaId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"marca_id\"},{\"name\":\"marca\",\"kind\":\"object\",\"type\":\"MarcaVehiculo\",\"relationName\":\"MarcaVehiculoToModeloVehiculo\"},{\"name\":\"nombre\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"activo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"compatibilidades\",\"kind\":\"object\",\"type\":\"CompatibilidadVehiculo\",\"relationName\":\"CompatibilidadVehiculoToModeloVehiculo\"}],\"dbName\":\"modelos_vehiculo\",\"schema\":null},\"CompatibilidadVehiculo\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"cristalId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"cristal_id\"},{\"name\":\"cristal\",\"kind\":\"object\",\"type\":\"Cristal\",\"relationName\":\"CompatibilidadVehiculoToCristal\"},{\"name\":\"modeloId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"modelo_id\"},{\"name\":\"modelo\",\"kind\":\"object\",\"type\":\"ModeloVehiculo\",\"relationName\":\"CompatibilidadVehiculoToModeloVehiculo\"},{\"name\":\"anioDesde\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"anio_desde\"},{\"name\":\"anioHasta\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"anio_hasta\"},{\"name\":\"carroceria\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"notas\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":\"compatibilidades_vehiculo\",\"schema\":null},\"MovimientoStock\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"cristalId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"cristal_id\"},{\"name\":\"cristal\",\"kind\":\"object\",\"type\":\"Cristal\",\"relationName\":\"CristalToMovimientoStock\"},{\"name\":\"tipo\",\"kind\":\"enum\",\"type\":\"TipoMovimiento\"},{\"name\":\"cantidad\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"saldo\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"motivo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"turnoId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"turno_id\"},{\"name\":\"turno\",\"kind\":\"object\",\"type\":\"Turno\",\"relationName\":\"MovimientoStockToTurno\"},{\"name\":\"creadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"creado_en\"}],\"dbName\":\"movimientos_stock\",\"schema\":null},\"Servicio\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nombre\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"descripcion\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"duracionMinutos\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"duracion_minutos\"},{\"name\":\"intervaloMinutos\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"intervalo_minutos\"},{\"name\":\"margenMinutos\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"margen_minutos\"},{\"name\":\"capacidad\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"anticipacionMinutos\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"anticipacion_minutos\"},{\"name\":\"precioBase\",\"kind\":\"scalar\",\"type\":\"Decimal\",\"dbName\":\"precio_base\"},{\"name\":\"color\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"requiereCristal\",\"kind\":\"scalar\",\"type\":\"Boolean\",\"dbName\":\"requiere_cristal\"},{\"name\":\"activo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"orden\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"archivadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"archivado_en\"},{\"name\":\"extras\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"creadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"creado_en\"},{\"name\":\"actualizadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"actualizado_en\"},{\"name\":\"horarios\",\"kind\":\"object\",\"type\":\"HorarioServicio\",\"relationName\":\"HorarioServicioToServicio\"},{\"name\":\"bloqueos\",\"kind\":\"object\",\"type\":\"BloqueoAgenda\",\"relationName\":\"BloqueoAgendaToServicio\"},{\"name\":\"turnos\",\"kind\":\"object\",\"type\":\"Turno\",\"relationName\":\"ServicioToTurno\"}],\"dbName\":\"servicios\",\"schema\":null},\"HorarioServicio\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"servicioId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"servicio_id\"},{\"name\":\"servicio\",\"kind\":\"object\",\"type\":\"Servicio\",\"relationName\":\"HorarioServicioToServicio\"},{\"name\":\"diaSemana\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"dia_semana\"},{\"name\":\"horaInicio\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"hora_inicio\"},{\"name\":\"horaFin\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"hora_fin\"}],\"dbName\":\"horarios_servicio\",\"schema\":null},\"BloqueoAgenda\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"servicioId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"servicio_id\"},{\"name\":\"servicio\",\"kind\":\"object\",\"type\":\"Servicio\",\"relationName\":\"BloqueoAgendaToServicio\"},{\"name\":\"inicio\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"fin\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"motivo\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":\"bloqueos_agenda\",\"schema\":null},\"Cliente\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nombre\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"telefono\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"notas\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"creadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"creado_en\"},{\"name\":\"turnos\",\"kind\":\"object\",\"type\":\"Turno\",\"relationName\":\"ClienteToTurno\"}],\"dbName\":\"clientes\",\"schema\":null},\"Turno\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"codigo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"servicioId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"servicio_id\"},{\"name\":\"servicio\",\"kind\":\"object\",\"type\":\"Servicio\",\"relationName\":\"ServicioToTurno\"},{\"name\":\"clienteId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"cliente_id\"},{\"name\":\"cliente\",\"kind\":\"object\",\"type\":\"Cliente\",\"relationName\":\"ClienteToTurno\"},{\"name\":\"inicio\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"fin\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"estado\",\"kind\":\"enum\",\"type\":\"EstadoTurno\"},{\"name\":\"venceEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"vence_en\"},{\"name\":\"vehiculo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"patente\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"cristalId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"cristal_id\"},{\"name\":\"cristal\",\"kind\":\"object\",\"type\":\"Cristal\",\"relationName\":\"CristalToTurno\"},{\"name\":\"precio\",\"kind\":\"scalar\",\"type\":\"Decimal\"},{\"name\":\"notas\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"creadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"creado_en\"},{\"name\":\"actualizadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"actualizado_en\"},{\"name\":\"movimientos\",\"kind\":\"object\",\"type\":\"MovimientoStock\",\"relationName\":\"MovimientoStockToTurno\"},{\"name\":\"pagos\",\"kind\":\"object\",\"type\":\"Pago\",\"relationName\":\"PagoToTurno\"}],\"dbName\":\"turnos\",\"schema\":null},\"Pago\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"turnoId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"turno_id\"},{\"name\":\"turno\",\"kind\":\"object\",\"type\":\"Turno\",\"relationName\":\"PagoToTurno\"},{\"name\":\"monto\",\"kind\":\"scalar\",\"type\":\"Decimal\"},{\"name\":\"estado\",\"kind\":\"enum\",\"type\":\"EstadoPago\"},{\"name\":\"mpPreferenciaId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"mp_preferencia_id\"},{\"name\":\"mpInitPoint\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"mp_init_point\"},{\"name\":\"mpPagoId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"mp_pago_id\"},{\"name\":\"aceptoCondicionesEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"acepto_condiciones_en\"},{\"name\":\"requiereDevolucion\",\"kind\":\"scalar\",\"type\":\"Boolean\",\"dbName\":\"requiere_devolucion\"},{\"name\":\"motivoDevolucion\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"motivo_devolucion\"},{\"name\":\"devueltoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"devuelto_en\"},{\"name\":\"creadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"creado_en\"},{\"name\":\"actualizadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"actualizado_en\"}],\"dbName\":\"pagos\",\"schema\":null},\"Usuario\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"usuario\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"nombre\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"passwordHash\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"password_hash\"},{\"name\":\"rol\",\"kind\":\"enum\",\"type\":\"RolUsuario\"},{\"name\":\"activo\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"ultimoAcceso\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"ultimo_acceso\"},{\"name\":\"creadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"creado_en\"}],\"dbName\":\"usuarios\",\"schema\":null},\"IntentoLogin\":{\"fields\":[{\"name\":\"usuario\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fallos\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"ultimoFallo\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"ultimo_fallo\"},{\"name\":\"bloqueadoHasta\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"bloqueado_hasta\"}],\"dbName\":\"intentos_login\",\"schema\":null},\"CampoPersonalizado\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"entidad\",\"kind\":\"enum\",\"type\":\"EntidadCampo\"},{\"name\":\"clave\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"etiqueta\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ayuda\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tipo\",\"kind\":\"enum\",\"type\":\"TipoCampo\"},{\"name\":\"requerido\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"unidad\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"opciones\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"orden\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"visible\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"archivadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"archivado_en\"},{\"name\":\"creadoEn\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"creado_en\"}],\"dbName\":\"campos_personalizados\",\"schema\":null},\"ConfiguracionCampo\":{\"fields\":[{\"name\":\"entidad\",\"kind\":\"enum\",\"type\":\"EntidadCampo\"},{\"name\":\"clave\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"etiqueta\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"ayuda\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"oculto\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"orden\",\"kind\":\"scalar\",\"type\":\"Int\"}],\"dbName\":\"configuracion_campos\",\"schema\":null}},\"enums\":{},\"types\":{}}");
config.parameterizationSchema = {
    strings: JSON.parse("[\"where\",\"orderBy\",\"cursor\",\"marca\",\"cristales\",\"_count\",\"tipo\",\"ubicacion\",\"cristal\",\"modelos\",\"compatibilidades\",\"modelo\",\"servicio\",\"horarios\",\"bloqueos\",\"turnos\",\"cliente\",\"movimientos\",\"turno\",\"pagos\",\"MarcaCristal.findUnique\",\"MarcaCristal.findUniqueOrThrow\",\"MarcaCristal.findFirst\",\"MarcaCristal.findFirstOrThrow\",\"MarcaCristal.findMany\",\"data\",\"MarcaCristal.createOne\",\"MarcaCristal.createMany\",\"MarcaCristal.createManyAndReturn\",\"MarcaCristal.updateOne\",\"MarcaCristal.updateMany\",\"MarcaCristal.updateManyAndReturn\",\"create\",\"update\",\"MarcaCristal.upsertOne\",\"MarcaCristal.deleteOne\",\"MarcaCristal.deleteMany\",\"having\",\"_min\",\"_max\",\"MarcaCristal.groupBy\",\"MarcaCristal.aggregate\",\"TipoCristal.findUnique\",\"TipoCristal.findUniqueOrThrow\",\"TipoCristal.findFirst\",\"TipoCristal.findFirstOrThrow\",\"TipoCristal.findMany\",\"TipoCristal.createOne\",\"TipoCristal.createMany\",\"TipoCristal.createManyAndReturn\",\"TipoCristal.updateOne\",\"TipoCristal.updateMany\",\"TipoCristal.updateManyAndReturn\",\"TipoCristal.upsertOne\",\"TipoCristal.deleteOne\",\"TipoCristal.deleteMany\",\"TipoCristal.groupBy\",\"TipoCristal.aggregate\",\"UbicacionVehiculo.findUnique\",\"UbicacionVehiculo.findUniqueOrThrow\",\"UbicacionVehiculo.findFirst\",\"UbicacionVehiculo.findFirstOrThrow\",\"UbicacionVehiculo.findMany\",\"UbicacionVehiculo.createOne\",\"UbicacionVehiculo.createMany\",\"UbicacionVehiculo.createManyAndReturn\",\"UbicacionVehiculo.updateOne\",\"UbicacionVehiculo.updateMany\",\"UbicacionVehiculo.updateManyAndReturn\",\"UbicacionVehiculo.upsertOne\",\"UbicacionVehiculo.deleteOne\",\"UbicacionVehiculo.deleteMany\",\"_avg\",\"_sum\",\"UbicacionVehiculo.groupBy\",\"UbicacionVehiculo.aggregate\",\"Cristal.findUnique\",\"Cristal.findUniqueOrThrow\",\"Cristal.findFirst\",\"Cristal.findFirstOrThrow\",\"Cristal.findMany\",\"Cristal.createOne\",\"Cristal.createMany\",\"Cristal.createManyAndReturn\",\"Cristal.updateOne\",\"Cristal.updateMany\",\"Cristal.updateManyAndReturn\",\"Cristal.upsertOne\",\"Cristal.deleteOne\",\"Cristal.deleteMany\",\"Cristal.groupBy\",\"Cristal.aggregate\",\"MarcaVehiculo.findUnique\",\"MarcaVehiculo.findUniqueOrThrow\",\"MarcaVehiculo.findFirst\",\"MarcaVehiculo.findFirstOrThrow\",\"MarcaVehiculo.findMany\",\"MarcaVehiculo.createOne\",\"MarcaVehiculo.createMany\",\"MarcaVehiculo.createManyAndReturn\",\"MarcaVehiculo.updateOne\",\"MarcaVehiculo.updateMany\",\"MarcaVehiculo.updateManyAndReturn\",\"MarcaVehiculo.upsertOne\",\"MarcaVehiculo.deleteOne\",\"MarcaVehiculo.deleteMany\",\"MarcaVehiculo.groupBy\",\"MarcaVehiculo.aggregate\",\"ModeloVehiculo.findUnique\",\"ModeloVehiculo.findUniqueOrThrow\",\"ModeloVehiculo.findFirst\",\"ModeloVehiculo.findFirstOrThrow\",\"ModeloVehiculo.findMany\",\"ModeloVehiculo.createOne\",\"ModeloVehiculo.createMany\",\"ModeloVehiculo.createManyAndReturn\",\"ModeloVehiculo.updateOne\",\"ModeloVehiculo.updateMany\",\"ModeloVehiculo.updateManyAndReturn\",\"ModeloVehiculo.upsertOne\",\"ModeloVehiculo.deleteOne\",\"ModeloVehiculo.deleteMany\",\"ModeloVehiculo.groupBy\",\"ModeloVehiculo.aggregate\",\"CompatibilidadVehiculo.findUnique\",\"CompatibilidadVehiculo.findUniqueOrThrow\",\"CompatibilidadVehiculo.findFirst\",\"CompatibilidadVehiculo.findFirstOrThrow\",\"CompatibilidadVehiculo.findMany\",\"CompatibilidadVehiculo.createOne\",\"CompatibilidadVehiculo.createMany\",\"CompatibilidadVehiculo.createManyAndReturn\",\"CompatibilidadVehiculo.updateOne\",\"CompatibilidadVehiculo.updateMany\",\"CompatibilidadVehiculo.updateManyAndReturn\",\"CompatibilidadVehiculo.upsertOne\",\"CompatibilidadVehiculo.deleteOne\",\"CompatibilidadVehiculo.deleteMany\",\"CompatibilidadVehiculo.groupBy\",\"CompatibilidadVehiculo.aggregate\",\"MovimientoStock.findUnique\",\"MovimientoStock.findUniqueOrThrow\",\"MovimientoStock.findFirst\",\"MovimientoStock.findFirstOrThrow\",\"MovimientoStock.findMany\",\"MovimientoStock.createOne\",\"MovimientoStock.createMany\",\"MovimientoStock.createManyAndReturn\",\"MovimientoStock.updateOne\",\"MovimientoStock.updateMany\",\"MovimientoStock.updateManyAndReturn\",\"MovimientoStock.upsertOne\",\"MovimientoStock.deleteOne\",\"MovimientoStock.deleteMany\",\"MovimientoStock.groupBy\",\"MovimientoStock.aggregate\",\"Servicio.findUnique\",\"Servicio.findUniqueOrThrow\",\"Servicio.findFirst\",\"Servicio.findFirstOrThrow\",\"Servicio.findMany\",\"Servicio.createOne\",\"Servicio.createMany\",\"Servicio.createManyAndReturn\",\"Servicio.updateOne\",\"Servicio.updateMany\",\"Servicio.updateManyAndReturn\",\"Servicio.upsertOne\",\"Servicio.deleteOne\",\"Servicio.deleteMany\",\"Servicio.groupBy\",\"Servicio.aggregate\",\"HorarioServicio.findUnique\",\"HorarioServicio.findUniqueOrThrow\",\"HorarioServicio.findFirst\",\"HorarioServicio.findFirstOrThrow\",\"HorarioServicio.findMany\",\"HorarioServicio.createOne\",\"HorarioServicio.createMany\",\"HorarioServicio.createManyAndReturn\",\"HorarioServicio.updateOne\",\"HorarioServicio.updateMany\",\"HorarioServicio.updateManyAndReturn\",\"HorarioServicio.upsertOne\",\"HorarioServicio.deleteOne\",\"HorarioServicio.deleteMany\",\"HorarioServicio.groupBy\",\"HorarioServicio.aggregate\",\"BloqueoAgenda.findUnique\",\"BloqueoAgenda.findUniqueOrThrow\",\"BloqueoAgenda.findFirst\",\"BloqueoAgenda.findFirstOrThrow\",\"BloqueoAgenda.findMany\",\"BloqueoAgenda.createOne\",\"BloqueoAgenda.createMany\",\"BloqueoAgenda.createManyAndReturn\",\"BloqueoAgenda.updateOne\",\"BloqueoAgenda.updateMany\",\"BloqueoAgenda.updateManyAndReturn\",\"BloqueoAgenda.upsertOne\",\"BloqueoAgenda.deleteOne\",\"BloqueoAgenda.deleteMany\",\"BloqueoAgenda.groupBy\",\"BloqueoAgenda.aggregate\",\"Cliente.findUnique\",\"Cliente.findUniqueOrThrow\",\"Cliente.findFirst\",\"Cliente.findFirstOrThrow\",\"Cliente.findMany\",\"Cliente.createOne\",\"Cliente.createMany\",\"Cliente.createManyAndReturn\",\"Cliente.updateOne\",\"Cliente.updateMany\",\"Cliente.updateManyAndReturn\",\"Cliente.upsertOne\",\"Cliente.deleteOne\",\"Cliente.deleteMany\",\"Cliente.groupBy\",\"Cliente.aggregate\",\"Turno.findUnique\",\"Turno.findUniqueOrThrow\",\"Turno.findFirst\",\"Turno.findFirstOrThrow\",\"Turno.findMany\",\"Turno.createOne\",\"Turno.createMany\",\"Turno.createManyAndReturn\",\"Turno.updateOne\",\"Turno.updateMany\",\"Turno.updateManyAndReturn\",\"Turno.upsertOne\",\"Turno.deleteOne\",\"Turno.deleteMany\",\"Turno.groupBy\",\"Turno.aggregate\",\"Pago.findUnique\",\"Pago.findUniqueOrThrow\",\"Pago.findFirst\",\"Pago.findFirstOrThrow\",\"Pago.findMany\",\"Pago.createOne\",\"Pago.createMany\",\"Pago.createManyAndReturn\",\"Pago.updateOne\",\"Pago.updateMany\",\"Pago.updateManyAndReturn\",\"Pago.upsertOne\",\"Pago.deleteOne\",\"Pago.deleteMany\",\"Pago.groupBy\",\"Pago.aggregate\",\"Usuario.findUnique\",\"Usuario.findUniqueOrThrow\",\"Usuario.findFirst\",\"Usuario.findFirstOrThrow\",\"Usuario.findMany\",\"Usuario.createOne\",\"Usuario.createMany\",\"Usuario.createManyAndReturn\",\"Usuario.updateOne\",\"Usuario.updateMany\",\"Usuario.updateManyAndReturn\",\"Usuario.upsertOne\",\"Usuario.deleteOne\",\"Usuario.deleteMany\",\"Usuario.groupBy\",\"Usuario.aggregate\",\"IntentoLogin.findUnique\",\"IntentoLogin.findUniqueOrThrow\",\"IntentoLogin.findFirst\",\"IntentoLogin.findFirstOrThrow\",\"IntentoLogin.findMany\",\"IntentoLogin.createOne\",\"IntentoLogin.createMany\",\"IntentoLogin.createManyAndReturn\",\"IntentoLogin.updateOne\",\"IntentoLogin.updateMany\",\"IntentoLogin.updateManyAndReturn\",\"IntentoLogin.upsertOne\",\"IntentoLogin.deleteOne\",\"IntentoLogin.deleteMany\",\"IntentoLogin.groupBy\",\"IntentoLogin.aggregate\",\"CampoPersonalizado.findUnique\",\"CampoPersonalizado.findUniqueOrThrow\",\"CampoPersonalizado.findFirst\",\"CampoPersonalizado.findFirstOrThrow\",\"CampoPersonalizado.findMany\",\"CampoPersonalizado.createOne\",\"CampoPersonalizado.createMany\",\"CampoPersonalizado.createManyAndReturn\",\"CampoPersonalizado.updateOne\",\"CampoPersonalizado.updateMany\",\"CampoPersonalizado.updateManyAndReturn\",\"CampoPersonalizado.upsertOne\",\"CampoPersonalizado.deleteOne\",\"CampoPersonalizado.deleteMany\",\"CampoPersonalizado.groupBy\",\"CampoPersonalizado.aggregate\",\"ConfiguracionCampo.findUnique\",\"ConfiguracionCampo.findUniqueOrThrow\",\"ConfiguracionCampo.findFirst\",\"ConfiguracionCampo.findFirstOrThrow\",\"ConfiguracionCampo.findMany\",\"ConfiguracionCampo.createOne\",\"ConfiguracionCampo.createMany\",\"ConfiguracionCampo.createManyAndReturn\",\"ConfiguracionCampo.updateOne\",\"ConfiguracionCampo.updateMany\",\"ConfiguracionCampo.updateManyAndReturn\",\"ConfiguracionCampo.upsertOne\",\"ConfiguracionCampo.deleteOne\",\"ConfiguracionCampo.deleteMany\",\"ConfiguracionCampo.groupBy\",\"ConfiguracionCampo.aggregate\",\"AND\",\"OR\",\"NOT\",\"EntidadCampo\",\"entidad\",\"clave\",\"etiqueta\",\"ayuda\",\"oculto\",\"orden\",\"equals\",\"in\",\"notIn\",\"lt\",\"lte\",\"gt\",\"gte\",\"not\",\"contains\",\"startsWith\",\"endsWith\",\"entidad_clave\",\"id\",\"TipoCampo\",\"requerido\",\"unidad\",\"opciones\",\"visible\",\"archivadoEn\",\"creadoEn\",\"string_contains\",\"string_starts_with\",\"string_ends_with\",\"array_starts_with\",\"array_ends_with\",\"array_contains\",\"usuario\",\"fallos\",\"ultimoFallo\",\"bloqueadoHasta\",\"nombre\",\"passwordHash\",\"RolUsuario\",\"rol\",\"activo\",\"ultimoAcceso\",\"turnoId\",\"monto\",\"EstadoPago\",\"estado\",\"mpPreferenciaId\",\"mpInitPoint\",\"mpPagoId\",\"aceptoCondicionesEn\",\"requiereDevolucion\",\"motivoDevolucion\",\"devueltoEn\",\"actualizadoEn\",\"codigo\",\"servicioId\",\"clienteId\",\"inicio\",\"fin\",\"EstadoTurno\",\"venceEn\",\"vehiculo\",\"patente\",\"cristalId\",\"precio\",\"notas\",\"telefono\",\"email\",\"every\",\"some\",\"none\",\"motivo\",\"diaSemana\",\"horaInicio\",\"horaFin\",\"slug\",\"descripcion\",\"duracionMinutos\",\"intervaloMinutos\",\"margenMinutos\",\"capacidad\",\"anticipacionMinutos\",\"precioBase\",\"color\",\"requiereCristal\",\"extras\",\"TipoMovimiento\",\"cantidad\",\"saldo\",\"modeloId\",\"anioDesde\",\"anioHasta\",\"carroceria\",\"marcaId\",\"codigoFabricante\",\"tipoId\",\"ubicacionId\",\"Lado\",\"lado\",\"anchoMm\",\"altoMm\",\"espesorMm\",\"stockMinimo\",\"ubicacionDeposito\",\"costo\",\"precioVenta\",\"tieneLado\",\"marcaId_nombre\",\"is\",\"isNot\",\"connectOrCreate\",\"upsert\",\"createMany\",\"set\",\"disconnect\",\"delete\",\"connect\",\"updateMany\",\"deleteMany\",\"increment\",\"decrement\",\"multiply\",\"divide\"]"),
    graph: "9wewAaACBwQAAMYEACC8AgAAygQAML0CAAA8ABC-AgAAygQAMNICAQAAAAHkAgEAAAAB6AIgAP4DACEBAAAAAQAgHQMAAOUEACAGAADmBAAgBwAA5wQAIAoAAOAEACAPAACvBAAgEQAA1AQAILwCAADjBAAwvQIAAAMAEL4CAADjBAAw0gIBAPwDACHZAkAAlQQAIegCIAD-AwAh9QJAAJUEACH2AgEA_AMAIYwDAQD8AwAhlQMAAJIEACCXAwIAkwQAIZ0DAQD8AwAhngMBAP0DACGfAwEA_AMAIaADAQD8AwAhogMAAOQEogMiowMCAP8DACGkAwIA_wMAIaUDEAC0BAAhpgMCAJMEACGnAwEA_QMAIagDEAC0BAAhqQMQALQEACENAwAAoQcAIAYAAKIHACAHAACjBwAgCgAAnwcAIA8AAMsFACARAACcBwAgngMAAOgEACCjAwAA6AQAIKQDAADoBAAgpQMAAOgEACCnAwAA6AQAIKgDAADoBAAgqQMAAOgEACAdAwAA5QQAIAYAAOYEACAHAADnBAAgCgAA4AQAIA8AAK8EACARAADUBAAgvAIAAOMEADC9AgAAAwAQvgIAAOMEADDSAgEAAAAB2QJAAJUEACHoAiAA_gMAIfUCQACVBAAh9gIBAAAAAYwDAQD8AwAhlQMAAJIEACCXAwIAkwQAIZ0DAQD8AwAhngMBAP0DACGfAwEA_AMAIaADAQD8AwAhogMAAOQEogMiowMCAP8DACGkAwIA_wMAIaUDEAC0BAAhpgMCAJMEACGnAwEA_QMAIagDEAC0BAAhqQMQALQEACEDAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAEAAAADACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAMAIAwIAADbBAAgCwAA4gQAILwCAADhBAAwvQIAAAsAEL4CAADhBAAw0gIBAPwDACH_AgEA_AMAIYEDAQD9AwAhmQMBAPwDACGaAwIA_wMAIZsDAgD_AwAhnAMBAP0DACEGCAAAmwcAIAsAAKAHACCBAwAA6AQAIJoDAADoBAAgmwMAAOgEACCcAwAA6AQAIAwIAADbBAAgCwAA4gQAILwCAADhBAAwvQIAAAsAEL4CAADhBAAw0gIBAAAAAf8CAQD8AwAhgQMBAP0DACGZAwEA_AMAIZoDAgD_AwAhmwMCAP8DACGcAwEA_QMAIQMAAAALACABAAAMADACAAANACAJAwAA3wQAIAoAAOAEACC8AgAA3gQAML0CAAAPABC-AgAA3gQAMNICAQD8AwAh5AIBAPwDACHoAiAA_gMAIZ0DAQD8AwAhAgMAAJ4HACAKAACfBwAgCgMAAN8EACAKAADgBAAgvAIAAN4EADC9AgAADwAQvgIAAN4EADDSAgEAAAAB5AIBAPwDACHoAiAA_gMAIZ0DAQD8AwAhqwMAAN0EACADAAAADwAgAQAAEAAwAgAAEQAgAQAAAA8AIAMAAAALACABAAAMADACAAANACABAAAACwAgDQYAANoElwMiCAAA2wQAIBIAANwEACC8AgAA2QQAML0CAAAWABC-AgAA2QQAMNICAQD8AwAh2QJAAJUEACHqAgEA_QMAIf8CAQD8AwAhhwMBAP0DACGXAwIAkwQAIZgDAgCTBAAhBAgAAJsHACASAACYBwAg6gIAAOgEACCHAwAA6AQAIA0GAADaBJcDIggAANsEACASAADcBAAgvAIAANkEADC9AgAAFgAQvgIAANkEADDSAgEAAAAB2QJAAJUEACHqAgEA_QMAIf8CAQD8AwAhhwMBAP0DACGXAwIAkwQAIZgDAgCTBAAhAwAAABYAIAEAABcAMAIAABgAIBcIAADTBAAgDAAA0QQAIBAAANIEACARAADUBAAgEwAA1QQAILwCAADPBAAwvQIAABoAEL4CAADPBAAw0gIBAPwDACHZAkAAlQQAIe0CAADQBPwCIvUCQACVBAAh9gIBAPwDACH3AgEA_AMAIfgCAQD8AwAh-QJAAJUEACH6AkAAlQQAIfwCQACUBAAh_QIBAP0DACH-AgEA_QMAIf8CAQD9AwAhgAMQALQEACGBAwEA_QMAIQEAAAAaACAJDAAA0QQAILwCAADYBAAwvQIAABwAEL4CAADYBAAw0gIBAPwDACH3AgEA_AMAIYgDAgCTBAAhiQMCAJMEACGKAwIAkwQAIQEMAACZBwAgCQwAANEEACC8AgAA2AQAML0CAAAcABC-AgAA2AQAMNICAQAAAAH3AgEA_AMAIYgDAgCTBAAhiQMCAJMEACGKAwIAkwQAIQMAAAAcACABAAAdADACAAAeACAJDAAA1wQAILwCAADWBAAwvQIAACAAEL4CAADWBAAw0gIBAPwDACH3AgEA_QMAIfkCQACVBAAh-gJAAJUEACGHAwEA_QMAIQMMAACZBwAg9wIAAOgEACCHAwAA6AQAIAkMAADXBAAgvAIAANYEADC9AgAAIAAQvgIAANYEADDSAgEAAAAB9wIBAP0DACH5AkAAlQQAIfoCQACVBAAhhwMBAP0DACEDAAAAIAAgAQAAIQAwAgAAIgAgGA0AALUEACAOAAC2BAAgDwAArwQAILwCAACzBAAwvQIAACQAEL4CAACzBAAwxQICAJMEACHSAgEA_AMAIdgCQACUBAAh2QJAAJUEACHkAgEA_AMAIegCIAD-AwAh9QJAAJUEACGLAwEA_AMAIYwDAQD9AwAhjQMCAJMEACGOAwIAkwQAIY8DAgCTBAAhkAMCAJMEACGRAwIAkwQAIZIDEAC0BAAhkwMBAPwDACGUAyAA_gMAIZUDAACSBAAgAQAAACQAIAsIAACbBwAgDAAAmQcAIBAAAJoHACARAACcBwAgEwAAnQcAIPwCAADoBAAg_QIAAOgEACD-AgAA6AQAIP8CAADoBAAggAMAAOgEACCBAwAA6AQAIBcIAADTBAAgDAAA0QQAIBAAANIEACARAADUBAAgEwAA1QQAILwCAADPBAAwvQIAABoAEL4CAADPBAAw0gIBAAAAAdkCQACVBAAh7QIAANAE_AIi9QJAAJUEACH2AgEAAAAB9wIBAPwDACH4AgEA_AMAIfkCQACVBAAh-gJAAJUEACH8AkAAlAQAIf0CAQD9AwAh_gIBAP0DACH_AgEA_QMAIYADEAC0BAAhgQMBAP0DACEDAAAAGgAgAQAAJgAwAgAAJwAgAQAAABwAIAEAAAAgACABAAAAGgAgAwAAABoAIAEAACYAMAIAACcAIAEAAAAaACABAAAAAwAgAwAAABYAIAEAABcAMAIAABgAIBESAADOBAAgvAIAAMsEADC9AgAAMAAQvgIAAMsEADDSAgEA_AMAIdkCQACVBAAh6gIBAPwDACHrAhAAzAQAIe0CAADNBO0CIu4CAQD9AwAh7wIBAP0DACHwAgEA_QMAIfECQACVBAAh8gIgAP4DACHzAgEA_QMAIfQCQACUBAAh9QJAAJUEACEGEgAAmAcAIO4CAADoBAAg7wIAAOgEACDwAgAA6AQAIPMCAADoBAAg9AIAAOgEACAREgAAzgQAILwCAADLBAAwvQIAADAAEL4CAADLBAAw0gIBAAAAAdkCQACVBAAh6gIBAPwDACHrAhAAzAQAIe0CAADNBO0CIu4CAQD9AwAh7wIBAP0DACHwAgEAAAAB8QJAAJUEACHyAiAA_gMAIfMCAQD9AwAh9AJAAJQEACH1AkAAlQQAIQMAAAAwACABAAAxADACAAAyACABAAAAFgAgAQAAADAAIAMAAAAaACABAAAmADACAAAnACABAAAACwAgAQAAABYAIAEAAAAaACABAAAAAwAgAQAAAAEAIAcEAADGBAAgvAIAAMoEADC9AgAAPAAQvgIAAMoEADDSAgEA_AMAIeQCAQD8AwAh6AIgAP4DACEBBAAA-wYAIAMAAAA8ACABAAA9ADACAAABACADAAAAPAAgAQAAPQAwAgAAAQAgAwAAADwAIAEAAD0AMAIAAAEAIAQEAACXBwAg0gIBAAAAAeQCAQAAAAHoAiAAAAABARkAAEEAIAPSAgEAAAAB5AIBAAAAAegCIAAAAAEBGQAAQwAwARkAAEMAMAQEAACNBwAg0gIBAO8EACHkAgEA7wQAIegCIADxBAAhAgAAAAEAIBkAAEYAIAPSAgEA7wQAIeQCAQDvBAAh6AIgAPEEACECAAAAPAAgGQAASAAgAgAAADwAIBkAAEgAIAMAAAABACAgAABBACAhAABGACABAAAAAQAgAQAAADwAIAMFAACKBwAgJgAAjAcAICcAAIsHACAGvAIAAMkEADC9AgAATwAQvgIAAMkEADDSAgEA6gMAIeQCAQDqAwAh6AIgAOwDACEDAAAAPAAgAQAATgAwJQAATwAgAwAAADwAIAEAAD0AMAIAAAEAIAgEAADGBAAgvAIAAMgEADC9AgAAVQAQvgIAAMgEADDSAgEAAAAB5AIBAAAAAegCIAD-AwAhjAMBAP0DACEBAAAAUgAgAQAAAFIAIAgEAADGBAAgvAIAAMgEADC9AgAAVQAQvgIAAMgEADDSAgEA_AMAIeQCAQD8AwAh6AIgAP4DACGMAwEA_QMAIQIEAAD7BgAgjAMAAOgEACADAAAAVQAgAQAAVgAwAgAAUgAgAwAAAFUAIAEAAFYAMAIAAFIAIAMAAABVACABAABWADACAABSACAFBAAAiQcAINICAQAAAAHkAgEAAAAB6AIgAAAAAYwDAQAAAAEBGQAAWgAgBNICAQAAAAHkAgEAAAAB6AIgAAAAAYwDAQAAAAEBGQAAXAAwARkAAFwAMAUEAAD_BgAg0gIBAO8EACHkAgEA7wQAIegCIADxBAAhjAMBAPAEACECAAAAUgAgGQAAXwAgBNICAQDvBAAh5AIBAO8EACHoAiAA8QQAIYwDAQDwBAAhAgAAAFUAIBkAAGEAIAIAAABVACAZAABhACADAAAAUgAgIAAAWgAgIQAAXwAgAQAAAFIAIAEAAABVACAEBQAA_AYAICYAAP4GACAnAAD9BgAgjAMAAOgEACAHvAIAAMcEADC9AgAAaAAQvgIAAMcEADDSAgEA6gMAIeQCAQDqAwAh6AIgAOwDACGMAwEA6wMAIQMAAABVACABAABnADAlAABoACADAAAAVQAgAQAAVgAwAgAAUgAgCQQAAMYEACC8AgAAxQQAML0CAABuABC-AgAAxQQAMMUCAgCTBAAh0gIBAAAAAeQCAQAAAAHoAiAA_gMAIaoDIAD-AwAhAQAAAGsAIAEAAABrACAJBAAAxgQAILwCAADFBAAwvQIAAG4AEL4CAADFBAAwxQICAJMEACHSAgEA_AMAIeQCAQD8AwAh6AIgAP4DACGqAyAA_gMAIQEEAAD7BgAgAwAAAG4AIAEAAG8AMAIAAGsAIAMAAABuACABAABvADACAABrACADAAAAbgAgAQAAbwAwAgAAawAgBgQAAPoGACDFAgIAAAAB0gIBAAAAAeQCAQAAAAHoAiAAAAABqgMgAAAAAQEZAABzACAFxQICAAAAAdICAQAAAAHkAgEAAAAB6AIgAAAAAaoDIAAAAAEBGQAAdQAwARkAAHUAMAYEAADtBgAgxQICAPkEACHSAgEA7wQAIeQCAQDvBAAh6AIgAPEEACGqAyAA8QQAIQIAAABrACAZAAB4ACAFxQICAPkEACHSAgEA7wQAIeQCAQDvBAAh6AIgAPEEACGqAyAA8QQAIQIAAABuACAZAAB6ACACAAAAbgAgGQAAegAgAwAAAGsAICAAAHMAICEAAHgAIAEAAABrACABAAAAbgAgBQUAAOgGACAmAADrBgAgJwAA6gYAIEgAAOkGACBJAADsBgAgCLwCAADEBAAwvQIAAIEBABC-AgAAxAQAMMUCAgCEBAAh0gIBAOoDACHkAgEA6gMAIegCIADsAwAhqgMgAOwDACEDAAAAbgAgAQAAgAEAMCUAAIEBACADAAAAbgAgAQAAbwAwAgAAawAgAQAAAAUAIAEAAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACAaAwAA4gYAIAYAAOMGACAHAADkBgAgCgAA5QYAIA8AAOcGACARAADmBgAg0gIBAAAAAdkCQAAAAAHoAiAAAAAB9QJAAAAAAfYCAQAAAAGMAwEAAAABlQOAAAAAAZcDAgAAAAGdAwEAAAABngMBAAAAAZ8DAQAAAAGgAwEAAAABogMAAACiAwKjAwIAAAABpAMCAAAAAaUDEAAAAAGmAwIAAAABpwMBAAAAAagDEAAAAAGpAxAAAAABARkAAIkBACAU0gIBAAAAAdkCQAAAAAHoAiAAAAAB9QJAAAAAAfYCAQAAAAGMAwEAAAABlQOAAAAAAZcDAgAAAAGdAwEAAAABngMBAAAAAZ8DAQAAAAGgAwEAAAABogMAAACiAwKjAwIAAAABpAMCAAAAAaUDEAAAAAGmAwIAAAABpwMBAAAAAagDEAAAAAGpAxAAAAABARkAAIsBADABGQAAiwEAMBoDAADBBgAgBgAAwgYAIAcAAMMGACAKAADEBgAgDwAAxgYAIBEAAMUGACDSAgEA7wQAIdkCQAD7BAAh6AIgAPEEACH1AkAA-wQAIfYCAQDvBAAhjAMBAO8EACGVA4AAAAABlwMCAPkEACGdAwEA7wQAIZ4DAQDwBAAhnwMBAO8EACGgAwEA7wQAIaIDAADABqIDIqMDAgDyBAAhpAMCAPIEACGlAxAAlAUAIaYDAgD5BAAhpwMBAPAEACGoAxAAlAUAIakDEACUBQAhAgAAAAUAIBkAAI4BACAU0gIBAO8EACHZAkAA-wQAIegCIADxBAAh9QJAAPsEACH2AgEA7wQAIYwDAQDvBAAhlQOAAAAAAZcDAgD5BAAhnQMBAO8EACGeAwEA8AQAIZ8DAQDvBAAhoAMBAO8EACGiAwAAwAaiAyKjAwIA8gQAIaQDAgDyBAAhpQMQAJQFACGmAwIA-QQAIacDAQDwBAAhqAMQAJQFACGpAxAAlAUAIQIAAAADACAZAACQAQAgAgAAAAMAIBkAAJABACADAAAABQAgIAAAiQEAICEAAI4BACABAAAABQAgAQAAAAMAIAwFAAC7BgAgJgAAvgYAICcAAL0GACBIAAC8BgAgSQAAvwYAIJ4DAADoBAAgowMAAOgEACCkAwAA6AQAIKUDAADoBAAgpwMAAOgEACCoAwAA6AQAIKkDAADoBAAgF7wCAADABAAwvQIAAJcBABC-AgAAwAQAMNICAQDqAwAh2QJAAIYEACHoAiAA7AMAIfUCQACGBAAh9gIBAOoDACGMAwEA6gMAIZUDAACDBAAglwMCAIQEACGdAwEA6gMAIZ4DAQDrAwAhnwMBAOoDACGgAwEA6gMAIaIDAADBBKIDIqMDAgDtAwAhpAMCAO0DACGlAxAAqAQAIaYDAgCEBAAhpwMBAOsDACGoAxAAqAQAIakDEACoBAAhAwAAAAMAIAEAAJYBADAlAACXAQAgAwAAAAMAIAEAAAQAMAIAAAUAIAcJAAC_BAAgvAIAAL4EADC9AgAAnQEAEL4CAAC-BAAw0gIBAAAAAeQCAQAAAAHoAiAA_gMAIQEAAACaAQAgAQAAAJoBACAHCQAAvwQAILwCAAC-BAAwvQIAAJ0BABC-AgAAvgQAMNICAQD8AwAh5AIBAPwDACHoAiAA_gMAIQEJAAC6BgAgAwAAAJ0BACABAACeAQAwAgAAmgEAIAMAAACdAQAgAQAAngEAMAIAAJoBACADAAAAnQEAIAEAAJ4BADACAACaAQAgBAkAALkGACDSAgEAAAAB5AIBAAAAAegCIAAAAAEBGQAAogEAIAPSAgEAAAAB5AIBAAAAAegCIAAAAAEBGQAApAEAMAEZAACkAQAwBAkAAKwGACDSAgEA7wQAIeQCAQDvBAAh6AIgAPEEACECAAAAmgEAIBkAAKcBACAD0gIBAO8EACHkAgEA7wQAIegCIADxBAAhAgAAAJ0BACAZAACpAQAgAgAAAJ0BACAZAACpAQAgAwAAAJoBACAgAACiAQAgIQAApwEAIAEAAACaAQAgAQAAAJ0BACADBQAAqQYAICYAAKsGACAnAACqBgAgBrwCAAC9BAAwvQIAALABABC-AgAAvQQAMNICAQDqAwAh5AIBAOoDACHoAiAA7AMAIQMAAACdAQAgAQAArwEAMCUAALABACADAAAAnQEAIAEAAJ4BADACAACaAQAgAQAAABEAIAEAAAARACADAAAADwAgAQAAEAAwAgAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAMAAAAPACABAAAQADACAAARACAGAwAApwYAIAoAAKgGACDSAgEAAAAB5AIBAAAAAegCIAAAAAGdAwEAAAABARkAALgBACAE0gIBAAAAAeQCAQAAAAHoAiAAAAABnQMBAAAAAQEZAAC6AQAwARkAALoBADAGAwAAmQYAIAoAAJoGACDSAgEA7wQAIeQCAQDvBAAh6AIgAPEEACGdAwEA7wQAIQIAAAARACAZAAC9AQAgBNICAQDvBAAh5AIBAO8EACHoAiAA8QQAIZ0DAQDvBAAhAgAAAA8AIBkAAL8BACACAAAADwAgGQAAvwEAIAMAAAARACAgAAC4AQAgIQAAvQEAIAEAAAARACABAAAADwAgAwUAAJYGACAmAACYBgAgJwAAlwYAIAe8AgAAvAQAML0CAADGAQAQvgIAALwEADDSAgEA6gMAIeQCAQDqAwAh6AIgAOwDACGdAwEA6gMAIQMAAAAPACABAADFAQAwJQAAxgEAIAMAAAAPACABAAAQADACAAARACABAAAADQAgAQAAAA0AIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAkIAACUBgAgCwAAlQYAINICAQAAAAH_AgEAAAABgQMBAAAAAZkDAQAAAAGaAwIAAAABmwMCAAAAAZwDAQAAAAEBGQAAzgEAIAfSAgEAAAAB_wIBAAAAAYEDAQAAAAGZAwEAAAABmgMCAAAAAZsDAgAAAAGcAwEAAAABARkAANABADABGQAA0AEAMAkIAACSBgAgCwAAkwYAINICAQDvBAAh_wIBAO8EACGBAwEA8AQAIZkDAQDvBAAhmgMCAPIEACGbAwIA8gQAIZwDAQDwBAAhAgAAAA0AIBkAANMBACAH0gIBAO8EACH_AgEA7wQAIYEDAQDwBAAhmQMBAO8EACGaAwIA8gQAIZsDAgDyBAAhnAMBAPAEACECAAAACwAgGQAA1QEAIAIAAAALACAZAADVAQAgAwAAAA0AICAAAM4BACAhAADTAQAgAQAAAA0AIAEAAAALACAJBQAAjQYAICYAAJAGACAnAACPBgAgSAAAjgYAIEkAAJEGACCBAwAA6AQAIJoDAADoBAAgmwMAAOgEACCcAwAA6AQAIAq8AgAAuwQAML0CAADcAQAQvgIAALsEADDSAgEA6gMAIf8CAQDqAwAhgQMBAOsDACGZAwEA6gMAIZoDAgDtAwAhmwMCAO0DACGcAwEA6wMAIQMAAAALACABAADbAQAwJQAA3AEAIAMAAAALACABAAAMADACAAANACABAAAAGAAgAQAAABgAIAMAAAAWACABAAAXADACAAAYACADAAAAFgAgAQAAFwAwAgAAGAAgAwAAABYAIAEAABcAMAIAABgAIAoGAAAAlwMCCAAAtAUAIBIAAIwGACDSAgEAAAAB2QJAAAAAAeoCAQAAAAH_AgEAAAABhwMBAAAAAZcDAgAAAAGYAwIAAAABARkAAOQBACAIBgAAAJcDAtICAQAAAAHZAkAAAAAB6gIBAAAAAf8CAQAAAAGHAwEAAAABlwMCAAAAAZgDAgAAAAEBGQAA5gEAMAEZAADmAQAwAQAAABoAIAoGAACwBZcDIggAALIFACASAACLBgAg0gIBAO8EACHZAkAA-wQAIeoCAQDwBAAh_wIBAO8EACGHAwEA8AQAIZcDAgD5BAAhmAMCAPkEACECAAAAGAAgGQAA6gEAIAgGAACwBZcDItICAQDvBAAh2QJAAPsEACHqAgEA8AQAIf8CAQDvBAAhhwMBAPAEACGXAwIA-QQAIZgDAgD5BAAhAgAAABYAIBkAAOwBACACAAAAFgAgGQAA7AEAIAEAAAAaACADAAAAGAAgIAAA5AEAICEAAOoBACABAAAAGAAgAQAAABYAIAcFAACGBgAgJgAAiQYAICcAAIgGACBIAACHBgAgSQAAigYAIOoCAADoBAAghwMAAOgEACALBgAAuASXAyK8AgAAtwQAML0CAAD0AQAQvgIAALcEADDSAgEA6gMAIdkCQACGBAAh6gIBAOsDACH_AgEA6gMAIYcDAQDrAwAhlwMCAIQEACGYAwIAhAQAIQMAAAAWACABAADzAQAwJQAA9AEAIAMAAAAWACABAAAXADACAAAYACAYDQAAtQQAIA4AALYEACAPAACvBAAgvAIAALMEADC9AgAAJAAQvgIAALMEADDFAgIAkwQAIdICAQAAAAHYAkAAlAQAIdkCQACVBAAh5AIBAAAAAegCIAD-AwAh9QJAAJUEACGLAwEAAAABjAMBAP0DACGNAwIAkwQAIY4DAgCTBAAhjwMCAJMEACGQAwIAkwQAIZEDAgCTBAAhkgMQALQEACGTAwEA_AMAIZQDIAD-AwAhlQMAAJIEACABAAAA9wEAIAEAAAD3AQAgBg0AAIQGACAOAACFBgAgDwAAywUAINgCAADoBAAgjAMAAOgEACCSAwAA6AQAIAMAAAAkACABAAD6AQAwAgAA9wEAIAMAAAAkACABAAD6AQAwAgAA9wEAIAMAAAAkACABAAD6AQAwAgAA9wEAIBUNAACBBgAgDgAAggYAIA8AAIMGACDFAgIAAAAB0gIBAAAAAdgCQAAAAAHZAkAAAAAB5AIBAAAAAegCIAAAAAH1AkAAAAABiwMBAAAAAYwDAQAAAAGNAwIAAAABjgMCAAAAAY8DAgAAAAGQAwIAAAABkQMCAAAAAZIDEAAAAAGTAwEAAAABlAMgAAAAAZUDgAAAAAEBGQAA_gEAIBLFAgIAAAAB0gIBAAAAAdgCQAAAAAHZAkAAAAAB5AIBAAAAAegCIAAAAAH1AkAAAAABiwMBAAAAAYwDAQAAAAGNAwIAAAABjgMCAAAAAY8DAgAAAAGQAwIAAAABkQMCAAAAAZIDEAAAAAGTAwEAAAABlAMgAAAAAZUDgAAAAAEBGQAAgAIAMAEZAACAAgAwFQ0AAN0FACAOAADeBQAgDwAA3wUAIMUCAgD5BAAh0gIBAO8EACHYAkAA-gQAIdkCQAD7BAAh5AIBAO8EACHoAiAA8QQAIfUCQAD7BAAhiwMBAO8EACGMAwEA8AQAIY0DAgD5BAAhjgMCAPkEACGPAwIA-QQAIZADAgD5BAAhkQMCAPkEACGSAxAAlAUAIZMDAQDvBAAhlAMgAPEEACGVA4AAAAABAgAAAPcBACAZAACDAgAgEsUCAgD5BAAh0gIBAO8EACHYAkAA-gQAIdkCQAD7BAAh5AIBAO8EACHoAiAA8QQAIfUCQAD7BAAhiwMBAO8EACGMAwEA8AQAIY0DAgD5BAAhjgMCAPkEACGPAwIA-QQAIZADAgD5BAAhkQMCAPkEACGSAxAAlAUAIZMDAQDvBAAhlAMgAPEEACGVA4AAAAABAgAAACQAIBkAAIUCACACAAAAJAAgGQAAhQIAIAMAAAD3AQAgIAAA_gEAICEAAIMCACABAAAA9wEAIAEAAAAkACAIBQAA2AUAICYAANsFACAnAADaBQAgSAAA2QUAIEkAANwFACDYAgAA6AQAIIwDAADoBAAgkgMAAOgEACAVvAIAALIEADC9AgAAjAIAEL4CAACyBAAwxQICAIQEACHSAgEA6gMAIdgCQACFBAAh2QJAAIYEACHkAgEA6gMAIegCIADsAwAh9QJAAIYEACGLAwEA6gMAIYwDAQDrAwAhjQMCAIQEACGOAwIAhAQAIY8DAgCEBAAhkAMCAIQEACGRAwIAhAQAIZIDEACoBAAhkwMBAOoDACGUAyAA7AMAIZUDAACDBAAgAwAAACQAIAEAAIsCADAlAACMAgAgAwAAACQAIAEAAPoBADACAAD3AQAgAQAAAB4AIAEAAAAeACADAAAAHAAgAQAAHQAwAgAAHgAgAwAAABwAIAEAAB0AMAIAAB4AIAMAAAAcACABAAAdADACAAAeACAGDAAA1wUAINICAQAAAAH3AgEAAAABiAMCAAAAAYkDAgAAAAGKAwIAAAABARkAAJQCACAF0gIBAAAAAfcCAQAAAAGIAwIAAAABiQMCAAAAAYoDAgAAAAEBGQAAlgIAMAEZAACWAgAwBgwAANYFACDSAgEA7wQAIfcCAQDvBAAhiAMCAPkEACGJAwIA-QQAIYoDAgD5BAAhAgAAAB4AIBkAAJkCACAF0gIBAO8EACH3AgEA7wQAIYgDAgD5BAAhiQMCAPkEACGKAwIA-QQAIQIAAAAcACAZAACbAgAgAgAAABwAIBkAAJsCACADAAAAHgAgIAAAlAIAICEAAJkCACABAAAAHgAgAQAAABwAIAUFAADRBQAgJgAA1AUAICcAANMFACBIAADSBQAgSQAA1QUAIAi8AgAAsQQAML0CAACiAgAQvgIAALEEADDSAgEA6gMAIfcCAQDqAwAhiAMCAIQEACGJAwIAhAQAIYoDAgCEBAAhAwAAABwAIAEAAKECADAlAACiAgAgAwAAABwAIAEAAB0AMAIAAB4AIAEAAAAiACABAAAAIgAgAwAAACAAIAEAACEAMAIAACIAIAMAAAAgACABAAAhADACAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgBgwAANAFACDSAgEAAAAB9wIBAAAAAfkCQAAAAAH6AkAAAAABhwMBAAAAAQEZAACqAgAgBdICAQAAAAH3AgEAAAAB-QJAAAAAAfoCQAAAAAGHAwEAAAABARkAAKwCADABGQAArAIAMAEAAAAkACAGDAAAzwUAINICAQDvBAAh9wIBAPAEACH5AkAA-wQAIfoCQAD7BAAhhwMBAPAEACECAAAAIgAgGQAAsAIAIAXSAgEA7wQAIfcCAQDwBAAh-QJAAPsEACH6AkAA-wQAIYcDAQDwBAAhAgAAACAAIBkAALICACACAAAAIAAgGQAAsgIAIAEAAAAkACADAAAAIgAgIAAAqgIAICEAALACACABAAAAIgAgAQAAACAAIAUFAADMBQAgJgAAzgUAICcAAM0FACD3AgAA6AQAIIcDAADoBAAgCLwCAACwBAAwvQIAALoCABC-AgAAsAQAMNICAQDqAwAh9wIBAOsDACH5AkAAhgQAIfoCQACGBAAhhwMBAOsDACEDAAAAIAAgAQAAuQIAMCUAALoCACADAAAAIAAgAQAAIQAwAgAAIgAgCg8AAK8EACC8AgAArgQAML0CAADAAgAQvgIAAK4EADDSAgEAAAAB2QJAAJUEACHkAgEA_AMAIYEDAQD9AwAhggMBAPwDACGDAwEA_QMAIQEAAAC9AgAgAQAAAL0CACAKDwAArwQAILwCAACuBAAwvQIAAMACABC-AgAArgQAMNICAQD8AwAh2QJAAJUEACHkAgEA_AMAIYEDAQD9AwAhggMBAPwDACGDAwEA_QMAIQMPAADLBQAggQMAAOgEACCDAwAA6AQAIAMAAADAAgAgAQAAwQIAMAIAAL0CACADAAAAwAIAIAEAAMECADACAAC9AgAgAwAAAMACACABAADBAgAwAgAAvQIAIAcPAADKBQAg0gIBAAAAAdkCQAAAAAHkAgEAAAABgQMBAAAAAYIDAQAAAAGDAwEAAAABARkAAMUCACAG0gIBAAAAAdkCQAAAAAHkAgEAAAABgQMBAAAAAYIDAQAAAAGDAwEAAAABARkAAMcCADABGQAAxwIAMAcPAAC9BQAg0gIBAO8EACHZAkAA-wQAIeQCAQDvBAAhgQMBAPAEACGCAwEA7wQAIYMDAQDwBAAhAgAAAL0CACAZAADKAgAgBtICAQDvBAAh2QJAAPsEACHkAgEA7wQAIYEDAQDwBAAhggMBAO8EACGDAwEA8AQAIQIAAADAAgAgGQAAzAIAIAIAAADAAgAgGQAAzAIAIAMAAAC9AgAgIAAAxQIAICEAAMoCACABAAAAvQIAIAEAAADAAgAgBQUAALoFACAmAAC8BQAgJwAAuwUAIIEDAADoBAAggwMAAOgEACAJvAIAAK0EADC9AgAA0wIAEL4CAACtBAAw0gIBAOoDACHZAkAAhgQAIeQCAQDqAwAhgQMBAOsDACGCAwEA6gMAIYMDAQDrAwAhAwAAAMACACABAADSAgAwJQAA0wIAIAMAAADAAgAgAQAAwQIAMAIAAL0CACABAAAAJwAgAQAAACcAIAMAAAAaACABAAAmADACAAAnACADAAAAGgAgAQAAJgAwAgAAJwAgAwAAABoAIAEAACYAMAIAACcAIBQIAAC3BQAgDAAAtQUAIBAAALYFACARAAC4BQAgEwAAuQUAINICAQAAAAHZAkAAAAAB7QIAAAD8AgL1AkAAAAAB9gIBAAAAAfcCAQAAAAH4AgEAAAAB-QJAAAAAAfoCQAAAAAH8AkAAAAAB_QIBAAAAAf4CAQAAAAH_AgEAAAABgAMQAAAAAYEDAQAAAAEBGQAA2wIAIA_SAgEAAAAB2QJAAAAAAe0CAAAA_AIC9QJAAAAAAfYCAQAAAAH3AgEAAAAB-AIBAAAAAfkCQAAAAAH6AkAAAAAB_AJAAAAAAf0CAQAAAAH-AgEAAAAB_wIBAAAAAYADEAAAAAGBAwEAAAABARkAAN0CADABGQAA3QIAMAEAAAADACAUCAAAlwUAIAwAAJUFACAQAACWBQAgEQAAmAUAIBMAAJkFACDSAgEA7wQAIdkCQAD7BAAh7QIAAJMF_AIi9QJAAPsEACH2AgEA7wQAIfcCAQDvBAAh-AIBAO8EACH5AkAA-wQAIfoCQAD7BAAh_AJAAPoEACH9AgEA8AQAIf4CAQDwBAAh_wIBAPAEACGAAxAAlAUAIYEDAQDwBAAhAgAAACcAIBkAAOECACAP0gIBAO8EACHZAkAA-wQAIe0CAACTBfwCIvUCQAD7BAAh9gIBAO8EACH3AgEA7wQAIfgCAQDvBAAh-QJAAPsEACH6AkAA-wQAIfwCQAD6BAAh_QIBAPAEACH-AgEA8AQAIf8CAQDwBAAhgAMQAJQFACGBAwEA8AQAIQIAAAAaACAZAADjAgAgAgAAABoAIBkAAOMCACABAAAAAwAgAwAAACcAICAAANsCACAhAADhAgAgAQAAACcAIAEAAAAaACALBQAAjgUAICYAAJEFACAnAACQBQAgSAAAjwUAIEkAAJIFACD8AgAA6AQAIP0CAADoBAAg_gIAAOgEACD_AgAA6AQAIIADAADoBAAggQMAAOgEACASvAIAAKYEADC9AgAA6wIAEL4CAACmBAAw0gIBAOoDACHZAkAAhgQAIe0CAACnBPwCIvUCQACGBAAh9gIBAOoDACH3AgEA6gMAIfgCAQDqAwAh-QJAAIYEACH6AkAAhgQAIfwCQACFBAAh_QIBAOsDACH-AgEA6wMAIf8CAQDrAwAhgAMQAKgEACGBAwEA6wMAIQMAAAAaACABAADqAgAwJQAA6wIAIAMAAAAaACABAAAmADACAAAnACABAAAAMgAgAQAAADIAIAMAAAAwACABAAAxADACAAAyACADAAAAMAAgAQAAMQAwAgAAMgAgAwAAADAAIAEAADEAMAIAADIAIA4SAACNBQAg0gIBAAAAAdkCQAAAAAHqAgEAAAAB6wIQAAAAAe0CAAAA7QIC7gIBAAAAAe8CAQAAAAHwAgEAAAAB8QJAAAAAAfICIAAAAAHzAgEAAAAB9AJAAAAAAfUCQAAAAAEBGQAA8wIAIA3SAgEAAAAB2QJAAAAAAeoCAQAAAAHrAhAAAAAB7QIAAADtAgLuAgEAAAAB7wIBAAAAAfACAQAAAAHxAkAAAAAB8gIgAAAAAfMCAQAAAAH0AkAAAAAB9QJAAAAAAQEZAAD1AgAwARkAAPUCADAOEgAAjAUAINICAQDvBAAh2QJAAPsEACHqAgEA7wQAIesCEACKBQAh7QIAAIsF7QIi7gIBAPAEACHvAgEA8AQAIfACAQDwBAAh8QJAAPsEACHyAiAA8QQAIfMCAQDwBAAh9AJAAPoEACH1AkAA-wQAIQIAAAAyACAZAAD4AgAgDdICAQDvBAAh2QJAAPsEACHqAgEA7wQAIesCEACKBQAh7QIAAIsF7QIi7gIBAPAEACHvAgEA8AQAIfACAQDwBAAh8QJAAPsEACHyAiAA8QQAIfMCAQDwBAAh9AJAAPoEACH1AkAA-wQAIQIAAAAwACAZAAD6AgAgAgAAADAAIBkAAPoCACADAAAAMgAgIAAA8wIAICEAAPgCACABAAAAMgAgAQAAADAAIAoFAACFBQAgJgAAiAUAICcAAIcFACBIAACGBQAgSQAAiQUAIO4CAADoBAAg7wIAAOgEACDwAgAA6AQAIPMCAADoBAAg9AIAAOgEACAQvAIAAJ8EADC9AgAAgQMAEL4CAACfBAAw0gIBAOoDACHZAkAAhgQAIeoCAQDqAwAh6wIQAKAEACHtAgAAoQTtAiLuAgEA6wMAIe8CAQDrAwAh8AIBAOsDACHxAkAAhgQAIfICIADsAwAh8wIBAOsDACH0AkAAhQQAIfUCQACGBAAhAwAAADAAIAEAAIADADAlAACBAwAgAwAAADAAIAEAADEAMAIAADIAIAu8AgAAnQQAML0CAACHAwAQvgIAAJ0EADDSAgEAAAAB2QJAAJUEACHgAgEAAAAB5AIBAPwDACHlAgEA_AMAIecCAACeBOcCIugCIAD-AwAh6QJAAJQEACEBAAAAhAMAIAEAAACEAwAgC7wCAACdBAAwvQIAAIcDABC-AgAAnQQAMNICAQD8AwAh2QJAAJUEACHgAgEA_AMAIeQCAQD8AwAh5QIBAPwDACHnAgAAngTnAiLoAiAA_gMAIekCQACUBAAhAekCAADoBAAgAwAAAIcDACABAACIAwAwAgAAhAMAIAMAAACHAwAgAQAAiAMAMAIAAIQDACADAAAAhwMAIAEAAIgDADACAACEAwAgCNICAQAAAAHZAkAAAAAB4AIBAAAAAeQCAQAAAAHlAgEAAAAB5wIAAADnAgLoAiAAAAAB6QJAAAAAAQEZAACMAwAgCNICAQAAAAHZAkAAAAAB4AIBAAAAAeQCAQAAAAHlAgEAAAAB5wIAAADnAgLoAiAAAAAB6QJAAAAAAQEZAACOAwAwARkAAI4DADAI0gIBAO8EACHZAkAA-wQAIeACAQDvBAAh5AIBAO8EACHlAgEA7wQAIecCAACEBecCIugCIADxBAAh6QJAAPoEACECAAAAhAMAIBkAAJEDACAI0gIBAO8EACHZAkAA-wQAIeACAQDvBAAh5AIBAO8EACHlAgEA7wQAIecCAACEBecCIugCIADxBAAh6QJAAPoEACECAAAAhwMAIBkAAJMDACACAAAAhwMAIBkAAJMDACADAAAAhAMAICAAAIwDACAhAACRAwAgAQAAAIQDACABAAAAhwMAIAQFAACBBQAgJgAAgwUAICcAAIIFACDpAgAA6AQAIAu8AgAAmQQAML0CAACaAwAQvgIAAJkEADDSAgEA6gMAIdkCQACGBAAh4AIBAOoDACHkAgEA6gMAIeUCAQDqAwAh5wIAAJoE5wIi6AIgAOwDACHpAkAAhQQAIQMAAACHAwAgAQAAmQMAMCUAAJoDACADAAAAhwMAIAEAAIgDADACAACEAwAgB7wCAACYBAAwvQIAAKADABC-AgAAmAQAMOACAQAAAAHhAgIAkwQAIeICQACUBAAh4wJAAJQEACEBAAAAnQMAIAEAAACdAwAgB7wCAACYBAAwvQIAAKADABC-AgAAmAQAMOACAQD8AwAh4QICAJMEACHiAkAAlAQAIeMCQACUBAAhAuICAADoBAAg4wIAAOgEACADAAAAoAMAIAEAAKEDADACAACdAwAgAwAAAKADACABAAChAwAwAgAAnQMAIAMAAACgAwAgAQAAoQMAMAIAAJ0DACAE4AIBAAAAAeECAgAAAAHiAkAAAAAB4wJAAAAAAQEZAAClAwAgBOACAQAAAAHhAgIAAAAB4gJAAAAAAeMCQAAAAAEBGQAApwMAMAEZAACnAwAwBOACAQDvBAAh4QICAPkEACHiAkAA-gQAIeMCQAD6BAAhAgAAAJ0DACAZAACqAwAgBOACAQDvBAAh4QICAPkEACHiAkAA-gQAIeMCQAD6BAAhAgAAAKADACAZAACsAwAgAgAAAKADACAZAACsAwAgAwAAAJ0DACAgAAClAwAgIQAAqgMAIAEAAACdAwAgAQAAAKADACAHBQAA_AQAICYAAP8EACAnAAD-BAAgSAAA_QQAIEkAAIAFACDiAgAA6AQAIOMCAADoBAAgB7wCAACXBAAwvQIAALMDABC-AgAAlwQAMOACAQDqAwAh4QICAIQEACHiAkAAhQQAIeMCQACFBAAhAwAAAKADACABAACyAwAwJQAAswMAIAMAAACgAwAgAQAAoQMAMAIAAJ0DACARBgAAkQTUAiK8AgAAkAQAML0CAAC5AwAQvgIAAJAEADDAAgAA-wPAAiLBAgEA_AMAIcICAQD8AwAhwwIBAP0DACHFAgIAkwQAIdECAACWBAAg0gIBAAAAAdQCIAD-AwAh1QIBAP0DACHWAgAAkgQAINcCIAD-AwAh2AJAAJQEACHZAkAAlQQAIQEAAAC2AwAgAQAAALYDACAQBgAAkQTUAiK8AgAAkAQAML0CAAC5AwAQvgIAAJAEADDAAgAA-wPAAiLBAgEA_AMAIcICAQD8AwAhwwIBAP0DACHFAgIAkwQAIdICAQD8AwAh1AIgAP4DACHVAgEA_QMAIdYCAACSBAAg1wIgAP4DACHYAkAAlAQAIdkCQACVBAAhA8MCAADoBAAg1QIAAOgEACDYAgAA6AQAIAMAAAC5AwAgAQAAugMAMAIAALYDACADAAAAuQMAIAEAALoDADACAAC2AwAgAwAAALkDACABAAC6AwAwAgAAtgMAIA0GAAAA1AICwAIAAADAAgLBAgEAAAABwgIBAAAAAcMCAQAAAAHFAgIAAAAB0gIBAAAAAdQCIAAAAAHVAgEAAAAB1gKAAAAAAdcCIAAAAAHYAkAAAAAB2QJAAAAAAQEZAAC-AwAgDQYAAADUAgLAAgAAAMACAsECAQAAAAHCAgEAAAABwwIBAAAAAcUCAgAAAAHSAgEAAAAB1AIgAAAAAdUCAQAAAAHWAoAAAAAB1wIgAAAAAdgCQAAAAAHZAkAAAAABARkAAMADADABGQAAwAMAMA0GAAD4BNQCIsACAADuBMACIsECAQDvBAAhwgIBAO8EACHDAgEA8AQAIcUCAgD5BAAh0gIBAO8EACHUAiAA8QQAIdUCAQDwBAAh1gKAAAAAAdcCIADxBAAh2AJAAPoEACHZAkAA-wQAIQIAAAC2AwAgGQAAwwMAIA0GAAD4BNQCIsACAADuBMACIsECAQDvBAAhwgIBAO8EACHDAgEA8AQAIcUCAgD5BAAh0gIBAO8EACHUAiAA8QQAIdUCAQDwBAAh1gKAAAAAAdcCIADxBAAh2AJAAPoEACHZAkAA-wQAIQIAAAC5AwAgGQAAxQMAIAIAAAC5AwAgGQAAxQMAIAMAAAC2AwAgIAAAvgMAICEAAMMDACABAAAAtgMAIAEAAAC5AwAgCAUAAPMEACAmAAD2BAAgJwAA9QQAIEgAAPQEACBJAAD3BAAgwwIAAOgEACDVAgAA6AQAINgCAADoBAAgEAYAAIIE1AIivAIAAIEEADC9AgAAzAMAEL4CAACBBAAwwAIAAOkDwAIiwQIBAOoDACHCAgEA6gMAIcMCAQDrAwAhxQICAIQEACHSAgEA6gMAIdQCIADsAwAh1QIBAOsDACHWAgAAgwQAINcCIADsAwAh2AJAAIUEACHZAkAAhgQAIQMAAAC5AwAgAQAAywMAMCUAAMwDACADAAAAuQMAIAEAALoDADACAAC2AwAgCrwCAAD6AwAwvQIAANIDABC-AgAA-gMAMMACAAD7A8ACIsECAQD8AwAhwgIBAP0DACHDAgEA_QMAIcQCIAD-AwAhxQICAP8DACHRAgAAgAQAIAEAAADPAwAgAQAAAM8DACAJvAIAAPoDADC9AgAA0gMAEL4CAAD6AwAwwAIAAPsDwAIiwQIBAPwDACHCAgEA_QMAIcMCAQD9AwAhxAIgAP4DACHFAgIA_wMAIQPCAgAA6AQAIMMCAADoBAAgxQIAAOgEACADAAAA0gMAIAEAANMDADACAADPAwAgAwAAANIDACABAADTAwAwAgAAzwMAIAMAAADSAwAgAQAA0wMAMAIAAM8DACAGwAIAAADAAgLBAgEAAAABwgIBAAAAAcMCAQAAAAHEAiAAAAABxQICAAAAAQEZAADXAwAgBsACAAAAwAICwQIBAAAAAcICAQAAAAHDAgEAAAABxAIgAAAAAcUCAgAAAAEBGQAA2QMAMAEZAADZAwAwBsACAADuBMACIsECAQDvBAAhwgIBAPAEACHDAgEA8AQAIcQCIADxBAAhxQICAPIEACECAAAAzwMAIBkAANwDACAGwAIAAO4EwAIiwQIBAO8EACHCAgEA8AQAIcMCAQDwBAAhxAIgAPEEACHFAgIA8gQAIQIAAADSAwAgGQAA3gMAIAIAAADSAwAgGQAA3gMAIAMAAADPAwAgIAAA1wMAICEAANwDACABAAAAzwMAIAEAAADSAwAgCAUAAOkEACAmAADsBAAgJwAA6wQAIEgAAOoEACBJAADtBAAgwgIAAOgEACDDAgAA6AQAIMUCAADoBAAgCbwCAADoAwAwvQIAAOUDABC-AgAA6AMAMMACAADpA8ACIsECAQDqAwAhwgIBAOsDACHDAgEA6wMAIcQCIADsAwAhxQICAO0DACEDAAAA0gMAIAEAAOQDADAlAADlAwAgAwAAANIDACABAADTAwAwAgAAzwMAIAm8AgAA6AMAML0CAADlAwAQvgIAAOgDADDAAgAA6QPAAiLBAgEA6gMAIcICAQDrAwAhwwIBAOsDACHEAiAA7AMAIcUCAgDtAwAhBwUAAPIDACAmAAD5AwAgJwAA-QMAIMYCAAAAwAICxwIAAADAAgjIAgAAAMACCM0CAAD4A8ACIg4FAADyAwAgJgAA9wMAICcAAPcDACDGAgEAAAABxwIBAAAABMgCAQAAAATJAgEAAAABygIBAAAAAcsCAQAAAAHMAgEAAAABzQIBAPYDACHOAgEAAAABzwIBAAAAAdACAQAAAAEOBQAA7wMAICYAAPUDACAnAAD1AwAgxgIBAAAAAccCAQAAAAXIAgEAAAAFyQIBAAAAAcoCAQAAAAHLAgEAAAABzAIBAAAAAc0CAQD0AwAhzgIBAAAAAc8CAQAAAAHQAgEAAAABBQUAAPIDACAmAADzAwAgJwAA8wMAIMYCIAAAAAHNAiAA8QMAIQ0FAADvAwAgJgAA7wMAICcAAO8DACBIAADwAwAgSQAA7wMAIMYCAgAAAAHHAgIAAAAFyAICAAAABckCAgAAAAHKAgIAAAABywICAAAAAcwCAgAAAAHNAgIA7gMAIQ0FAADvAwAgJgAA7wMAICcAAO8DACBIAADwAwAgSQAA7wMAIMYCAgAAAAHHAgIAAAAFyAICAAAABckCAgAAAAHKAgIAAAABywICAAAAAcwCAgAAAAHNAgIA7gMAIQjGAgIAAAABxwICAAAABcgCAgAAAAXJAgIAAAABygICAAAAAcsCAgAAAAHMAgIAAAABzQICAO8DACEIxgIIAAAAAccCCAAAAAXIAggAAAAFyQIIAAAAAcoCCAAAAAHLAggAAAABzAIIAAAAAc0CCADwAwAhBQUAAPIDACAmAADzAwAgJwAA8wMAIMYCIAAAAAHNAiAA8QMAIQjGAgIAAAABxwICAAAABMgCAgAAAATJAgIAAAABygICAAAAAcsCAgAAAAHMAgIAAAABzQICAPIDACECxgIgAAAAAc0CIADzAwAhDgUAAO8DACAmAAD1AwAgJwAA9QMAIMYCAQAAAAHHAgEAAAAFyAIBAAAABckCAQAAAAHKAgEAAAABywIBAAAAAcwCAQAAAAHNAgEA9AMAIc4CAQAAAAHPAgEAAAAB0AIBAAAAAQvGAgEAAAABxwIBAAAABcgCAQAAAAXJAgEAAAABygIBAAAAAcsCAQAAAAHMAgEAAAABzQIBAPUDACHOAgEAAAABzwIBAAAAAdACAQAAAAEOBQAA8gMAICYAAPcDACAnAAD3AwAgxgIBAAAAAccCAQAAAATIAgEAAAAEyQIBAAAAAcoCAQAAAAHLAgEAAAABzAIBAAAAAc0CAQD2AwAhzgIBAAAAAc8CAQAAAAHQAgEAAAABC8YCAQAAAAHHAgEAAAAEyAIBAAAABMkCAQAAAAHKAgEAAAABywIBAAAAAcwCAQAAAAHNAgEA9wMAIc4CAQAAAAHPAgEAAAAB0AIBAAAAAQcFAADyAwAgJgAA-QMAICcAAPkDACDGAgAAAMACAscCAAAAwAIIyAIAAADAAgjNAgAA-APAAiIExgIAAADAAgLHAgAAAMACCMgCAAAAwAIIzQIAAPkDwAIiCbwCAAD6AwAwvQIAANIDABC-AgAA-gMAMMACAAD7A8ACIsECAQD8AwAhwgIBAP0DACHDAgEA_QMAIcQCIAD-AwAhxQICAP8DACEExgIAAADAAgLHAgAAAMACCMgCAAAAwAIIzQIAAPkDwAIiC8YCAQAAAAHHAgEAAAAEyAIBAAAABMkCAQAAAAHKAgEAAAABywIBAAAAAcwCAQAAAAHNAgEA9wMAIc4CAQAAAAHPAgEAAAAB0AIBAAAAAQvGAgEAAAABxwIBAAAABcgCAQAAAAXJAgEAAAABygIBAAAAAcsCAQAAAAHMAgEAAAABzQIBAPUDACHOAgEAAAABzwIBAAAAAdACAQAAAAECxgIgAAAAAc0CIADzAwAhCMYCAgAAAAHHAgIAAAAFyAICAAAABckCAgAAAAHKAgIAAAABywICAAAAAcwCAgAAAAHNAgIA7wMAIQLAAgAAAMACAsECAQAAAAEQBgAAggTUAiK8AgAAgQQAML0CAADMAwAQvgIAAIEEADDAAgAA6QPAAiLBAgEA6gMAIcICAQDqAwAhwwIBAOsDACHFAgIAhAQAIdICAQDqAwAh1AIgAOwDACHVAgEA6wMAIdYCAACDBAAg1wIgAOwDACHYAkAAhQQAIdkCQACGBAAhBwUAAPIDACAmAACPBAAgJwAAjwQAIMYCAAAA1AICxwIAAADUAgjIAgAAANQCCM0CAACOBNQCIg8FAADyAwAgJgAAjQQAICcAAI0EACDGAoAAAAAByQKAAAAAAcoCgAAAAAHLAoAAAAABzAKAAAAAAc0CgAAAAAHaAgEAAAAB2wIBAAAAAdwCAQAAAAHdAoAAAAAB3gKAAAAAAd8CgAAAAAENBQAA8gMAICYAAPIDACAnAADyAwAgSAAAjAQAIEkAAPIDACDGAgIAAAABxwICAAAABMgCAgAAAATJAgIAAAABygICAAAAAcsCAgAAAAHMAgIAAAABzQICAIsEACELBQAA7wMAICYAAIoEACAnAACKBAAgxgJAAAAAAccCQAAAAAXIAkAAAAAFyQJAAAAAAcoCQAAAAAHLAkAAAAABzAJAAAAAAc0CQACJBAAhCwUAAPIDACAmAACIBAAgJwAAiAQAIMYCQAAAAAHHAkAAAAAEyAJAAAAABMkCQAAAAAHKAkAAAAABywJAAAAAAcwCQAAAAAHNAkAAhwQAIQsFAADyAwAgJgAAiAQAICcAAIgEACDGAkAAAAABxwJAAAAABMgCQAAAAATJAkAAAAABygJAAAAAAcsCQAAAAAHMAkAAAAABzQJAAIcEACEIxgJAAAAAAccCQAAAAATIAkAAAAAEyQJAAAAAAcoCQAAAAAHLAkAAAAABzAJAAAAAAc0CQACIBAAhCwUAAO8DACAmAACKBAAgJwAAigQAIMYCQAAAAAHHAkAAAAAFyAJAAAAABckCQAAAAAHKAkAAAAABywJAAAAAAcwCQAAAAAHNAkAAiQQAIQjGAkAAAAABxwJAAAAABcgCQAAAAAXJAkAAAAABygJAAAAAAcsCQAAAAAHMAkAAAAABzQJAAIoEACENBQAA8gMAICYAAPIDACAnAADyAwAgSAAAjAQAIEkAAPIDACDGAgIAAAABxwICAAAABMgCAgAAAATJAgIAAAABygICAAAAAcsCAgAAAAHMAgIAAAABzQICAIsEACEIxgIIAAAAAccCCAAAAATIAggAAAAEyQIIAAAAAcoCCAAAAAHLAggAAAABzAIIAAAAAc0CCACMBAAhDMYCgAAAAAHJAoAAAAABygKAAAAAAcsCgAAAAAHMAoAAAAABzQKAAAAAAdoCAQAAAAHbAgEAAAAB3AIBAAAAAd0CgAAAAAHeAoAAAAAB3wKAAAAAAQcFAADyAwAgJgAAjwQAICcAAI8EACDGAgAAANQCAscCAAAA1AIIyAIAAADUAgjNAgAAjgTUAiIExgIAAADUAgLHAgAAANQCCMgCAAAA1AIIzQIAAI8E1AIiEAYAAJEE1AIivAIAAJAEADC9AgAAuQMAEL4CAACQBAAwwAIAAPsDwAIiwQIBAPwDACHCAgEA_AMAIcMCAQD9AwAhxQICAJMEACHSAgEA_AMAIdQCIAD-AwAh1QIBAP0DACHWAgAAkgQAINcCIAD-AwAh2AJAAJQEACHZAkAAlQQAIQTGAgAAANQCAscCAAAA1AIIyAIAAADUAgjNAgAAjwTUAiIMxgKAAAAAAckCgAAAAAHKAoAAAAABywKAAAAAAcwCgAAAAAHNAoAAAAAB2gIBAAAAAdsCAQAAAAHcAgEAAAAB3QKAAAAAAd4CgAAAAAHfAoAAAAABCMYCAgAAAAHHAgIAAAAEyAICAAAABMkCAgAAAAHKAgIAAAABywICAAAAAcwCAgAAAAHNAgIA8gMAIQjGAkAAAAABxwJAAAAABcgCQAAAAAXJAkAAAAABygJAAAAAAcsCQAAAAAHMAkAAAAABzQJAAIoEACEIxgJAAAAAAccCQAAAAATIAkAAAAAEyQJAAAAAAcoCQAAAAAHLAkAAAAABzAJAAAAAAc0CQACIBAAhAsACAAAAwAICwQIBAAAAAQe8AgAAlwQAML0CAACzAwAQvgIAAJcEADDgAgEA6gMAIeECAgCEBAAh4gJAAIUEACHjAkAAhQQAIQe8AgAAmAQAML0CAACgAwAQvgIAAJgEADDgAgEA_AMAIeECAgCTBAAh4gJAAJQEACHjAkAAlAQAIQu8AgAAmQQAML0CAACaAwAQvgIAAJkEADDSAgEA6gMAIdkCQACGBAAh4AIBAOoDACHkAgEA6gMAIeUCAQDqAwAh5wIAAJoE5wIi6AIgAOwDACHpAkAAhQQAIQcFAADyAwAgJgAAnAQAICcAAJwEACDGAgAAAOcCAscCAAAA5wIIyAIAAADnAgjNAgAAmwTnAiIHBQAA8gMAICYAAJwEACAnAACcBAAgxgIAAADnAgLHAgAAAOcCCMgCAAAA5wIIzQIAAJsE5wIiBMYCAAAA5wICxwIAAADnAgjIAgAAAOcCCM0CAACcBOcCIgu8AgAAnQQAML0CAACHAwAQvgIAAJ0EADDSAgEA_AMAIdkCQACVBAAh4AIBAPwDACHkAgEA_AMAIeUCAQD8AwAh5wIAAJ4E5wIi6AIgAP4DACHpAkAAlAQAIQTGAgAAAOcCAscCAAAA5wIIyAIAAADnAgjNAgAAnATnAiIQvAIAAJ8EADC9AgAAgQMAEL4CAACfBAAw0gIBAOoDACHZAkAAhgQAIeoCAQDqAwAh6wIQAKAEACHtAgAAoQTtAiLuAgEA6wMAIe8CAQDrAwAh8AIBAOsDACHxAkAAhgQAIfICIADsAwAh8wIBAOsDACH0AkAAhQQAIfUCQACGBAAhDQUAAPIDACAmAAClBAAgJwAApQQAIEgAAKUEACBJAAClBAAgxgIQAAAAAccCEAAAAATIAhAAAAAEyQIQAAAAAcoCEAAAAAHLAhAAAAABzAIQAAAAAc0CEACkBAAhBwUAAPIDACAmAACjBAAgJwAAowQAIMYCAAAA7QICxwIAAADtAgjIAgAAAO0CCM0CAACiBO0CIgcFAADyAwAgJgAAowQAICcAAKMEACDGAgAAAO0CAscCAAAA7QIIyAIAAADtAgjNAgAAogTtAiIExgIAAADtAgLHAgAAAO0CCMgCAAAA7QIIzQIAAKME7QIiDQUAAPIDACAmAAClBAAgJwAApQQAIEgAAKUEACBJAAClBAAgxgIQAAAAAccCEAAAAATIAhAAAAAEyQIQAAAAAcoCEAAAAAHLAhAAAAABzAIQAAAAAc0CEACkBAAhCMYCEAAAAAHHAhAAAAAEyAIQAAAABMkCEAAAAAHKAhAAAAABywIQAAAAAcwCEAAAAAHNAhAApQQAIRK8AgAApgQAML0CAADrAgAQvgIAAKYEADDSAgEA6gMAIdkCQACGBAAh7QIAAKcE_AIi9QJAAIYEACH2AgEA6gMAIfcCAQDqAwAh-AIBAOoDACH5AkAAhgQAIfoCQACGBAAh_AJAAIUEACH9AgEA6wMAIf4CAQDrAwAh_wIBAOsDACGAAxAAqAQAIYEDAQDrAwAhBwUAAPIDACAmAACsBAAgJwAArAQAIMYCAAAA_AICxwIAAAD8AgjIAgAAAPwCCM0CAACrBPwCIg0FAADvAwAgJgAAqgQAICcAAKoEACBIAACqBAAgSQAAqgQAIMYCEAAAAAHHAhAAAAAFyAIQAAAABckCEAAAAAHKAhAAAAABywIQAAAAAcwCEAAAAAHNAhAAqQQAIQ0FAADvAwAgJgAAqgQAICcAAKoEACBIAACqBAAgSQAAqgQAIMYCEAAAAAHHAhAAAAAFyAIQAAAABckCEAAAAAHKAhAAAAABywIQAAAAAcwCEAAAAAHNAhAAqQQAIQjGAhAAAAABxwIQAAAABcgCEAAAAAXJAhAAAAABygIQAAAAAcsCEAAAAAHMAhAAAAABzQIQAKoEACEHBQAA8gMAICYAAKwEACAnAACsBAAgxgIAAAD8AgLHAgAAAPwCCMgCAAAA_AIIzQIAAKsE_AIiBMYCAAAA_AICxwIAAAD8AgjIAgAAAPwCCM0CAACsBPwCIgm8AgAArQQAML0CAADTAgAQvgIAAK0EADDSAgEA6gMAIdkCQACGBAAh5AIBAOoDACGBAwEA6wMAIYIDAQDqAwAhgwMBAOsDACEKDwAArwQAILwCAACuBAAwvQIAAMACABC-AgAArgQAMNICAQD8AwAh2QJAAJUEACHkAgEA_AMAIYEDAQD9AwAhggMBAPwDACGDAwEA_QMAIQOEAwAAGgAghQMAABoAIIYDAAAaACAIvAIAALAEADC9AgAAugIAEL4CAACwBAAw0gIBAOoDACH3AgEA6wMAIfkCQACGBAAh-gJAAIYEACGHAwEA6wMAIQi8AgAAsQQAML0CAACiAgAQvgIAALEEADDSAgEA6gMAIfcCAQDqAwAhiAMCAIQEACGJAwIAhAQAIYoDAgCEBAAhFbwCAACyBAAwvQIAAIwCABC-AgAAsgQAMMUCAgCEBAAh0gIBAOoDACHYAkAAhQQAIdkCQACGBAAh5AIBAOoDACHoAiAA7AMAIfUCQACGBAAhiwMBAOoDACGMAwEA6wMAIY0DAgCEBAAhjgMCAIQEACGPAwIAhAQAIZADAgCEBAAhkQMCAIQEACGSAxAAqAQAIZMDAQDqAwAhlAMgAOwDACGVAwAAgwQAIBgNAAC1BAAgDgAAtgQAIA8AAK8EACC8AgAAswQAML0CAAAkABC-AgAAswQAMMUCAgCTBAAh0gIBAPwDACHYAkAAlAQAIdkCQACVBAAh5AIBAPwDACHoAiAA_gMAIfUCQACVBAAhiwMBAPwDACGMAwEA_QMAIY0DAgCTBAAhjgMCAJMEACGPAwIAkwQAIZADAgCTBAAhkQMCAJMEACGSAxAAtAQAIZMDAQD8AwAhlAMgAP4DACGVAwAAkgQAIAjGAhAAAAABxwIQAAAABcgCEAAAAAXJAhAAAAABygIQAAAAAcsCEAAAAAHMAhAAAAABzQIQAKoEACEDhAMAABwAIIUDAAAcACCGAwAAHAAgA4QDAAAgACCFAwAAIAAghgMAACAAIAsGAAC4BJcDIrwCAAC3BAAwvQIAAPQBABC-AgAAtwQAMNICAQDqAwAh2QJAAIYEACHqAgEA6wMAIf8CAQDqAwAhhwMBAOsDACGXAwIAhAQAIZgDAgCEBAAhBwUAAPIDACAmAAC6BAAgJwAAugQAIMYCAAAAlwMCxwIAAACXAwjIAgAAAJcDCM0CAAC5BJcDIgcFAADyAwAgJgAAugQAICcAALoEACDGAgAAAJcDAscCAAAAlwMIyAIAAACXAwjNAgAAuQSXAyIExgIAAACXAwLHAgAAAJcDCMgCAAAAlwMIzQIAALoElwMiCrwCAAC7BAAwvQIAANwBABC-AgAAuwQAMNICAQDqAwAh_wIBAOoDACGBAwEA6wMAIZkDAQDqAwAhmgMCAO0DACGbAwIA7QMAIZwDAQDrAwAhB7wCAAC8BAAwvQIAAMYBABC-AgAAvAQAMNICAQDqAwAh5AIBAOoDACHoAiAA7AMAIZ0DAQDqAwAhBrwCAAC9BAAwvQIAALABABC-AgAAvQQAMNICAQDqAwAh5AIBAOoDACHoAiAA7AMAIQcJAAC_BAAgvAIAAL4EADC9AgAAnQEAEL4CAAC-BAAw0gIBAPwDACHkAgEA_AMAIegCIAD-AwAhA4QDAAAPACCFAwAADwAghgMAAA8AIBe8AgAAwAQAML0CAACXAQAQvgIAAMAEADDSAgEA6gMAIdkCQACGBAAh6AIgAOwDACH1AkAAhgQAIfYCAQDqAwAhjAMBAOoDACGVAwAAgwQAIJcDAgCEBAAhnQMBAOoDACGeAwEA6wMAIZ8DAQDqAwAhoAMBAOoDACGiAwAAwQSiAyKjAwIA7QMAIaQDAgDtAwAhpQMQAKgEACGmAwIAhAQAIacDAQDrAwAhqAMQAKgEACGpAxAAqAQAIQcFAADyAwAgJgAAwwQAICcAAMMEACDGAgAAAKIDAscCAAAAogMIyAIAAACiAwjNAgAAwgSiAyIHBQAA8gMAICYAAMMEACAnAADDBAAgxgIAAACiAwLHAgAAAKIDCMgCAAAAogMIzQIAAMIEogMiBMYCAAAAogMCxwIAAACiAwjIAgAAAKIDCM0CAADDBKIDIgi8AgAAxAQAML0CAACBAQAQvgIAAMQEADDFAgIAhAQAIdICAQDqAwAh5AIBAOoDACHoAiAA7AMAIaoDIADsAwAhCQQAAMYEACC8AgAAxQQAML0CAABuABC-AgAAxQQAMMUCAgCTBAAh0gIBAPwDACHkAgEA_AMAIegCIAD-AwAhqgMgAP4DACEDhAMAAAMAIIUDAAADACCGAwAAAwAgB7wCAADHBAAwvQIAAGgAEL4CAADHBAAw0gIBAOoDACHkAgEA6gMAIegCIADsAwAhjAMBAOsDACEIBAAAxgQAILwCAADIBAAwvQIAAFUAEL4CAADIBAAw0gIBAPwDACHkAgEA_AMAIegCIAD-AwAhjAMBAP0DACEGvAIAAMkEADC9AgAATwAQvgIAAMkEADDSAgEA6gMAIeQCAQDqAwAh6AIgAOwDACEHBAAAxgQAILwCAADKBAAwvQIAADwAEL4CAADKBAAw0gIBAPwDACHkAgEA_AMAIegCIAD-AwAhERIAAM4EACC8AgAAywQAML0CAAAwABC-AgAAywQAMNICAQD8AwAh2QJAAJUEACHqAgEA_AMAIesCEADMBAAh7QIAAM0E7QIi7gIBAP0DACHvAgEA_QMAIfACAQD9AwAh8QJAAJUEACHyAiAA_gMAIfMCAQD9AwAh9AJAAJQEACH1AkAAlQQAIQjGAhAAAAABxwIQAAAABMgCEAAAAATJAhAAAAABygIQAAAAAcsCEAAAAAHMAhAAAAABzQIQAKUEACEExgIAAADtAgLHAgAAAO0CCMgCAAAA7QIIzQIAAKME7QIiGQgAANMEACAMAADRBAAgEAAA0gQAIBEAANQEACATAADVBAAgvAIAAM8EADC9AgAAGgAQvgIAAM8EADDSAgEA_AMAIdkCQACVBAAh7QIAANAE_AIi9QJAAJUEACH2AgEA_AMAIfcCAQD8AwAh-AIBAPwDACH5AkAAlQQAIfoCQACVBAAh_AJAAJQEACH9AgEA_QMAIf4CAQD9AwAh_wIBAP0DACGAAxAAtAQAIYEDAQD9AwAhrAMAABoAIK0DAAAaACAXCAAA0wQAIAwAANEEACAQAADSBAAgEQAA1AQAIBMAANUEACC8AgAAzwQAML0CAAAaABC-AgAAzwQAMNICAQD8AwAh2QJAAJUEACHtAgAA0AT8AiL1AkAAlQQAIfYCAQD8AwAh9wIBAPwDACH4AgEA_AMAIfkCQACVBAAh-gJAAJUEACH8AkAAlAQAIf0CAQD9AwAh_gIBAP0DACH_AgEA_QMAIYADEAC0BAAhgQMBAP0DACEExgIAAAD8AgLHAgAAAPwCCMgCAAAA_AIIzQIAAKwE_AIiGg0AALUEACAOAAC2BAAgDwAArwQAILwCAACzBAAwvQIAACQAEL4CAACzBAAwxQICAJMEACHSAgEA_AMAIdgCQACUBAAh2QJAAJUEACHkAgEA_AMAIegCIAD-AwAh9QJAAJUEACGLAwEA_AMAIYwDAQD9AwAhjQMCAJMEACGOAwIAkwQAIY8DAgCTBAAhkAMCAJMEACGRAwIAkwQAIZIDEAC0BAAhkwMBAPwDACGUAyAA_gMAIZUDAACSBAAgrAMAACQAIK0DAAAkACAMDwAArwQAILwCAACuBAAwvQIAAMACABC-AgAArgQAMNICAQD8AwAh2QJAAJUEACHkAgEA_AMAIYEDAQD9AwAhggMBAPwDACGDAwEA_QMAIawDAADAAgAgrQMAAMACACAfAwAA5QQAIAYAAOYEACAHAADnBAAgCgAA4AQAIA8AAK8EACARAADUBAAgvAIAAOMEADC9AgAAAwAQvgIAAOMEADDSAgEA_AMAIdkCQACVBAAh6AIgAP4DACH1AkAAlQQAIfYCAQD8AwAhjAMBAPwDACGVAwAAkgQAIJcDAgCTBAAhnQMBAPwDACGeAwEA_QMAIZ8DAQD8AwAhoAMBAPwDACGiAwAA5ASiAyKjAwIA_wMAIaQDAgD_AwAhpQMQALQEACGmAwIAkwQAIacDAQD9AwAhqAMQALQEACGpAxAAtAQAIawDAAADACCtAwAAAwAgA4QDAAAWACCFAwAAFgAghgMAABYAIAOEAwAAMAAghQMAADAAIIYDAAAwACAJDAAA1wQAILwCAADWBAAwvQIAACAAEL4CAADWBAAw0gIBAPwDACH3AgEA_QMAIfkCQACVBAAh-gJAAJUEACGHAwEA_QMAIRoNAAC1BAAgDgAAtgQAIA8AAK8EACC8AgAAswQAML0CAAAkABC-AgAAswQAMMUCAgCTBAAh0gIBAPwDACHYAkAAlAQAIdkCQACVBAAh5AIBAPwDACHoAiAA_gMAIfUCQACVBAAhiwMBAPwDACGMAwEA_QMAIY0DAgCTBAAhjgMCAJMEACGPAwIAkwQAIZADAgCTBAAhkQMCAJMEACGSAxAAtAQAIZMDAQD8AwAhlAMgAP4DACGVAwAAkgQAIKwDAAAkACCtAwAAJAAgCQwAANEEACC8AgAA2AQAML0CAAAcABC-AgAA2AQAMNICAQD8AwAh9wIBAPwDACGIAwIAkwQAIYkDAgCTBAAhigMCAJMEACENBgAA2gSXAyIIAADbBAAgEgAA3AQAILwCAADZBAAwvQIAABYAEL4CAADZBAAw0gIBAPwDACHZAkAAlQQAIeoCAQD9AwAh_wIBAPwDACGHAwEA_QMAIZcDAgCTBAAhmAMCAJMEACEExgIAAACXAwLHAgAAAJcDCMgCAAAAlwMIzQIAALoElwMiHwMAAOUEACAGAADmBAAgBwAA5wQAIAoAAOAEACAPAACvBAAgEQAA1AQAILwCAADjBAAwvQIAAAMAEL4CAADjBAAw0gIBAPwDACHZAkAAlQQAIegCIAD-AwAh9QJAAJUEACH2AgEA_AMAIYwDAQD8AwAhlQMAAJIEACCXAwIAkwQAIZ0DAQD8AwAhngMBAP0DACGfAwEA_AMAIaADAQD8AwAhogMAAOQEogMiowMCAP8DACGkAwIA_wMAIaUDEAC0BAAhpgMCAJMEACGnAwEA_QMAIagDEAC0BAAhqQMQALQEACGsAwAAAwAgrQMAAAMAIBkIAADTBAAgDAAA0QQAIBAAANIEACARAADUBAAgEwAA1QQAILwCAADPBAAwvQIAABoAEL4CAADPBAAw0gIBAPwDACHZAkAAlQQAIe0CAADQBPwCIvUCQACVBAAh9gIBAPwDACH3AgEA_AMAIfgCAQD8AwAh-QJAAJUEACH6AkAAlQQAIfwCQACUBAAh_QIBAP0DACH-AgEA_QMAIf8CAQD9AwAhgAMQALQEACGBAwEA_QMAIawDAAAaACCtAwAAGgAgAuQCAQAAAAGdAwEAAAABCQMAAN8EACAKAADgBAAgvAIAAN4EADC9AgAADwAQvgIAAN4EADDSAgEA_AMAIeQCAQD8AwAh6AIgAP4DACGdAwEA_AMAIQkJAAC_BAAgvAIAAL4EADC9AgAAnQEAEL4CAAC-BAAw0gIBAPwDACHkAgEA_AMAIegCIAD-AwAhrAMAAJ0BACCtAwAAnQEAIAOEAwAACwAghQMAAAsAIIYDAAALACAMCAAA2wQAIAsAAOIEACC8AgAA4QQAML0CAAALABC-AgAA4QQAMNICAQD8AwAh_wIBAPwDACGBAwEA_QMAIZkDAQD8AwAhmgMCAP8DACGbAwIA_wMAIZwDAQD9AwAhCwMAAN8EACAKAADgBAAgvAIAAN4EADC9AgAADwAQvgIAAN4EADDSAgEA_AMAIeQCAQD8AwAh6AIgAP4DACGdAwEA_AMAIawDAAAPACCtAwAADwAgHQMAAOUEACAGAADmBAAgBwAA5wQAIAoAAOAEACAPAACvBAAgEQAA1AQAILwCAADjBAAwvQIAAAMAEL4CAADjBAAw0gIBAPwDACHZAkAAlQQAIegCIAD-AwAh9QJAAJUEACH2AgEA_AMAIYwDAQD8AwAhlQMAAJIEACCXAwIAkwQAIZ0DAQD8AwAhngMBAP0DACGfAwEA_AMAIaADAQD8AwAhogMAAOQEogMiowMCAP8DACGkAwIA_wMAIaUDEAC0BAAhpgMCAJMEACGnAwEA_QMAIagDEAC0BAAhqQMQALQEACEExgIAAACiAwLHAgAAAKIDCMgCAAAAogMIzQIAAMMEogMiCQQAAMYEACC8AgAAygQAML0CAAA8ABC-AgAAygQAMNICAQD8AwAh5AIBAPwDACHoAiAA_gMAIawDAAA8ACCtAwAAPAAgCgQAAMYEACC8AgAAyAQAML0CAABVABC-AgAAyAQAMNICAQD8AwAh5AIBAPwDACHoAiAA_gMAIYwDAQD9AwAhrAMAAFUAIK0DAABVACALBAAAxgQAILwCAADFBAAwvQIAAG4AEL4CAADFBAAwxQICAJMEACHSAgEA_AMAIeQCAQD8AwAh6AIgAP4DACGqAyAA_gMAIawDAABuACCtAwAAbgAgAAAAAAAAAbEDAAAAwAICAbEDAQAAAAEBsQMBAAAAAQGxAyAAAAABBbEDAgAAAAG3AwIAAAABuAMCAAAAAbkDAgAAAAG6AwIAAAABAAAAAAABsQMAAADUAgIFsQMCAAAAAbcDAgAAAAG4AwIAAAABuQMCAAAAAboDAgAAAAEBsQNAAAAAAQGxA0AAAAABAAAAAAAAAAABsQMAAADnAgIAAAAAAAWxAxAAAAABtwMQAAAAAbgDEAAAAAG5AxAAAAABugMQAAAAAQGxAwAAAO0CAgUgAADzBwAgIQAA9gcAIK4DAAD0BwAgrwMAAPUHACC0AwAAJwAgAyAAAPMHACCuAwAA9AcAILQDAAAnACAAAAAAAAGxAwAAAPwCAgWxAxAAAAABtwMQAAAAAbgDEAAAAAG5AxAAAAABugMQAAAAAQUgAADhBwAgIQAA8QcAIK4DAADiBwAgrwMAAPAHACC0AwAA9wEAIAUgAADfBwAgIQAA7gcAIK4DAADgBwAgrwMAAO0HACC0AwAAvQIAIAcgAADdBwAgIQAA6wcAIK4DAADeBwAgrwMAAOoHACCyAwAAAwAgswMAAAMAILQDAAAFACALIAAApgUAMCEAAKsFADCuAwAApwUAMK8DAACoBQAwsAMAAKkFACCxAwAAqgUAMLIDAACqBQAwswMAAKoFADC0AwAAqgUAMLUDAACsBQAwtgMAAK0FADALIAAAmgUAMCEAAJ8FADCuAwAAmwUAMK8DAACcBQAwsAMAAJ0FACCxAwAAngUAMLIDAACeBQAwswMAAJ4FADC0AwAAngUAMLUDAACgBQAwtgMAAKEFADAM0gIBAAAAAdkCQAAAAAHrAhAAAAAB7QIAAADtAgLuAgEAAAAB7wIBAAAAAfACAQAAAAHxAkAAAAAB8gIgAAAAAfMCAQAAAAH0AkAAAAAB9QJAAAAAAQIAAAAyACAgAAClBQAgAwAAADIAICAAAKUFACAhAACkBQAgARkAAOkHADAREgAAzgQAILwCAADLBAAwvQIAADAAEL4CAADLBAAw0gIBAAAAAdkCQACVBAAh6gIBAPwDACHrAhAAzAQAIe0CAADNBO0CIu4CAQD9AwAh7wIBAP0DACHwAgEAAAAB8QJAAJUEACHyAiAA_gMAIfMCAQD9AwAh9AJAAJQEACH1AkAAlQQAIQIAAAAyACAZAACkBQAgAgAAAKIFACAZAACjBQAgELwCAAChBQAwvQIAAKIFABC-AgAAoQUAMNICAQD8AwAh2QJAAJUEACHqAgEA_AMAIesCEADMBAAh7QIAAM0E7QIi7gIBAP0DACHvAgEA_QMAIfACAQD9AwAh8QJAAJUEACHyAiAA_gMAIfMCAQD9AwAh9AJAAJQEACH1AkAAlQQAIRC8AgAAoQUAML0CAACiBQAQvgIAAKEFADDSAgEA_AMAIdkCQACVBAAh6gIBAPwDACHrAhAAzAQAIe0CAADNBO0CIu4CAQD9AwAh7wIBAP0DACHwAgEA_QMAIfECQACVBAAh8gIgAP4DACHzAgEA_QMAIfQCQACUBAAh9QJAAJUEACEM0gIBAO8EACHZAkAA-wQAIesCEACKBQAh7QIAAIsF7QIi7gIBAPAEACHvAgEA8AQAIfACAQDwBAAh8QJAAPsEACHyAiAA8QQAIfMCAQDwBAAh9AJAAPoEACH1AkAA-wQAIQzSAgEA7wQAIdkCQAD7BAAh6wIQAIoFACHtAgAAiwXtAiLuAgEA8AQAIe8CAQDwBAAh8AIBAPAEACHxAkAA-wQAIfICIADxBAAh8wIBAPAEACH0AkAA-gQAIfUCQAD7BAAhDNICAQAAAAHZAkAAAAAB6wIQAAAAAe0CAAAA7QIC7gIBAAAAAe8CAQAAAAHwAgEAAAAB8QJAAAAAAfICIAAAAAHzAgEAAAAB9AJAAAAAAfUCQAAAAAEIBgAAAJcDAggAALQFACDSAgEAAAAB2QJAAAAAAf8CAQAAAAGHAwEAAAABlwMCAAAAAZgDAgAAAAECAAAAGAAgIAAAswUAIAMAAAAYACAgAACzBQAgIQAAsQUAIAEZAADoBwAwDQYAANoElwMiCAAA2wQAIBIAANwEACC8AgAA2QQAML0CAAAWABC-AgAA2QQAMNICAQAAAAHZAkAAlQQAIeoCAQD9AwAh_wIBAPwDACGHAwEA_QMAIZcDAgCTBAAhmAMCAJMEACECAAAAGAAgGQAAsQUAIAIAAACuBQAgGQAArwUAIAsGAADaBJcDIrwCAACtBQAwvQIAAK4FABC-AgAArQUAMNICAQD8AwAh2QJAAJUEACHqAgEA_QMAIf8CAQD8AwAhhwMBAP0DACGXAwIAkwQAIZgDAgCTBAAhCwYAANoElwMivAIAAK0FADC9AgAArgUAEL4CAACtBQAw0gIBAPwDACHZAkAAlQQAIeoCAQD9AwAh_wIBAPwDACGHAwEA_QMAIZcDAgCTBAAhmAMCAJMEACEHBgAAsAWXAyLSAgEA7wQAIdkCQAD7BAAh_wIBAO8EACGHAwEA8AQAIZcDAgD5BAAhmAMCAPkEACEBsQMAAACXAwIIBgAAsAWXAyIIAACyBQAg0gIBAO8EACHZAkAA-wQAIf8CAQDvBAAhhwMBAPAEACGXAwIA-QQAIZgDAgD5BAAhBSAAAOMHACAhAADmBwAgrgMAAOQHACCvAwAA5QcAILQDAAAFACAIBgAAAJcDAggAALQFACDSAgEAAAAB2QJAAAAAAf8CAQAAAAGHAwEAAAABlwMCAAAAAZgDAgAAAAEDIAAA4wcAIK4DAADkBwAgtAMAAAUAIAMgAADhBwAgrgMAAOIHACC0AwAA9wEAIAMgAADfBwAgrgMAAOAHACC0AwAAvQIAIAMgAADdBwAgrgMAAN4HACC0AwAABQAgBCAAAKYFADCuAwAApwUAMLADAACpBQAgtAMAAKoFADAEIAAAmgUAMK4DAACbBQAwsAMAAJ0FACC0AwAAngUAMAAAAAsgAAC-BQAwIQAAwwUAMK4DAAC_BQAwrwMAAMAFADCwAwAAwQUAILEDAADCBQAwsgMAAMIFADCzAwAAwgUAMLQDAADCBQAwtQMAAMQFADC2AwAAxQUAMBIIAAC3BQAgDAAAtQUAIBEAALgFACATAAC5BQAg0gIBAAAAAdkCQAAAAAHtAgAAAPwCAvUCQAAAAAH2AgEAAAAB9wIBAAAAAfkCQAAAAAH6AkAAAAAB_AJAAAAAAf0CAQAAAAH-AgEAAAAB_wIBAAAAAYADEAAAAAGBAwEAAAABAgAAACcAICAAAMkFACADAAAAJwAgIAAAyQUAICEAAMgFACABGQAA3AcAMBcIAADTBAAgDAAA0QQAIBAAANIEACARAADUBAAgEwAA1QQAILwCAADPBAAwvQIAABoAEL4CAADPBAAw0gIBAAAAAdkCQACVBAAh7QIAANAE_AIi9QJAAJUEACH2AgEAAAAB9wIBAPwDACH4AgEA_AMAIfkCQACVBAAh-gJAAJUEACH8AkAAlAQAIf0CAQD9AwAh_gIBAP0DACH_AgEA_QMAIYADEAC0BAAhgQMBAP0DACECAAAAJwAgGQAAyAUAIAIAAADGBQAgGQAAxwUAIBK8AgAAxQUAML0CAADGBQAQvgIAAMUFADDSAgEA_AMAIdkCQACVBAAh7QIAANAE_AIi9QJAAJUEACH2AgEA_AMAIfcCAQD8AwAh-AIBAPwDACH5AkAAlQQAIfoCQACVBAAh_AJAAJQEACH9AgEA_QMAIf4CAQD9AwAh_wIBAP0DACGAAxAAtAQAIYEDAQD9AwAhErwCAADFBQAwvQIAAMYFABC-AgAAxQUAMNICAQD8AwAh2QJAAJUEACHtAgAA0AT8AiL1AkAAlQQAIfYCAQD8AwAh9wIBAPwDACH4AgEA_AMAIfkCQACVBAAh-gJAAJUEACH8AkAAlAQAIf0CAQD9AwAh_gIBAP0DACH_AgEA_QMAIYADEAC0BAAhgQMBAP0DACEO0gIBAO8EACHZAkAA-wQAIe0CAACTBfwCIvUCQAD7BAAh9gIBAO8EACH3AgEA7wQAIfkCQAD7BAAh-gJAAPsEACH8AkAA-gQAIf0CAQDwBAAh_gIBAPAEACH_AgEA8AQAIYADEACUBQAhgQMBAPAEACESCAAAlwUAIAwAAJUFACARAACYBQAgEwAAmQUAINICAQDvBAAh2QJAAPsEACHtAgAAkwX8AiL1AkAA-wQAIfYCAQDvBAAh9wIBAO8EACH5AkAA-wQAIfoCQAD7BAAh_AJAAPoEACH9AgEA8AQAIf4CAQDwBAAh_wIBAPAEACGAAxAAlAUAIYEDAQDwBAAhEggAALcFACAMAAC1BQAgEQAAuAUAIBMAALkFACDSAgEAAAAB2QJAAAAAAe0CAAAA_AIC9QJAAAAAAfYCAQAAAAH3AgEAAAAB-QJAAAAAAfoCQAAAAAH8AkAAAAAB_QIBAAAAAf4CAQAAAAH_AgEAAAABgAMQAAAAAYEDAQAAAAEEIAAAvgUAMK4DAAC_BQAwsAMAAMEFACC0AwAAwgUAMAAAAAAHIAAA1wcAICEAANoHACCuAwAA2AcAIK8DAADZBwAgsgMAACQAILMDAAAkACC0AwAA9wEAIAMgAADXBwAgrgMAANgHACC0AwAA9wEAIAAAAAAABSAAANIHACAhAADVBwAgrgMAANMHACCvAwAA1AcAILQDAAD3AQAgAyAAANIHACCuAwAA0wcAILQDAAD3AQAgAAAAAAALIAAA9QUAMCEAAPoFADCuAwAA9gUAMK8DAAD3BQAwsAMAAPgFACCxAwAA-QUAMLIDAAD5BQAwswMAAPkFADC0AwAA-QUAMLUDAAD7BQAwtgMAAPwFADALIAAA6QUAMCEAAO4FADCuAwAA6gUAMK8DAADrBQAwsAMAAOwFACCxAwAA7QUAMLIDAADtBQAwswMAAO0FADC0AwAA7QUAMLUDAADvBQAwtgMAAPAFADALIAAA4AUAMCEAAOQFADCuAwAA4QUAMK8DAADiBQAwsAMAAOMFACCxAwAAwgUAMLIDAADCBQAwswMAAMIFADC0AwAAwgUAMLUDAADlBQAwtgMAAMUFADASCAAAtwUAIBAAALYFACARAAC4BQAgEwAAuQUAINICAQAAAAHZAkAAAAAB7QIAAAD8AgL1AkAAAAAB9gIBAAAAAfgCAQAAAAH5AkAAAAAB-gJAAAAAAfwCQAAAAAH9AgEAAAAB_gIBAAAAAf8CAQAAAAGAAxAAAAABgQMBAAAAAQIAAAAnACAgAADoBQAgAwAAACcAICAAAOgFACAhAADnBQAgARkAANEHADACAAAAJwAgGQAA5wUAIAIAAADGBQAgGQAA5gUAIA7SAgEA7wQAIdkCQAD7BAAh7QIAAJMF_AIi9QJAAPsEACH2AgEA7wQAIfgCAQDvBAAh-QJAAPsEACH6AkAA-wQAIfwCQAD6BAAh_QIBAPAEACH-AgEA8AQAIf8CAQDwBAAhgAMQAJQFACGBAwEA8AQAIRIIAACXBQAgEAAAlgUAIBEAAJgFACATAACZBQAg0gIBAO8EACHZAkAA-wQAIe0CAACTBfwCIvUCQAD7BAAh9gIBAO8EACH4AgEA7wQAIfkCQAD7BAAh-gJAAPsEACH8AkAA-gQAIf0CAQDwBAAh_gIBAPAEACH_AgEA8AQAIYADEACUBQAhgQMBAPAEACESCAAAtwUAIBAAALYFACARAAC4BQAgEwAAuQUAINICAQAAAAHZAkAAAAAB7QIAAAD8AgL1AkAAAAAB9gIBAAAAAfgCAQAAAAH5AkAAAAAB-gJAAAAAAfwCQAAAAAH9AgEAAAAB_gIBAAAAAf8CAQAAAAGAAxAAAAABgQMBAAAAAQTSAgEAAAAB-QJAAAAAAfoCQAAAAAGHAwEAAAABAgAAACIAICAAAPQFACADAAAAIgAgIAAA9AUAICEAAPMFACABGQAA0AcAMAkMAADXBAAgvAIAANYEADC9AgAAIAAQvgIAANYEADDSAgEAAAAB9wIBAP0DACH5AkAAlQQAIfoCQACVBAAhhwMBAP0DACECAAAAIgAgGQAA8wUAIAIAAADxBQAgGQAA8gUAIAi8AgAA8AUAML0CAADxBQAQvgIAAPAFADDSAgEA_AMAIfcCAQD9AwAh-QJAAJUEACH6AkAAlQQAIYcDAQD9AwAhCLwCAADwBQAwvQIAAPEFABC-AgAA8AUAMNICAQD8AwAh9wIBAP0DACH5AkAAlQQAIfoCQACVBAAhhwMBAP0DACEE0gIBAO8EACH5AkAA-wQAIfoCQAD7BAAhhwMBAPAEACEE0gIBAO8EACH5AkAA-wQAIfoCQAD7BAAhhwMBAPAEACEE0gIBAAAAAfkCQAAAAAH6AkAAAAABhwMBAAAAAQTSAgEAAAABiAMCAAAAAYkDAgAAAAGKAwIAAAABAgAAAB4AICAAAIAGACADAAAAHgAgIAAAgAYAICEAAP8FACABGQAAzwcAMAkMAADRBAAgvAIAANgEADC9AgAAHAAQvgIAANgEADDSAgEAAAAB9wIBAPwDACGIAwIAkwQAIYkDAgCTBAAhigMCAJMEACECAAAAHgAgGQAA_wUAIAIAAAD9BQAgGQAA_gUAIAi8AgAA_AUAML0CAAD9BQAQvgIAAPwFADDSAgEA_AMAIfcCAQD8AwAhiAMCAJMEACGJAwIAkwQAIYoDAgCTBAAhCLwCAAD8BQAwvQIAAP0FABC-AgAA_AUAMNICAQD8AwAh9wIBAPwDACGIAwIAkwQAIYkDAgCTBAAhigMCAJMEACEE0gIBAO8EACGIAwIA-QQAIYkDAgD5BAAhigMCAPkEACEE0gIBAO8EACGIAwIA-QQAIYkDAgD5BAAhigMCAPkEACEE0gIBAAAAAYgDAgAAAAGJAwIAAAABigMCAAAAAQQgAAD1BQAwrgMAAPYFADCwAwAA-AUAILQDAAD5BQAwBCAAAOkFADCuAwAA6gUAMLADAADsBQAgtAMAAO0FADAEIAAA4AUAMK4DAADhBQAwsAMAAOMFACC0AwAAwgUAMAAAAAAAAAAHIAAAygcAICEAAM0HACCuAwAAywcAIK8DAADMBwAgsgMAABoAILMDAAAaACC0AwAAJwAgAyAAAMoHACCuAwAAywcAILQDAAAnACAAAAAAAAUgAADCBwAgIQAAyAcAIK4DAADDBwAgrwMAAMcHACC0AwAABQAgBSAAAMAHACAhAADFBwAgrgMAAMEHACCvAwAAxAcAILQDAAARACADIAAAwgcAIK4DAADDBwAgtAMAAAUAIAMgAADABwAgrgMAAMEHACC0AwAAEQAgAAAABSAAALoHACAhAAC-BwAgrgMAALsHACCvAwAAvQcAILQDAACaAQAgCyAAAJsGADAhAACgBgAwrgMAAJwGADCvAwAAnQYAMLADAACeBgAgsQMAAJ8GADCyAwAAnwYAMLMDAACfBgAwtAMAAJ8GADC1AwAAoQYAMLYDAACiBgAwBwgAAJQGACDSAgEAAAAB_wIBAAAAAYEDAQAAAAGaAwIAAAABmwMCAAAAAZwDAQAAAAECAAAADQAgIAAApgYAIAMAAAANACAgAACmBgAgIQAApQYAIAEZAAC8BwAwDAgAANsEACALAADiBAAgvAIAAOEEADC9AgAACwAQvgIAAOEEADDSAgEAAAAB_wIBAPwDACGBAwEA_QMAIZkDAQD8AwAhmgMCAP8DACGbAwIA_wMAIZwDAQD9AwAhAgAAAA0AIBkAAKUGACACAAAAowYAIBkAAKQGACAKvAIAAKIGADC9AgAAowYAEL4CAACiBgAw0gIBAPwDACH_AgEA_AMAIYEDAQD9AwAhmQMBAPwDACGaAwIA_wMAIZsDAgD_AwAhnAMBAP0DACEKvAIAAKIGADC9AgAAowYAEL4CAACiBgAw0gIBAPwDACH_AgEA_AMAIYEDAQD9AwAhmQMBAPwDACGaAwIA_wMAIZsDAgD_AwAhnAMBAP0DACEG0gIBAO8EACH_AgEA7wQAIYEDAQDwBAAhmgMCAPIEACGbAwIA8gQAIZwDAQDwBAAhBwgAAJIGACDSAgEA7wQAIf8CAQDvBAAhgQMBAPAEACGaAwIA8gQAIZsDAgDyBAAhnAMBAPAEACEHCAAAlAYAINICAQAAAAH_AgEAAAABgQMBAAAAAZoDAgAAAAGbAwIAAAABnAMBAAAAAQMgAAC6BwAgrgMAALsHACC0AwAAmgEAIAQgAACbBgAwrgMAAJwGADCwAwAAngYAILQDAACfBgAwAAAACyAAAK0GADAhAACyBgAwrgMAAK4GADCvAwAArwYAMLADAACwBgAgsQMAALEGADCyAwAAsQYAMLMDAACxBgAwtAMAALEGADC1AwAAswYAMLYDAAC0BgAwBAoAAKgGACDSAgEAAAAB5AIBAAAAAegCIAAAAAECAAAAEQAgIAAAuAYAIAMAAAARACAgAAC4BgAgIQAAtwYAIAEZAAC5BwAwCgMAAN8EACAKAADgBAAgvAIAAN4EADC9AgAADwAQvgIAAN4EADDSAgEAAAAB5AIBAPwDACHoAiAA_gMAIZ0DAQD8AwAhqwMAAN0EACACAAAAEQAgGQAAtwYAIAIAAAC1BgAgGQAAtgYAIAe8AgAAtAYAML0CAAC1BgAQvgIAALQGADDSAgEA_AMAIeQCAQD8AwAh6AIgAP4DACGdAwEA_AMAIQe8AgAAtAYAML0CAAC1BgAQvgIAALQGADDSAgEA_AMAIeQCAQD8AwAh6AIgAP4DACGdAwEA_AMAIQPSAgEA7wQAIeQCAQDvBAAh6AIgAPEEACEECgAAmgYAINICAQDvBAAh5AIBAO8EACHoAiAA8QQAIQQKAACoBgAg0gIBAAAAAeQCAQAAAAHoAiAAAAABBCAAAK0GADCuAwAArgYAMLADAACwBgAgtAMAALEGADAAAAAAAAABsQMAAACiAwIFIAAAqwcAICEAALcHACCuAwAArAcAIK8DAAC2BwAgtAMAAAEAIAUgAACpBwAgIQAAtAcAIK4DAACqBwAgrwMAALMHACC0AwAAUgAgBSAAAKcHACAhAACxBwAgrgMAAKgHACCvAwAAsAcAILQDAABrACALIAAA2QYAMCEAAN0GADCuAwAA2gYAMK8DAADbBgAwsAMAANwGACCxAwAAnwYAMLIDAACfBgAwswMAAJ8GADC0AwAAnwYAMLUDAADeBgAwtgMAAKIGADALIAAA0AYAMCEAANQGADCuAwAA0QYAMK8DAADSBgAwsAMAANMGACCxAwAAqgUAMLIDAACqBQAwswMAAKoFADC0AwAAqgUAMLUDAADVBgAwtgMAAK0FADALIAAAxwYAMCEAAMsGADCuAwAAyAYAMK8DAADJBgAwsAMAAMoGACCxAwAAwgUAMLIDAADCBQAwswMAAMIFADC0AwAAwgUAMLUDAADMBgAwtgMAAMUFADASDAAAtQUAIBAAALYFACARAAC4BQAgEwAAuQUAINICAQAAAAHZAkAAAAAB7QIAAAD8AgL1AkAAAAAB9gIBAAAAAfcCAQAAAAH4AgEAAAAB-QJAAAAAAfoCQAAAAAH8AkAAAAAB_QIBAAAAAf4CAQAAAAGAAxAAAAABgQMBAAAAAQIAAAAnACAgAADPBgAgAwAAACcAICAAAM8GACAhAADOBgAgARkAAK8HADACAAAAJwAgGQAAzgYAIAIAAADGBQAgGQAAzQYAIA7SAgEA7wQAIdkCQAD7BAAh7QIAAJMF_AIi9QJAAPsEACH2AgEA7wQAIfcCAQDvBAAh-AIBAO8EACH5AkAA-wQAIfoCQAD7BAAh_AJAAPoEACH9AgEA8AQAIf4CAQDwBAAhgAMQAJQFACGBAwEA8AQAIRIMAACVBQAgEAAAlgUAIBEAAJgFACATAACZBQAg0gIBAO8EACHZAkAA-wQAIe0CAACTBfwCIvUCQAD7BAAh9gIBAO8EACH3AgEA7wQAIfgCAQDvBAAh-QJAAPsEACH6AkAA-wQAIfwCQAD6BAAh_QIBAPAEACH-AgEA8AQAIYADEACUBQAhgQMBAPAEACESDAAAtQUAIBAAALYFACARAAC4BQAgEwAAuQUAINICAQAAAAHZAkAAAAAB7QIAAAD8AgL1AkAAAAAB9gIBAAAAAfcCAQAAAAH4AgEAAAAB-QJAAAAAAfoCQAAAAAH8AkAAAAAB_QIBAAAAAf4CAQAAAAGAAxAAAAABgQMBAAAAAQgGAAAAlwMCEgAAjAYAINICAQAAAAHZAkAAAAAB6gIBAAAAAYcDAQAAAAGXAwIAAAABmAMCAAAAAQIAAAAYACAgAADYBgAgAwAAABgAICAAANgGACAhAADXBgAgARkAAK4HADACAAAAGAAgGQAA1wYAIAIAAACuBQAgGQAA1gYAIAcGAACwBZcDItICAQDvBAAh2QJAAPsEACHqAgEA8AQAIYcDAQDwBAAhlwMCAPkEACGYAwIA-QQAIQgGAACwBZcDIhIAAIsGACDSAgEA7wQAIdkCQAD7BAAh6gIBAPAEACGHAwEA8AQAIZcDAgD5BAAhmAMCAPkEACEIBgAAAJcDAhIAAIwGACDSAgEAAAAB2QJAAAAAAeoCAQAAAAGHAwEAAAABlwMCAAAAAZgDAgAAAAEHCwAAlQYAINICAQAAAAGBAwEAAAABmQMBAAAAAZoDAgAAAAGbAwIAAAABnAMBAAAAAQIAAAANACAgAADhBgAgAwAAAA0AICAAAOEGACAhAADgBgAgARkAAK0HADACAAAADQAgGQAA4AYAIAIAAACjBgAgGQAA3wYAIAbSAgEA7wQAIYEDAQDwBAAhmQMBAO8EACGaAwIA8gQAIZsDAgDyBAAhnAMBAPAEACEHCwAAkwYAINICAQDvBAAhgQMBAPAEACGZAwEA7wQAIZoDAgDyBAAhmwMCAPIEACGcAwEA8AQAIQcLAACVBgAg0gIBAAAAAYEDAQAAAAGZAwEAAAABmgMCAAAAAZsDAgAAAAGcAwEAAAABAyAAAKsHACCuAwAArAcAILQDAAABACADIAAAqQcAIK4DAACqBwAgtAMAAFIAIAMgAACnBwAgrgMAAKgHACC0AwAAawAgBCAAANkGADCuAwAA2gYAMLADAADcBgAgtAMAAJ8GADAEIAAA0AYAMK4DAADRBgAwsAMAANMGACC0AwAAqgUAMAQgAADHBgAwrgMAAMgGADCwAwAAygYAILQDAADCBQAwAAAAAAALIAAA7gYAMCEAAPMGADCuAwAA7wYAMK8DAADwBgAwsAMAAPEGACCxAwAA8gYAMLIDAADyBgAwswMAAPIGADC0AwAA8gYAMLUDAAD0BgAwtgMAAPUGADAYAwAA4gYAIAYAAOMGACAKAADlBgAgDwAA5wYAIBEAAOYGACDSAgEAAAAB2QJAAAAAAegCIAAAAAH1AkAAAAAB9gIBAAAAAYwDAQAAAAGVA4AAAAABlwMCAAAAAZ0DAQAAAAGeAwEAAAABnwMBAAAAAaIDAAAAogMCowMCAAAAAaQDAgAAAAGlAxAAAAABpgMCAAAAAacDAQAAAAGoAxAAAAABqQMQAAAAAQIAAAAFACAgAAD5BgAgAwAAAAUAICAAAPkGACAhAAD4BgAgARkAAKYHADAdAwAA5QQAIAYAAOYEACAHAADnBAAgCgAA4AQAIA8AAK8EACARAADUBAAgvAIAAOMEADC9AgAAAwAQvgIAAOMEADDSAgEAAAAB2QJAAJUEACHoAiAA_gMAIfUCQACVBAAh9gIBAAAAAYwDAQD8AwAhlQMAAJIEACCXAwIAkwQAIZ0DAQD8AwAhngMBAP0DACGfAwEA_AMAIaADAQD8AwAhogMAAOQEogMiowMCAP8DACGkAwIA_wMAIaUDEAC0BAAhpgMCAJMEACGnAwEA_QMAIagDEAC0BAAhqQMQALQEACECAAAABQAgGQAA-AYAIAIAAAD2BgAgGQAA9wYAIBe8AgAA9QYAML0CAAD2BgAQvgIAAPUGADDSAgEA_AMAIdkCQACVBAAh6AIgAP4DACH1AkAAlQQAIfYCAQD8AwAhjAMBAPwDACGVAwAAkgQAIJcDAgCTBAAhnQMBAPwDACGeAwEA_QMAIZ8DAQD8AwAhoAMBAPwDACGiAwAA5ASiAyKjAwIA_wMAIaQDAgD_AwAhpQMQALQEACGmAwIAkwQAIacDAQD9AwAhqAMQALQEACGpAxAAtAQAIRe8AgAA9QYAML0CAAD2BgAQvgIAAPUGADDSAgEA_AMAIdkCQACVBAAh6AIgAP4DACH1AkAAlQQAIfYCAQD8AwAhjAMBAPwDACGVAwAAkgQAIJcDAgCTBAAhnQMBAPwDACGeAwEA_QMAIZ8DAQD8AwAhoAMBAPwDACGiAwAA5ASiAyKjAwIA_wMAIaQDAgD_AwAhpQMQALQEACGmAwIAkwQAIacDAQD9AwAhqAMQALQEACGpAxAAtAQAIRPSAgEA7wQAIdkCQAD7BAAh6AIgAPEEACH1AkAA-wQAIfYCAQDvBAAhjAMBAO8EACGVA4AAAAABlwMCAPkEACGdAwEA7wQAIZ4DAQDwBAAhnwMBAO8EACGiAwAAwAaiAyKjAwIA8gQAIaQDAgDyBAAhpQMQAJQFACGmAwIA-QQAIacDAQDwBAAhqAMQAJQFACGpAxAAlAUAIRgDAADBBgAgBgAAwgYAIAoAAMQGACAPAADGBgAgEQAAxQYAINICAQDvBAAh2QJAAPsEACHoAiAA8QQAIfUCQAD7BAAh9gIBAO8EACGMAwEA7wQAIZUDgAAAAAGXAwIA-QQAIZ0DAQDvBAAhngMBAPAEACGfAwEA7wQAIaIDAADABqIDIqMDAgDyBAAhpAMCAPIEACGlAxAAlAUAIaYDAgD5BAAhpwMBAPAEACGoAxAAlAUAIakDEACUBQAhGAMAAOIGACAGAADjBgAgCgAA5QYAIA8AAOcGACARAADmBgAg0gIBAAAAAdkCQAAAAAHoAiAAAAAB9QJAAAAAAfYCAQAAAAGMAwEAAAABlQOAAAAAAZcDAgAAAAGdAwEAAAABngMBAAAAAZ8DAQAAAAGiAwAAAKIDAqMDAgAAAAGkAwIAAAABpQMQAAAAAaYDAgAAAAGnAwEAAAABqAMQAAAAAakDEAAAAAEEIAAA7gYAMK4DAADvBgAwsAMAAPEGACC0AwAA8gYAMAAAAAALIAAAgAcAMCEAAIQHADCuAwAAgQcAMK8DAACCBwAwsAMAAIMHACCxAwAA8gYAMLIDAADyBgAwswMAAPIGADC0AwAA8gYAMLUDAACFBwAwtgMAAPUGADAYAwAA4gYAIAcAAOQGACAKAADlBgAgDwAA5wYAIBEAAOYGACDSAgEAAAAB2QJAAAAAAegCIAAAAAH1AkAAAAAB9gIBAAAAAYwDAQAAAAGVA4AAAAABlwMCAAAAAZ0DAQAAAAGeAwEAAAABoAMBAAAAAaIDAAAAogMCowMCAAAAAaQDAgAAAAGlAxAAAAABpgMCAAAAAacDAQAAAAGoAxAAAAABqQMQAAAAAQIAAAAFACAgAACIBwAgAwAAAAUAICAAAIgHACAhAACHBwAgARkAAKUHADACAAAABQAgGQAAhwcAIAIAAAD2BgAgGQAAhgcAIBPSAgEA7wQAIdkCQAD7BAAh6AIgAPEEACH1AkAA-wQAIfYCAQDvBAAhjAMBAO8EACGVA4AAAAABlwMCAPkEACGdAwEA7wQAIZ4DAQDwBAAhoAMBAO8EACGiAwAAwAaiAyKjAwIA8gQAIaQDAgDyBAAhpQMQAJQFACGmAwIA-QQAIacDAQDwBAAhqAMQAJQFACGpAxAAlAUAIRgDAADBBgAgBwAAwwYAIAoAAMQGACAPAADGBgAgEQAAxQYAINICAQDvBAAh2QJAAPsEACHoAiAA8QQAIfUCQAD7BAAh9gIBAO8EACGMAwEA7wQAIZUDgAAAAAGXAwIA-QQAIZ0DAQDvBAAhngMBAPAEACGgAwEA7wQAIaIDAADABqIDIqMDAgDyBAAhpAMCAPIEACGlAxAAlAUAIaYDAgD5BAAhpwMBAPAEACGoAxAAlAUAIakDEACUBQAhGAMAAOIGACAHAADkBgAgCgAA5QYAIA8AAOcGACARAADmBgAg0gIBAAAAAdkCQAAAAAHoAiAAAAAB9QJAAAAAAfYCAQAAAAGMAwEAAAABlQOAAAAAAZcDAgAAAAGdAwEAAAABngMBAAAAAaADAQAAAAGiAwAAAKIDAqMDAgAAAAGkAwIAAAABpQMQAAAAAaYDAgAAAAGnAwEAAAABqAMQAAAAAakDEAAAAAEEIAAAgAcAMK4DAACBBwAwsAMAAIMHACC0AwAA8gYAMAAAAAsgAACOBwAwIQAAkgcAMK4DAACPBwAwrwMAAJAHADCwAwAAkQcAILEDAADyBgAwsgMAAPIGADCzAwAA8gYAMLQDAADyBgAwtQMAAJMHADC2AwAA9QYAMBgGAADjBgAgBwAA5AYAIAoAAOUGACAPAADnBgAgEQAA5gYAINICAQAAAAHZAkAAAAAB6AIgAAAAAfUCQAAAAAH2AgEAAAABjAMBAAAAAZUDgAAAAAGXAwIAAAABngMBAAAAAZ8DAQAAAAGgAwEAAAABogMAAACiAwKjAwIAAAABpAMCAAAAAaUDEAAAAAGmAwIAAAABpwMBAAAAAagDEAAAAAGpAxAAAAABAgAAAAUAICAAAJYHACADAAAABQAgIAAAlgcAICEAAJUHACABGQAApAcAMAIAAAAFACAZAACVBwAgAgAAAPYGACAZAACUBwAgE9ICAQDvBAAh2QJAAPsEACHoAiAA8QQAIfUCQAD7BAAh9gIBAO8EACGMAwEA7wQAIZUDgAAAAAGXAwIA-QQAIZ4DAQDwBAAhnwMBAO8EACGgAwEA7wQAIaIDAADABqIDIqMDAgDyBAAhpAMCAPIEACGlAxAAlAUAIaYDAgD5BAAhpwMBAPAEACGoAxAAlAUAIakDEACUBQAhGAYAAMIGACAHAADDBgAgCgAAxAYAIA8AAMYGACARAADFBgAg0gIBAO8EACHZAkAA-wQAIegCIADxBAAh9QJAAPsEACH2AgEA7wQAIYwDAQDvBAAhlQOAAAAAAZcDAgD5BAAhngMBAPAEACGfAwEA7wQAIaADAQDvBAAhogMAAMAGogMiowMCAPIEACGkAwIA8gQAIaUDEACUBQAhpgMCAPkEACGnAwEA8AQAIagDEACUBQAhqQMQAJQFACEYBgAA4wYAIAcAAOQGACAKAADlBgAgDwAA5wYAIBEAAOYGACDSAgEAAAAB2QJAAAAAAegCIAAAAAH1AkAAAAAB9gIBAAAAAYwDAQAAAAGVA4AAAAABlwMCAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaIDAAAAogMCowMCAAAAAaQDAgAAAAGlAxAAAAABpgMCAAAAAacDAQAAAAGoAxAAAAABqQMQAAAAAQQgAACOBwAwrgMAAI8HADCwAwAAkQcAILQDAADyBgAwCwgAAJsHACAMAACZBwAgEAAAmgcAIBEAAJwHACATAACdBwAg_AIAAOgEACD9AgAA6AQAIP4CAADoBAAg_wIAAOgEACCAAwAA6AQAIIEDAADoBAAgBg0AAIQGACAOAACFBgAgDwAAywUAINgCAADoBAAgjAMAAOgEACCSAwAA6AQAIAMPAADLBQAggQMAAOgEACCDAwAA6AQAIA0DAAChBwAgBgAAogcAIAcAAKMHACAKAACfBwAgDwAAywUAIBEAAJwHACCeAwAA6AQAIKMDAADoBAAgpAMAAOgEACClAwAA6AQAIKcDAADoBAAgqAMAAOgEACCpAwAA6AQAIAAAAQkAALoGACAAAgMAAJ4HACAKAACfBwAgAQQAAPsGACACBAAA-wYAIIwDAADoBAAgAQQAAPsGACAT0gIBAAAAAdkCQAAAAAHoAiAAAAAB9QJAAAAAAfYCAQAAAAGMAwEAAAABlQOAAAAAAZcDAgAAAAGeAwEAAAABnwMBAAAAAaADAQAAAAGiAwAAAKIDAqMDAgAAAAGkAwIAAAABpQMQAAAAAaYDAgAAAAGnAwEAAAABqAMQAAAAAakDEAAAAAET0gIBAAAAAdkCQAAAAAHoAiAAAAAB9QJAAAAAAfYCAQAAAAGMAwEAAAABlQOAAAAAAZcDAgAAAAGdAwEAAAABngMBAAAAAaADAQAAAAGiAwAAAKIDAqMDAgAAAAGkAwIAAAABpQMQAAAAAaYDAgAAAAGnAwEAAAABqAMQAAAAAakDEAAAAAET0gIBAAAAAdkCQAAAAAHoAiAAAAAB9QJAAAAAAfYCAQAAAAGMAwEAAAABlQOAAAAAAZcDAgAAAAGdAwEAAAABngMBAAAAAZ8DAQAAAAGiAwAAAKIDAqMDAgAAAAGkAwIAAAABpQMQAAAAAaYDAgAAAAGnAwEAAAABqAMQAAAAAakDEAAAAAEFxQICAAAAAdICAQAAAAHkAgEAAAAB6AIgAAAAAaoDIAAAAAECAAAAawAgIAAApwcAIATSAgEAAAAB5AIBAAAAAegCIAAAAAGMAwEAAAABAgAAAFIAICAAAKkHACAD0gIBAAAAAeQCAQAAAAHoAiAAAAABAgAAAAEAICAAAKsHACAG0gIBAAAAAYEDAQAAAAGZAwEAAAABmgMCAAAAAZsDAgAAAAGcAwEAAAABBwYAAACXAwLSAgEAAAAB2QJAAAAAAeoCAQAAAAGHAwEAAAABlwMCAAAAAZgDAgAAAAEO0gIBAAAAAdkCQAAAAAHtAgAAAPwCAvUCQAAAAAH2AgEAAAAB9wIBAAAAAfgCAQAAAAH5AkAAAAAB-gJAAAAAAfwCQAAAAAH9AgEAAAAB_gIBAAAAAYADEAAAAAGBAwEAAAABAwAAAG4AICAAAKcHACAhAACyBwAgBwAAAG4AIBkAALIHACDFAgIA-QQAIdICAQDvBAAh5AIBAO8EACHoAiAA8QQAIaoDIADxBAAhBcUCAgD5BAAh0gIBAO8EACHkAgEA7wQAIegCIADxBAAhqgMgAPEEACEDAAAAVQAgIAAAqQcAICEAALUHACAGAAAAVQAgGQAAtQcAINICAQDvBAAh5AIBAO8EACHoAiAA8QQAIYwDAQDwBAAhBNICAQDvBAAh5AIBAO8EACHoAiAA8QQAIYwDAQDwBAAhAwAAADwAICAAAKsHACAhAAC4BwAgBQAAADwAIBkAALgHACDSAgEA7wQAIeQCAQDvBAAh6AIgAPEEACED0gIBAO8EACHkAgEA7wQAIegCIADxBAAhA9ICAQAAAAHkAgEAAAAB6AIgAAAAAQPSAgEAAAAB5AIBAAAAAegCIAAAAAECAAAAmgEAICAAALoHACAG0gIBAAAAAf8CAQAAAAGBAwEAAAABmgMCAAAAAZsDAgAAAAGcAwEAAAABAwAAAJ0BACAgAAC6BwAgIQAAvwcAIAUAAACdAQAgGQAAvwcAINICAQDvBAAh5AIBAO8EACHoAiAA8QQAIQPSAgEA7wQAIeQCAQDvBAAh6AIgAPEEACEFAwAApwYAINICAQAAAAHkAgEAAAAB6AIgAAAAAZ0DAQAAAAECAAAAEQAgIAAAwAcAIBkDAADiBgAgBgAA4wYAIAcAAOQGACAPAADnBgAgEQAA5gYAINICAQAAAAHZAkAAAAAB6AIgAAAAAfUCQAAAAAH2AgEAAAABjAMBAAAAAZUDgAAAAAGXAwIAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaIDAAAAogMCowMCAAAAAaQDAgAAAAGlAxAAAAABpgMCAAAAAacDAQAAAAGoAxAAAAABqQMQAAAAAQIAAAAFACAgAADCBwAgAwAAAA8AICAAAMAHACAhAADGBwAgBwAAAA8AIAMAAJkGACAZAADGBwAg0gIBAO8EACHkAgEA7wQAIegCIADxBAAhnQMBAO8EACEFAwAAmQYAINICAQDvBAAh5AIBAO8EACHoAiAA8QQAIZ0DAQDvBAAhAwAAAAMAICAAAMIHACAhAADJBwAgGwAAAAMAIAMAAMEGACAGAADCBgAgBwAAwwYAIA8AAMYGACARAADFBgAgGQAAyQcAINICAQDvBAAh2QJAAPsEACHoAiAA8QQAIfUCQAD7BAAh9gIBAO8EACGMAwEA7wQAIZUDgAAAAAGXAwIA-QQAIZ0DAQDvBAAhngMBAPAEACGfAwEA7wQAIaADAQDvBAAhogMAAMAGogMiowMCAPIEACGkAwIA8gQAIaUDEACUBQAhpgMCAPkEACGnAwEA8AQAIagDEACUBQAhqQMQAJQFACEZAwAAwQYAIAYAAMIGACAHAADDBgAgDwAAxgYAIBEAAMUGACDSAgEA7wQAIdkCQAD7BAAh6AIgAPEEACH1AkAA-wQAIfYCAQDvBAAhjAMBAO8EACGVA4AAAAABlwMCAPkEACGdAwEA7wQAIZ4DAQDwBAAhnwMBAO8EACGgAwEA7wQAIaIDAADABqIDIqMDAgDyBAAhpAMCAPIEACGlAxAAlAUAIaYDAgD5BAAhpwMBAPAEACGoAxAAlAUAIakDEACUBQAhEwgAALcFACAMAAC1BQAgEAAAtgUAIBMAALkFACDSAgEAAAAB2QJAAAAAAe0CAAAA_AIC9QJAAAAAAfYCAQAAAAH3AgEAAAAB-AIBAAAAAfkCQAAAAAH6AkAAAAAB_AJAAAAAAf0CAQAAAAH-AgEAAAAB_wIBAAAAAYADEAAAAAGBAwEAAAABAgAAACcAICAAAMoHACADAAAAGgAgIAAAygcAICEAAM4HACAVAAAAGgAgCAAAlwUAIAwAAJUFACAQAACWBQAgEwAAmQUAIBkAAM4HACDSAgEA7wQAIdkCQAD7BAAh7QIAAJMF_AIi9QJAAPsEACH2AgEA7wQAIfcCAQDvBAAh-AIBAO8EACH5AkAA-wQAIfoCQAD7BAAh_AJAAPoEACH9AgEA8AQAIf4CAQDwBAAh_wIBAPAEACGAAxAAlAUAIYEDAQDwBAAhEwgAAJcFACAMAACVBQAgEAAAlgUAIBMAAJkFACDSAgEA7wQAIdkCQAD7BAAh7QIAAJMF_AIi9QJAAPsEACH2AgEA7wQAIfcCAQDvBAAh-AIBAO8EACH5AkAA-wQAIfoCQAD7BAAh_AJAAPoEACH9AgEA8AQAIf4CAQDwBAAh_wIBAPAEACGAAxAAlAUAIYEDAQDwBAAhBNICAQAAAAGIAwIAAAABiQMCAAAAAYoDAgAAAAEE0gIBAAAAAfkCQAAAAAH6AkAAAAABhwMBAAAAAQ7SAgEAAAAB2QJAAAAAAe0CAAAA_AIC9QJAAAAAAfYCAQAAAAH4AgEAAAAB-QJAAAAAAfoCQAAAAAH8AkAAAAAB_QIBAAAAAf4CAQAAAAH_AgEAAAABgAMQAAAAAYEDAQAAAAEUDgAAggYAIA8AAIMGACDFAgIAAAAB0gIBAAAAAdgCQAAAAAHZAkAAAAAB5AIBAAAAAegCIAAAAAH1AkAAAAABiwMBAAAAAYwDAQAAAAGNAwIAAAABjgMCAAAAAY8DAgAAAAGQAwIAAAABkQMCAAAAAZIDEAAAAAGTAwEAAAABlAMgAAAAAZUDgAAAAAECAAAA9wEAICAAANIHACADAAAAJAAgIAAA0gcAICEAANYHACAWAAAAJAAgDgAA3gUAIA8AAN8FACAZAADWBwAgxQICAPkEACHSAgEA7wQAIdgCQAD6BAAh2QJAAPsEACHkAgEA7wQAIegCIADxBAAh9QJAAPsEACGLAwEA7wQAIYwDAQDwBAAhjQMCAPkEACGOAwIA-QQAIY8DAgD5BAAhkAMCAPkEACGRAwIA-QQAIZIDEACUBQAhkwMBAO8EACGUAyAA8QQAIZUDgAAAAAEUDgAA3gUAIA8AAN8FACDFAgIA-QQAIdICAQDvBAAh2AJAAPoEACHZAkAA-wQAIeQCAQDvBAAh6AIgAPEEACH1AkAA-wQAIYsDAQDvBAAhjAMBAPAEACGNAwIA-QQAIY4DAgD5BAAhjwMCAPkEACGQAwIA-QQAIZEDAgD5BAAhkgMQAJQFACGTAwEA7wQAIZQDIADxBAAhlQOAAAAAARQNAACBBgAgDwAAgwYAIMUCAgAAAAHSAgEAAAAB2AJAAAAAAdkCQAAAAAHkAgEAAAAB6AIgAAAAAfUCQAAAAAGLAwEAAAABjAMBAAAAAY0DAgAAAAGOAwIAAAABjwMCAAAAAZADAgAAAAGRAwIAAAABkgMQAAAAAZMDAQAAAAGUAyAAAAABlQOAAAAAAQIAAAD3AQAgIAAA1wcAIAMAAAAkACAgAADXBwAgIQAA2wcAIBYAAAAkACANAADdBQAgDwAA3wUAIBkAANsHACDFAgIA-QQAIdICAQDvBAAh2AJAAPoEACHZAkAA-wQAIeQCAQDvBAAh6AIgAPEEACH1AkAA-wQAIYsDAQDvBAAhjAMBAPAEACGNAwIA-QQAIY4DAgD5BAAhjwMCAPkEACGQAwIA-QQAIZEDAgD5BAAhkgMQAJQFACGTAwEA7wQAIZQDIADxBAAhlQOAAAAAARQNAADdBQAgDwAA3wUAIMUCAgD5BAAh0gIBAO8EACHYAkAA-gQAIdkCQAD7BAAh5AIBAO8EACHoAiAA8QQAIfUCQAD7BAAhiwMBAO8EACGMAwEA8AQAIY0DAgD5BAAhjgMCAPkEACGPAwIA-QQAIZADAgD5BAAhkQMCAPkEACGSAxAAlAUAIZMDAQDvBAAhlAMgAPEEACGVA4AAAAABDtICAQAAAAHZAkAAAAAB7QIAAAD8AgL1AkAAAAAB9gIBAAAAAfcCAQAAAAH5AkAAAAAB-gJAAAAAAfwCQAAAAAH9AgEAAAAB_gIBAAAAAf8CAQAAAAGAAxAAAAABgQMBAAAAARkDAADiBgAgBgAA4wYAIAcAAOQGACAKAADlBgAgEQAA5gYAINICAQAAAAHZAkAAAAAB6AIgAAAAAfUCQAAAAAH2AgEAAAABjAMBAAAAAZUDgAAAAAGXAwIAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaIDAAAAogMCowMCAAAAAaQDAgAAAAGlAxAAAAABpgMCAAAAAacDAQAAAAGoAxAAAAABqQMQAAAAAQIAAAAFACAgAADdBwAgBtICAQAAAAHZAkAAAAAB5AIBAAAAAYEDAQAAAAGCAwEAAAABgwMBAAAAAQIAAAC9AgAgIAAA3wcAIBQNAACBBgAgDgAAggYAIMUCAgAAAAHSAgEAAAAB2AJAAAAAAdkCQAAAAAHkAgEAAAAB6AIgAAAAAfUCQAAAAAGLAwEAAAABjAMBAAAAAY0DAgAAAAGOAwIAAAABjwMCAAAAAZADAgAAAAGRAwIAAAABkgMQAAAAAZMDAQAAAAGUAyAAAAABlQOAAAAAAQIAAAD3AQAgIAAA4QcAIBkDAADiBgAgBgAA4wYAIAcAAOQGACAKAADlBgAgDwAA5wYAINICAQAAAAHZAkAAAAAB6AIgAAAAAfUCQAAAAAH2AgEAAAABjAMBAAAAAZUDgAAAAAGXAwIAAAABnQMBAAAAAZ4DAQAAAAGfAwEAAAABoAMBAAAAAaIDAAAAogMCowMCAAAAAaQDAgAAAAGlAxAAAAABpgMCAAAAAacDAQAAAAGoAxAAAAABqQMQAAAAAQIAAAAFACAgAADjBwAgAwAAAAMAICAAAOMHACAhAADnBwAgGwAAAAMAIAMAAMEGACAGAADCBgAgBwAAwwYAIAoAAMQGACAPAADGBgAgGQAA5wcAINICAQDvBAAh2QJAAPsEACHoAiAA8QQAIfUCQAD7BAAh9gIBAO8EACGMAwEA7wQAIZUDgAAAAAGXAwIA-QQAIZ0DAQDvBAAhngMBAPAEACGfAwEA7wQAIaADAQDvBAAhogMAAMAGogMiowMCAPIEACGkAwIA8gQAIaUDEACUBQAhpgMCAPkEACGnAwEA8AQAIagDEACUBQAhqQMQAJQFACEZAwAAwQYAIAYAAMIGACAHAADDBgAgCgAAxAYAIA8AAMYGACDSAgEA7wQAIdkCQAD7BAAh6AIgAPEEACH1AkAA-wQAIfYCAQDvBAAhjAMBAO8EACGVA4AAAAABlwMCAPkEACGdAwEA7wQAIZ4DAQDwBAAhnwMBAO8EACGgAwEA7wQAIaIDAADABqIDIqMDAgDyBAAhpAMCAPIEACGlAxAAlAUAIaYDAgD5BAAhpwMBAPAEACGoAxAAlAUAIakDEACUBQAhBwYAAACXAwLSAgEAAAAB2QJAAAAAAf8CAQAAAAGHAwEAAAABlwMCAAAAAZgDAgAAAAEM0gIBAAAAAdkCQAAAAAHrAhAAAAAB7QIAAADtAgLuAgEAAAAB7wIBAAAAAfACAQAAAAHxAkAAAAAB8gIgAAAAAfMCAQAAAAH0AkAAAAAB9QJAAAAAAQMAAAADACAgAADdBwAgIQAA7AcAIBsAAAADACADAADBBgAgBgAAwgYAIAcAAMMGACAKAADEBgAgEQAAxQYAIBkAAOwHACDSAgEA7wQAIdkCQAD7BAAh6AIgAPEEACH1AkAA-wQAIfYCAQDvBAAhjAMBAO8EACGVA4AAAAABlwMCAPkEACGdAwEA7wQAIZ4DAQDwBAAhnwMBAO8EACGgAwEA7wQAIaIDAADABqIDIqMDAgDyBAAhpAMCAPIEACGlAxAAlAUAIaYDAgD5BAAhpwMBAPAEACGoAxAAlAUAIakDEACUBQAhGQMAAMEGACAGAADCBgAgBwAAwwYAIAoAAMQGACARAADFBgAg0gIBAO8EACHZAkAA-wQAIegCIADxBAAh9QJAAPsEACH2AgEA7wQAIYwDAQDvBAAhlQOAAAAAAZcDAgD5BAAhnQMBAO8EACGeAwEA8AQAIZ8DAQDvBAAhoAMBAO8EACGiAwAAwAaiAyKjAwIA8gQAIaQDAgDyBAAhpQMQAJQFACGmAwIA-QQAIacDAQDwBAAhqAMQAJQFACGpAxAAlAUAIQMAAADAAgAgIAAA3wcAICEAAO8HACAIAAAAwAIAIBkAAO8HACDSAgEA7wQAIdkCQAD7BAAh5AIBAO8EACGBAwEA8AQAIYIDAQDvBAAhgwMBAPAEACEG0gIBAO8EACHZAkAA-wQAIeQCAQDvBAAhgQMBAPAEACGCAwEA7wQAIYMDAQDwBAAhAwAAACQAICAAAOEHACAhAADyBwAgFgAAACQAIA0AAN0FACAOAADeBQAgGQAA8gcAIMUCAgD5BAAh0gIBAO8EACHYAkAA-gQAIdkCQAD7BAAh5AIBAO8EACHoAiAA8QQAIfUCQAD7BAAhiwMBAO8EACGMAwEA8AQAIY0DAgD5BAAhjgMCAPkEACGPAwIA-QQAIZADAgD5BAAhkQMCAPkEACGSAxAAlAUAIZMDAQDvBAAhlAMgAPEEACGVA4AAAAABFA0AAN0FACAOAADeBQAgxQICAPkEACHSAgEA7wQAIdgCQAD6BAAh2QJAAPsEACHkAgEA7wQAIegCIADxBAAh9QJAAPsEACGLAwEA7wQAIYwDAQDwBAAhjQMCAPkEACGOAwIA-QQAIY8DAgD5BAAhkAMCAPkEACGRAwIA-QQAIZIDEACUBQAhkwMBAO8EACGUAyAA8QQAIZUDgAAAAAETCAAAtwUAIAwAALUFACAQAAC2BQAgEQAAuAUAINICAQAAAAHZAkAAAAAB7QIAAAD8AgL1AkAAAAAB9gIBAAAAAfcCAQAAAAH4AgEAAAAB-QJAAAAAAfoCQAAAAAH8AkAAAAAB_QIBAAAAAf4CAQAAAAH_AgEAAAABgAMQAAAAAYEDAQAAAAECAAAAJwAgIAAA8wcAIAMAAAAaACAgAADzBwAgIQAA9wcAIBUAAAAaACAIAACXBQAgDAAAlQUAIBAAAJYFACARAACYBQAgGQAA9wcAINICAQDvBAAh2QJAAPsEACHtAgAAkwX8AiL1AkAA-wQAIfYCAQDvBAAh9wIBAO8EACH4AgEA7wQAIfkCQAD7BAAh-gJAAPsEACH8AkAA-gQAIf0CAQDwBAAh_gIBAPAEACH_AgEA8AQAIYADEACUBQAhgQMBAPAEACETCAAAlwUAIAwAAJUFACAQAACWBQAgEQAAmAUAINICAQDvBAAh2QJAAPsEACHtAgAAkwX8AiL1AkAA-wQAIfYCAQDvBAAh9wIBAO8EACH4AgEA7wQAIfkCQAD7BAAh-gJAAPsEACH8AkAA-gQAIf0CAQDwBAAh_gIBAPAEACH_AgEA8AQAIYADEACUBQAhgQMBAPAEACECBAYCBQAXBwMAAQUAFgYAAwcABQoOBw82DREZDAIEBwIFAAQBBAgAAgQJAgUABgEECgACCAACCwAIAwMACQUACwoUBwIFAAoJEggBCRMAAQoVAAIIAAISGw0GBQAVCC4CDAAOEAASES8MEzMUBAUAEQ0fDw4jEA8oDQEMAA4BDCUOAw0pAA4qAA8rAAIFABMPLA0BDy0AARIADQIRNAATNQADCjcADzkAETgAAQQ6AAAAAAMFABwmAB0nAB4AAAADBQAcJgAdJwAeAAADBQAjJgAkJwAlAAAAAwUAIyYAJCcAJQAABQUAKiYALScALkgAK0kALAAAAAAABQUAKiYALScALkgAK0kALAMDAAEGAAMHAAUDAwABBgADBwAFBQUAMyYANicAN0gANEkANQAAAAAABQUAMyYANicAN0gANEkANQAAAwUAPCYAPScAPgAAAAMFADwmAD0nAD4BAwAJAQMACQMFAEMmAEQnAEUAAAADBQBDJgBEJwBFAggAAgsACAIIAAILAAgFBQBKJgBNJwBOSABLSQBMAAAAAAAFBQBKJgBNJwBOSABLSQBMAggAAhLpAQ0CCAACEu8BDQUFAFMmAFYnAFdIAFRJAFUAAAAAAAUFAFMmAFYnAFdIAFRJAFUAAAUFAFwmAF8nAGBIAF1JAF4AAAAAAAUFAFwmAF8nAGBIAF1JAF4BDAAOAQwADgUFAGUmAGgnAGlIAGZJAGcAAAAAAAUFAGUmAGgnAGlIAGZJAGcBDK8CDgEMtQIOAwUAbiYAbycAcAAAAAMFAG4mAG8nAHAAAAMFAHUmAHYnAHcAAAADBQB1JgB2JwB3AwjgAgIMAA4QABIDCOYCAgwADhAAEgUFAHwmAH8nAIABSAB9SQB-AAAAAAAFBQB8JgB_JwCAAUgAfUkAfgESAA0BEgANBQUAhQEmAIgBJwCJAUgAhgFJAIcBAAAAAAAFBQCFASYAiAEnAIkBSACGAUkAhwEAAAADBQCPASYAkAEnAJEBAAAAAwUAjwEmAJABJwCRAQAAAAUFAJcBJgCaAScAmwFIAJgBSQCZAQAAAAAABQUAlwEmAJoBJwCbAUgAmAFJAJkBAAAABQUAoQEmAKQBJwClAUgAogFJAKMBAAAAAAAFBQChASYApAEnAKUBSACiAUkAowEAAAAFBQCrASYArgEnAK8BSACsAUkArQEAAAAAAAUFAKsBJgCuAScArwFIAKwBSQCtARQCARU7ARY-ARc_ARhAARpCARtEGBxFGR1HAR5JGB9KGiJLASNMASRNGChQGylRHypTAytUAyxXAy1YAy5ZAy9bAzBdGDFeIDJgAzNiGDRjITVkAzZlAzdmGDhpIjlqJjpsBTttBTxwBT1xBT5yBT90BUB2GEF3J0J5BUN7GER8KEV9BUZ-BUd_GEqCASlLgwEvTIQBAk2FAQJOhgECT4cBAlCIAQJRigECUowBGFONATBUjwECVZEBGFaSATFXkwECWJQBAlmVARhamAEyW5kBOFybAQldnAEJXp8BCV-gAQlgoQEJYaMBCWKlARhjpgE5ZKgBCWWqARhmqwE6Z6wBCWitAQlprgEYarEBO2uyAT9sswEIbbQBCG61AQhvtgEIcLcBCHG5AQhyuwEYc7wBQHS-AQh1wAEYdsEBQXfCAQh4wwEIecQBGHrHAUJ7yAFGfMkBB33KAQd-ywEHf8wBB4ABzQEHgQHPAQeCAdEBGIMB0gFHhAHUAQeFAdYBGIYB1wFIhwHYAQeIAdkBB4kB2gEYigHdAUmLAd4BT4wB3wEMjQHgAQyOAeEBDI8B4gEMkAHjAQyRAeUBDJIB5wEYkwHoAVCUAesBDJUB7QEYlgHuAVGXAfABDJgB8QEMmQHyARiaAfUBUpsB9gFYnAH4AQ6dAfkBDp4B-wEOnwH8AQ6gAf0BDqEB_wEOogGBAhijAYICWaQBhAIOpQGGAhimAYcCWqcBiAIOqAGJAg6pAYoCGKoBjQJbqwGOAmGsAY8CD60BkAIPrgGRAg-vAZICD7ABkwIPsQGVAg-yAZcCGLMBmAJitAGaAg-1AZwCGLYBnQJjtwGeAg-4AZ8CD7kBoAIYugGjAmS7AaQCarwBpQIQvQGmAhC-AacCEL8BqAIQwAGpAhDBAasCEMIBrQIYwwGuAmvEAbECEMUBswIYxgG0AmzHAbYCEMgBtwIQyQG4AhjKAbsCbcsBvAJxzAG-AhLNAb8CEs4BwgISzwHDAhLQAcQCEtEBxgIS0gHIAhjTAckCctQBywIS1QHNAhjWAc4Cc9cBzwIS2AHQAhLZAdECGNoB1AJ02wHVAnjcAdYCDd0B1wIN3gHYAg3fAdkCDeAB2gIN4QHcAg3iAd4CGOMB3wJ55AHiAg3lAeQCGOYB5QJ65wHnAg3oAegCDekB6QIY6gHsAnvrAe0CgQHsAe4CFO0B7wIU7gHwAhTvAfECFPAB8gIU8QH0AhTyAfYCGPMB9wKCAfQB-QIU9QH7Ahj2AfwCgwH3Af0CFPgB_gIU-QH_Ahj6AYIDhAH7AYMDigH8AYUDiwH9AYYDiwH-AYkDiwH_AYoDiwGAAosDiwGBAo0DiwGCAo8DGIMCkAOMAYQCkgOLAYUClAMYhgKVA40BhwKWA4sBiAKXA4sBiQKYAxiKApsDjgGLApwDkgGMAp4DkwGNAp8DkwGOAqIDkwGPAqMDkwGQAqQDkwGRAqYDkwGSAqgDGJMCqQOUAZQCqwOTAZUCrQMYlgKuA5UBlwKvA5MBmAKwA5MBmQKxAxiaArQDlgGbArUDnAGcArcDnQGdArgDnQGeArsDnQGfArwDnQGgAr0DnQGhAr8DnQGiAsEDGKMCwgOeAaQCxAOdAaUCxgMYpgLHA58BpwLIA50BqALJA50BqQLKAxiqAs0DoAGrAs4DpgGsAtADpwGtAtEDpwGuAtQDpwGvAtUDpwGwAtYDpwGxAtgDpwGyAtoDGLMC2wOoAbQC3QOnAbUC3wMYtgLgA6kBtwLhA6cBuALiA6cBuQLjAxi6AuYDqgG7AucDsAE"
};
async function decodeBase64AsWasm(wasmBase64) {
    const { Buffer } = await __turbopack_context__.A("[externals]/node:buffer [external] (node:buffer, cjs, async loader)");
    const wasmArray = Buffer.from(wasmBase64, 'base64');
    return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
    getRuntime: async ()=>await __turbopack_context__.A("[externals]/@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs [external] (@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs, esm_import, [project]/node_modules/@prisma/client, async loader)"),
    getQueryCompilerWasmModule: async ()=>{
        const { wasm } = await __turbopack_context__.A("[externals]/@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs [external] (@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs, esm_import, [project]/node_modules/@prisma/client, async loader)");
        return await decodeBase64AsWasm(wasm);
    },
    importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["getPrismaClient"](config);
}
}),
"[project]/src/generated/prisma/internal/prismaNamespace.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnyNull",
    ()=>AnyNull,
    "BloqueoAgendaScalarFieldEnum",
    ()=>BloqueoAgendaScalarFieldEnum,
    "CampoPersonalizadoScalarFieldEnum",
    ()=>CampoPersonalizadoScalarFieldEnum,
    "ClienteScalarFieldEnum",
    ()=>ClienteScalarFieldEnum,
    "CompatibilidadVehiculoScalarFieldEnum",
    ()=>CompatibilidadVehiculoScalarFieldEnum,
    "ConfiguracionCampoScalarFieldEnum",
    ()=>ConfiguracionCampoScalarFieldEnum,
    "CristalScalarFieldEnum",
    ()=>CristalScalarFieldEnum,
    "DbNull",
    ()=>DbNull,
    "Decimal",
    ()=>Decimal,
    "HorarioServicioScalarFieldEnum",
    ()=>HorarioServicioScalarFieldEnum,
    "IntentoLoginScalarFieldEnum",
    ()=>IntentoLoginScalarFieldEnum,
    "JsonNull",
    ()=>JsonNull,
    "JsonNullValueFilter",
    ()=>JsonNullValueFilter,
    "JsonNullValueInput",
    ()=>JsonNullValueInput,
    "MarcaCristalScalarFieldEnum",
    ()=>MarcaCristalScalarFieldEnum,
    "MarcaVehiculoScalarFieldEnum",
    ()=>MarcaVehiculoScalarFieldEnum,
    "ModelName",
    ()=>ModelName,
    "ModeloVehiculoScalarFieldEnum",
    ()=>ModeloVehiculoScalarFieldEnum,
    "MovimientoStockScalarFieldEnum",
    ()=>MovimientoStockScalarFieldEnum,
    "NullTypes",
    ()=>NullTypes,
    "NullsOrder",
    ()=>NullsOrder,
    "PagoScalarFieldEnum",
    ()=>PagoScalarFieldEnum,
    "PrismaClientInitializationError",
    ()=>PrismaClientInitializationError,
    "PrismaClientKnownRequestError",
    ()=>PrismaClientKnownRequestError,
    "PrismaClientRustPanicError",
    ()=>PrismaClientRustPanicError,
    "PrismaClientUnknownRequestError",
    ()=>PrismaClientUnknownRequestError,
    "PrismaClientValidationError",
    ()=>PrismaClientValidationError,
    "QueryMode",
    ()=>QueryMode,
    "ServicioScalarFieldEnum",
    ()=>ServicioScalarFieldEnum,
    "SortOrder",
    ()=>SortOrder,
    "Sql",
    ()=>Sql,
    "TipoCristalScalarFieldEnum",
    ()=>TipoCristalScalarFieldEnum,
    "TransactionIsolationLevel",
    ()=>TransactionIsolationLevel,
    "TurnoScalarFieldEnum",
    ()=>TurnoScalarFieldEnum,
    "UbicacionVehiculoScalarFieldEnum",
    ()=>UbicacionVehiculoScalarFieldEnum,
    "UsuarioScalarFieldEnum",
    ()=>UsuarioScalarFieldEnum,
    "defineExtension",
    ()=>defineExtension,
    "empty",
    ()=>empty,
    "getExtensionContext",
    ()=>getExtensionContext,
    "join",
    ()=>join,
    "prismaVersion",
    ()=>prismaVersion,
    "raw",
    ()=>raw,
    "sql",
    ()=>sql
]);
/* !!! This is code generated by Prisma. Do not edit directly. !!! */ /* eslint-disable */ // biome-ignore-all lint: generated file
// @ts-nocheck 
/*
 * WARNING: This is an internal file that is subject to change!
 *
 * 🛑 Under no circumstances should you import this file directly! 🛑
 *
 * All exports from this file are wrapped under a `Prisma` namespace object in the client.ts file.
 * While this enables partial backward compatibility, it is not part of the stable public API.
 *
 * If you are looking for your Models, Enums, and Input Types, please import them from the respective
 * model files in the `model` directory!
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client/runtime/client [external] (@prisma/client/runtime/client, cjs, [project]/node_modules/@prisma/client)");
;
const PrismaClientKnownRequestError = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClientKnownRequestError"];
const PrismaClientUnknownRequestError = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClientUnknownRequestError"];
const PrismaClientRustPanicError = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClientRustPanicError"];
const PrismaClientInitializationError = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClientInitializationError"];
const PrismaClientValidationError = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClientValidationError"];
const sql = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["sqltag"];
const empty = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["empty"];
const join = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["join"];
const raw = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["raw"];
const Sql = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["Sql"];
const Decimal = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["Decimal"];
const getExtensionContext = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["Extensions"].getExtensionContext;
const prismaVersion = {
    client: "7.10.0",
    engine: "0edf323efd1d98336f3f0a68684b56f689b900d3"
};
const NullTypes = {
    DbNull: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["NullTypes"].DbNull,
    JsonNull: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["NullTypes"].JsonNull,
    AnyNull: __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["NullTypes"].AnyNull
};
const DbNull = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["DbNull"];
const JsonNull = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["JsonNull"];
const AnyNull = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["AnyNull"];
const ModelName = {
    MarcaCristal: 'MarcaCristal',
    TipoCristal: 'TipoCristal',
    UbicacionVehiculo: 'UbicacionVehiculo',
    Cristal: 'Cristal',
    MarcaVehiculo: 'MarcaVehiculo',
    ModeloVehiculo: 'ModeloVehiculo',
    CompatibilidadVehiculo: 'CompatibilidadVehiculo',
    MovimientoStock: 'MovimientoStock',
    Servicio: 'Servicio',
    HorarioServicio: 'HorarioServicio',
    BloqueoAgenda: 'BloqueoAgenda',
    Cliente: 'Cliente',
    Turno: 'Turno',
    Pago: 'Pago',
    Usuario: 'Usuario',
    IntentoLogin: 'IntentoLogin',
    CampoPersonalizado: 'CampoPersonalizado',
    ConfiguracionCampo: 'ConfiguracionCampo'
};
const TransactionIsolationLevel = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["makeStrictEnum"]({
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
});
const MarcaCristalScalarFieldEnum = {
    id: 'id',
    nombre: 'nombre',
    activo: 'activo'
};
const TipoCristalScalarFieldEnum = {
    id: 'id',
    nombre: 'nombre',
    descripcion: 'descripcion',
    activo: 'activo'
};
const UbicacionVehiculoScalarFieldEnum = {
    id: 'id',
    nombre: 'nombre',
    tieneLado: 'tieneLado',
    orden: 'orden',
    activo: 'activo'
};
const CristalScalarFieldEnum = {
    id: 'id',
    codigo: 'codigo',
    codigoFabricante: 'codigoFabricante',
    descripcion: 'descripcion',
    marcaId: 'marcaId',
    tipoId: 'tipoId',
    ubicacionId: 'ubicacionId',
    lado: 'lado',
    anchoMm: 'anchoMm',
    altoMm: 'altoMm',
    espesorMm: 'espesorMm',
    cantidad: 'cantidad',
    stockMinimo: 'stockMinimo',
    ubicacionDeposito: 'ubicacionDeposito',
    costo: 'costo',
    precioVenta: 'precioVenta',
    activo: 'activo',
    extras: 'extras',
    creadoEn: 'creadoEn',
    actualizadoEn: 'actualizadoEn'
};
const MarcaVehiculoScalarFieldEnum = {
    id: 'id',
    nombre: 'nombre',
    activo: 'activo'
};
const ModeloVehiculoScalarFieldEnum = {
    id: 'id',
    marcaId: 'marcaId',
    nombre: 'nombre',
    activo: 'activo'
};
const CompatibilidadVehiculoScalarFieldEnum = {
    id: 'id',
    cristalId: 'cristalId',
    modeloId: 'modeloId',
    anioDesde: 'anioDesde',
    anioHasta: 'anioHasta',
    carroceria: 'carroceria',
    notas: 'notas'
};
const MovimientoStockScalarFieldEnum = {
    id: 'id',
    cristalId: 'cristalId',
    tipo: 'tipo',
    cantidad: 'cantidad',
    saldo: 'saldo',
    motivo: 'motivo',
    turnoId: 'turnoId',
    creadoEn: 'creadoEn'
};
const ServicioScalarFieldEnum = {
    id: 'id',
    nombre: 'nombre',
    slug: 'slug',
    descripcion: 'descripcion',
    duracionMinutos: 'duracionMinutos',
    intervaloMinutos: 'intervaloMinutos',
    margenMinutos: 'margenMinutos',
    capacidad: 'capacidad',
    anticipacionMinutos: 'anticipacionMinutos',
    precioBase: 'precioBase',
    color: 'color',
    requiereCristal: 'requiereCristal',
    activo: 'activo',
    orden: 'orden',
    archivadoEn: 'archivadoEn',
    extras: 'extras',
    creadoEn: 'creadoEn',
    actualizadoEn: 'actualizadoEn'
};
const HorarioServicioScalarFieldEnum = {
    id: 'id',
    servicioId: 'servicioId',
    diaSemana: 'diaSemana',
    horaInicio: 'horaInicio',
    horaFin: 'horaFin'
};
const BloqueoAgendaScalarFieldEnum = {
    id: 'id',
    servicioId: 'servicioId',
    inicio: 'inicio',
    fin: 'fin',
    motivo: 'motivo'
};
const ClienteScalarFieldEnum = {
    id: 'id',
    nombre: 'nombre',
    telefono: 'telefono',
    email: 'email',
    notas: 'notas',
    creadoEn: 'creadoEn'
};
const TurnoScalarFieldEnum = {
    id: 'id',
    codigo: 'codigo',
    servicioId: 'servicioId',
    clienteId: 'clienteId',
    inicio: 'inicio',
    fin: 'fin',
    estado: 'estado',
    venceEn: 'venceEn',
    vehiculo: 'vehiculo',
    patente: 'patente',
    cristalId: 'cristalId',
    precio: 'precio',
    notas: 'notas',
    creadoEn: 'creadoEn',
    actualizadoEn: 'actualizadoEn'
};
const PagoScalarFieldEnum = {
    id: 'id',
    turnoId: 'turnoId',
    monto: 'monto',
    estado: 'estado',
    mpPreferenciaId: 'mpPreferenciaId',
    mpInitPoint: 'mpInitPoint',
    mpPagoId: 'mpPagoId',
    aceptoCondicionesEn: 'aceptoCondicionesEn',
    requiereDevolucion: 'requiereDevolucion',
    motivoDevolucion: 'motivoDevolucion',
    devueltoEn: 'devueltoEn',
    creadoEn: 'creadoEn',
    actualizadoEn: 'actualizadoEn'
};
const UsuarioScalarFieldEnum = {
    id: 'id',
    usuario: 'usuario',
    nombre: 'nombre',
    passwordHash: 'passwordHash',
    rol: 'rol',
    activo: 'activo',
    ultimoAcceso: 'ultimoAcceso',
    creadoEn: 'creadoEn'
};
const IntentoLoginScalarFieldEnum = {
    usuario: 'usuario',
    fallos: 'fallos',
    ultimoFallo: 'ultimoFallo',
    bloqueadoHasta: 'bloqueadoHasta'
};
const CampoPersonalizadoScalarFieldEnum = {
    id: 'id',
    entidad: 'entidad',
    clave: 'clave',
    etiqueta: 'etiqueta',
    ayuda: 'ayuda',
    tipo: 'tipo',
    requerido: 'requerido',
    unidad: 'unidad',
    opciones: 'opciones',
    orden: 'orden',
    visible: 'visible',
    archivadoEn: 'archivadoEn',
    creadoEn: 'creadoEn'
};
const ConfiguracionCampoScalarFieldEnum = {
    entidad: 'entidad',
    clave: 'clave',
    etiqueta: 'etiqueta',
    ayuda: 'ayuda',
    oculto: 'oculto',
    orden: 'orden'
};
const SortOrder = {
    asc: 'asc',
    desc: 'desc'
};
const JsonNullValueInput = {
    JsonNull: JsonNull
};
const QueryMode = {
    default: 'default',
    insensitive: 'insensitive'
};
const NullsOrder = {
    first: 'first',
    last: 'last'
};
const JsonNullValueFilter = {
    DbNull: DbNull,
    JsonNull: JsonNull,
    AnyNull: AnyNull
};
const defineExtension = __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client$2f$runtime$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2f$runtime$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["Extensions"].defineExtension;
}),
"[project]/src/generated/prisma/internal/prismaNamespace.ts [app-rsc] (ecmascript) <export * as Prisma>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Prisma",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/generated/prisma/internal/prismaNamespace.ts [app-rsc] (ecmascript)");
}),
"[project]/src/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$adapter$2d$pg__$5b$external$5d$__$2840$prisma$2f$adapter$2d$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$29$__ = __turbopack_context__.i("[externals]/@prisma/adapter-pg [external] (@prisma/adapter-pg, esm_import, [project]/node_modules/@prisma/adapter-pg)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/generated/prisma/client.ts [app-rsc] (ecmascript) <locals>");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$adapter$2d$pg__$5b$external$5d$__$2840$prisma$2f$adapter$2d$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$adapter$2d$pg__$5b$external$5d$__$2840$prisma$2f$adapter$2d$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
// En desarrollo, Next.js recarga módulos en caliente: se reutiliza una única
// instancia para no abrir conexiones nuevas en cada recarga.
const globalParaPrisma = globalThis;
function crearCliente() {
    const connectionString = process.env.DATABASE_URL;
    // El driver `pg` ignora `connection_limit` de la URL; se traduce al tamaño del pool.
    // Hace falta con `prisma dev`, cuyo Postgres embebido admite una sola conexión.
    const limite = connectionString && new URL(connectionString).searchParams.get("connection_limit");
    const adapter = new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$adapter$2d$pg__$5b$external$5d$__$2840$prisma$2f$adapter$2d$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$adapter$2d$pg$29$__["PrismaPg"]({
        connectionString,
        ...limite && {
            max: Number(limite)
        }
    });
    return new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PrismaClient"]({
        adapter
    });
}
const db = globalParaPrisma.prisma ?? crearCliente();
if ("TURBOPACK compile-time truthy", 1) globalParaPrisma.prisma = db;
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/formato.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NOMBRE_LADO",
    ()=>NOMBRE_LADO,
    "medidas",
    ()=>medidas,
    "pesos",
    ()=>pesos
]);
const aNumero = (v)=>v === null || v === undefined ? null : Number(v);
function pesos(valor) {
    const n = aNumero(valor);
    return n === null ? "—" : n.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    });
}
function medidas(ancho, alto, espesor) {
    const partes = [];
    if (ancho && alto) partes.push(`${ancho} × ${alto} mm`);
    const e = aNumero(espesor);
    if (e) partes.push(`${e} mm esp.`);
    return partes.join(" · ") || "—";
}
const NOMBRE_LADO = {
    NO_APLICA: "",
    IZQUIERDO: "izquierdo",
    DERECHO: "derecho"
};
}),
"[project]/src/lib/mercadopago.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorMercadoPago",
    ()=>ErrorMercadoPago,
    "armarPreferencia",
    ()=>armarPreferencia,
    "buscarPagosPorReferencia",
    ()=>buscarPagosPorReferencia,
    "crearPreferencia",
    ()=>crearPreferencia,
    "obtenerPago",
    ()=>obtenerPago
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zod$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/zod.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
;
// Cliente mínimo de la API de Mercado Pago (Checkout Pro). Solo servidor: usa MP_ACCESS_TOKEN.
const API = "https://api.mercadopago.com";
const TIEMPO_MAXIMO_MS = 10_000;
class ErrorMercadoPago extends Error {
    status;
    constructor(status, mensaje){
        super(mensaje), this.status = status;
        this.name = "ErrorMercadoPago";
    }
}
/** Catamarca está en UTC-3 todo el año, y Mercado Pago pide la fecha con su desfase. */ function conDesfase(fecha) {
    return new Date(fecha.getTime() - 3 * 60 * 60_000).toISOString().replace("Z", "-03:00");
}
function armarPreferencia(d) {
    const urlApp = d.urlApp.replace(/\/+$/, "");
    const volver = `${urlApp}/reservar/confirmado?turno=${d.turnoId}`;
    // Mercado Pago rechaza el aviso y el regreso automático con direcciones que no son públicas (https).
    const publica = urlApp.startsWith("https://");
    return {
        items: [
            {
                id: d.turnoId,
                title: d.titulo,
                quantity: 1,
                unit_price: d.monto,
                currency_id: "ARS"
            }
        ],
        payer: {
            name: d.nombreCliente,
            ...d.emailCliente ? {
                email: d.emailCliente
            } : {}
        },
        external_reference: d.pagoId,
        back_urls: {
            success: volver,
            failure: volver,
            pending: volver
        },
        expires: true,
        expiration_date_from: conDesfase(d.ahora),
        expiration_date_to: conDesfase(d.venceEn),
        // La reserva dura 8 minutos: un pago en efectivo no llega a tiempo.
        payment_methods: {
            excluded_payment_types: [
                {
                    id: "ticket"
                },
                {
                    id: "atm"
                }
            ]
        },
        ...publica ? {
            auto_return: "approved",
            notification_url: `${urlApp}/api/mercadopago/webhook`
        } : {}
    };
}
function configuracion() {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) throw new Error("Falta MP_ACCESS_TOKEN en .env (credencial de Mercado Pago).");
    return {
        token
    };
}
async function pedir(ruta, init = {}) {
    const { token } = configuracion();
    const respuesta = await fetch(`${API}${ruta}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            ...init.headers
        },
        signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS)
    });
    if (!respuesta.ok) {
        // El detalle puede ser largo; se recorta. Nunca se incluye el token.
        const detalle = (await respuesta.text().catch(()=>"")).slice(0, 300);
        throw new ErrorMercadoPago(respuesta.status, `Mercado Pago respondió ${respuesta.status} en ${ruta}: ${detalle}`);
    }
    return respuesta.json();
}
const preferenciaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    init_point: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
});
async function crearPreferencia(d) {
    const datos = preferenciaSchema.parse(await pedir("/checkout/preferences", {
        method: "POST",
        body: JSON.stringify(armarPreferencia(d))
    }));
    return {
        id: datos.id,
        initPoint: datos.init_point
    };
}
const pagoSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    ]),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
    transaction_amount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number(),
    currency_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    external_reference: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullish()
});
function aPagoMp(datos) {
    return {
        id: String(datos.id),
        estado: datos.status,
        monto: datos.transaction_amount,
        moneda: datos.currency_id ?? "ARS",
        referencia: datos.external_reference ?? null
    };
}
async function obtenerPago(id) {
    return aPagoMp(pagoSchema.parse(await pedir(`/v1/payments/${encodeURIComponent(id)}`)));
}
async function buscarPagosPorReferencia(pagoId) {
    const ruta = `/v1/payments/search?external_reference=${encodeURIComponent(pagoId)}&sort=date_created&criteria=desc`;
    const { results } = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        results: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(pagoSchema)
    }).parse(await pedir(ruta));
    return results.map(aPagoMp);
}
}),
"[project]/src/lib/tiempo.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Utilidades de fecha/hora para la agenda.
 *
 * Catamarca usa UTC-3 todo el año (Argentina no aplica horario de verano desde
 * 2009). Las fechas se guardan en UTC y las franjas horarias como "minutos desde
 * las 00:00" en hora local. Si algún día vuelve el horario de verano, este es el
 * único archivo a cambiar.
 */ __turbopack_context__.s([
    "DIAS_CORTOS",
    ()=>DIAS_CORTOS,
    "DIAS_LARGOS",
    ()=>DIAS_LARGOS,
    "SEMANA",
    ()=>SEMANA,
    "ZONA_HORARIA",
    ()=>ZONA_HORARIA,
    "diaSemana",
    ()=>diaSemana,
    "fechaLocal",
    ()=>fechaLocal,
    "formatearFecha",
    ()=>formatearFecha,
    "formatearHora",
    ()=>formatearHora,
    "horaAMinutos",
    ()=>horaAMinutos,
    "hoy",
    ()=>hoy,
    "instanteLocal",
    ()=>instanteLocal,
    "minutosAHora",
    ()=>minutosAHora,
    "sumarDias",
    ()=>sumarDias,
    "sumarMinutos",
    ()=>sumarMinutos
]);
const ZONA_HORARIA = "America/Argentina/Catamarca";
const OFFSET_LOCAL = "-03:00";
function horaAMinutos(hhmm) {
    const coincidencia = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
    if (!coincidencia) throw new Error(`Hora inválida: "${hhmm}" (formato esperado HH:MM)`);
    return Number(coincidencia[1]) * 60 + Number(coincidencia[2]);
}
function minutosAHora(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function diaSemana(fecha) {
    const [anio, mes, dia] = fecha.split("-").map(Number);
    return new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
}
function instanteLocal(fecha, minutos) {
    return new Date(`${fecha}T${minutosAHora(minutos)}:00${OFFSET_LOCAL}`);
}
function fechaLocal(instante) {
    return new Date(instante.getTime() - 3 * 60 * 60_000).toISOString().slice(0, 10);
}
const DIAS_CORTOS = [
    "Dom",
    "Lun",
    "Mar",
    "Mié",
    "Jue",
    "Vie",
    "Sáb"
];
const DIAS_LARGOS = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado"
];
const SEMANA = [
    1,
    2,
    3,
    4,
    5,
    6,
    0
];
function formatearHora(instante) {
    return instante.toLocaleTimeString("es-AR", {
        timeZone: ZONA_HORARIA,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}
function formatearFecha(fecha, opciones = {
    weekday: "long",
    day: "numeric",
    month: "long"
}) {
    return instanteLocal(fecha, 12 * 60).toLocaleDateString("es-AR", {
        timeZone: ZONA_HORARIA,
        ...opciones
    });
}
function sumarDias(fecha, dias) {
    return fechaLocal(sumarMinutos(instanteLocal(fecha, 12 * 60), dias * 24 * 60));
}
function hoy() {
    return fechaLocal(new Date());
}
function sumarMinutos(fecha, minutos) {
    return new Date(fecha.getTime() + minutos * 60_000);
}
}),
"[project]/src/lib/zod.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
;
/**
 * Zod con mensajes en español pensados para el usuario del panel.
 * Los casos no cubiertos acá caen en el locale "es" que trae Zod.
 */ __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].config(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].locales.es());
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].config({
    customError: (issue)=>{
        switch(issue.code){
            case "invalid_type":
                if (issue.input === undefined || issue.input === null || issue.input === "") return "Campo obligatorio";
                if (issue.expected === "number") return "Ingresá un número";
                return undefined;
            case "too_small":
                if (issue.input === "") return "Campo obligatorio";
                if (issue.origin === "string") return issue.minimum === 1 ? "Campo obligatorio" : `Debe tener al menos ${issue.minimum} caracteres`;
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
    }
});
;
}),
"[project]/src/modules/campos/campo.service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "CampoInvalidoError",
    ()=>CampoInvalidoError,
    "ConfirmacionRequeridaError",
    ()=>ConfirmacionRequeridaError,
    "actualizarCampoPropio",
    ()=>actualizarCampoPropio,
    "actualizarCampoSistema",
    ()=>actualizarCampoSistema,
    "archivarCampoPropio",
    ()=>archivarCampoPropio,
    "cambiarTipoCampo",
    ()=>cambiarTipoCampo,
    "crearCampoPropio",
    ()=>crearCampoPropio,
    "eliminarCampoPropio",
    ()=>eliminarCampoPropio,
    "listarCamposPropios",
    ()=>listarCamposPropios,
    "modificarOpciones",
    ()=>modificarOpciones,
    "moverCampoAdmin",
    ()=>moverCampoAdmin,
    "obtenerCampos",
    ()=>obtenerCampos,
    "obtenerCamposVisibles",
    ()=>obtenerCamposVisibles
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/generated/prisma/client.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Prisma$3e$__ = __turbopack_context__.i("[project]/src/generated/prisma/internal/prismaNamespace.ts [app-rsc] (ecmascript) <export * as Prisma>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$clave$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/clave.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$combinar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/combinar.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/opciones.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$registro$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/registro.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/schemas.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
class CampoInvalidoError extends Error {
    campo;
    constructor(mensaje, campo){
        super(mensaje), this.campo = campo;
        this.name = "CampoInvalidoError";
    }
}
class ConfirmacionRequeridaError extends Error {
    afectados;
    constructor(afectados){
        super(`Se borrarán los valores de ${afectados} ${afectados === 1 ? "registro" : "registros"}.`), this.afectados = afectados;
        this.name = "ConfirmacionRequeridaError";
    }
}
// Tablas con columna `extras`. El nombre de tabla sale de este mapa, nunca de la entrada.
const TABLAS = {
    CRISTAL: "cristales",
    SERVICIO: "servicios"
};
function tabla(entidad) {
    const nombre = TABLAS[entidad];
    if (!nombre) throw new CampoInvalidoError("Este módulo todavía no admite campos propios.");
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Prisma$3e$__["Prisma"].raw(nombre);
}
const aCampoPropio = (f)=>({
        id: f.id,
        entidad: f.entidad,
        clave: f.clave,
        etiqueta: f.etiqueta,
        ayuda: f.ayuda,
        tipo: f.tipo,
        requerido: f.requerido,
        unidad: f.unidad,
        opciones: f.opciones ?? [],
        orden: f.orden,
        visible: f.visible,
        archivado: f.archivadoEn !== null
    });
const json = (opciones)=>opciones;
/**
 * Fila de un campo propio, comprobando que pertenece a la entidad del módulo desde el que se la pide.
 * Las acciones reciben el id desde el cliente: sin esto, una llamada armada a mano podría tocar el campo de otro módulo.
 */ async function filaDelModulo(id, entidad) {
    const fila = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].campoPersonalizado.findUniqueOrThrow({
        where: {
            id
        }
    });
    if (fila.entidad !== entidad) throw new CampoInvalidoError("Ese campo no pertenece a este módulo.");
    return fila;
}
async function listarCamposPropios(entidad) {
    const filas = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].campoPersonalizado.findMany({
        where: {
            entidad
        },
        orderBy: [
            {
                orden: "asc"
            },
            {
                creadoEn: "asc"
            }
        ]
    });
    return filas.map(aCampoPropio);
}
async function obtenerCampos(entidad) {
    const [ajustes, propios] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].configuracionCampo.findMany({
            where: {
                entidad
            }
        }),
        listarCamposPropios(entidad)
    ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$combinar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["combinarCampos"])(entidad, ajustes.map((a)=>({
            clave: a.clave,
            etiqueta: a.etiqueta,
            ayuda: a.ayuda,
            oculto: a.oculto,
            orden: a.orden
        })), propios);
}
async function obtenerCamposVisibles(entidad) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$combinar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["camposVisibles"])(await obtenerCampos(entidad));
}
const etiquetaEnUso = (campos, etiqueta, excluirClave)=>campos.some((c)=>c.clave !== excluirClave && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$clave$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizarTexto"])(c.etiqueta) === (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$clave$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizarTexto"])(etiqueta));
async function crearCampoPropio(entidad, entrada) {
    tabla(entidad);
    const datos = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["crearCampoSchema"].parse(entrada);
    const existentes = await obtenerCampos(entidad);
    if (etiquetaEnUso(existentes, datos.etiqueta)) throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");
    const opciones = datos.tipo === "LISTA" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["crearOpciones"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["etiquetasDeTexto"])(datos.opcionesTexto)) : [];
    const error = datos.tipo === "LISTA" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validarOpciones"])(opciones) : null;
    if (error) throw new CampoInvalidoError(error, "opcionesTexto");
    const clave = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$clave$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["claveUnica"])(datos.etiqueta, [
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$registro$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["clavesProhibidas"])(entidad),
        ...existentes.map((c)=>c.clave)
    ]);
    const orden = Math.max(0, ...existentes.filter((c)=>c.seccion === "adicionales").map((c)=>c.orden)) + 10;
    const fila = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].campoPersonalizado.create({
        data: {
            entidad,
            clave,
            etiqueta: datos.etiqueta,
            ayuda: datos.ayuda || null,
            tipo: datos.tipo,
            requerido: datos.requerido,
            unidad: datos.tipo === "NUMERO" ? datos.unidad || null : null,
            opciones: json(opciones),
            orden
        }
    });
    return aCampoPropio(fila);
}
async function actualizarCampoPropio(id, entrada, entidad) {
    const datos = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editarCampoPropioSchema"].parse(entrada);
    const fila = await filaDelModulo(id, entidad);
    const existentes = await obtenerCampos(fila.entidad);
    if (etiquetaEnUso(existentes, datos.etiqueta, fila.clave)) throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].campoPersonalizado.update({
        where: {
            id
        },
        data: {
            etiqueta: datos.etiqueta,
            ayuda: datos.ayuda || null,
            requerido: datos.requerido,
            visible: datos.visible,
            unidad: fila.tipo === "NUMERO" ? datos.unidad || null : null
        }
    });
}
async function actualizarCampoSistema(entidad, clave, entrada) {
    const definicion = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$registro$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["REGISTRO"][entidad].find((c)=>c.clave === clave);
    if (!definicion) throw new CampoInvalidoError("Ese campo no existe.");
    if (definicion.fijo) throw new CampoInvalidoError("Este campo no se puede ajustar desde Administración.");
    const datos = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editarCampoSistemaSchema"].parse(entrada);
    if (datos.oculto && !definicion.ocultable) {
        throw new CampoInvalidoError("Este campo es necesario para que el sistema funcione y no se puede ocultar.", "oculto");
    }
    const etiqueta = datos.etiqueta || null;
    if (etiqueta && etiquetaEnUso(await obtenerCampos(entidad), etiqueta, clave)) {
        throw new CampoInvalidoError("Ya hay un campo con ese nombre.", "etiqueta");
    }
    const valores = {
        etiqueta,
        ayuda: datos.ayuda || null,
        oculto: datos.oculto
    };
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].configuracionCampo.upsert({
        where: {
            entidad_clave: {
                entidad,
                clave
            }
        },
        create: {
            entidad,
            clave,
            ...valores
        },
        update: valores
    });
}
async function moverCampoAdmin(entidad, clave, direccion) {
    const campos = await obtenerCampos(entidad);
    if (campos.find((c)=>c.clave === clave)?.fijo) throw new CampoInvalidoError("Este campo no se puede mover.");
    const cambios = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$combinar$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["moverCampo"])(campos, clave, direccion);
    if (cambios.length === 0) return;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
        for (const { clave: k, orden } of cambios){
            if (campos.find((c)=>c.clave === k)?.origen === "PROPIO") {
                await tx.campoPersonalizado.update({
                    where: {
                        entidad_clave: {
                            entidad,
                            clave: k
                        }
                    },
                    data: {
                        orden
                    }
                });
            } else {
                await tx.configuracionCampo.upsert({
                    where: {
                        entidad_clave: {
                            entidad,
                            clave: k
                        }
                    },
                    create: {
                        entidad,
                        clave: k,
                        orden
                    },
                    update: {
                        orden
                    }
                });
            }
        }
    });
}
async function archivarCampoPropio(id, archivar, entidad) {
    await filaDelModulo(id, entidad);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].campoPersonalizado.update({
        where: {
            id
        },
        data: {
            archivadoEn: archivar ? new Date() : null
        }
    });
}
async function contarValores(entidad, clave) {
    const [{ n }] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$queryRaw(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Prisma$3e$__["Prisma"].sql`SELECT count(*)::int AS n FROM ${tabla(entidad)} WHERE jsonb_exists(extras, ${clave})`);
    return n;
}
async function contarUsoOpcion(entidad, clave, opcionId) {
    const [{ n }] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$queryRaw(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Prisma$3e$__["Prisma"].sql`SELECT count(*)::int AS n FROM ${tabla(entidad)} WHERE extras ->> ${clave} = ${opcionId}`);
    return n;
}
async function eliminarCampoPropio(id, { confirmar, entidad }) {
    const fila = await filaDelModulo(id, entidad);
    const afectados = await contarValores(fila.entidad, fila.clave);
    if (afectados > 0 && !confirmar) throw new ConfirmacionRequeridaError(afectados);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
        if (afectados > 0) await tx.$executeRaw(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Prisma$3e$__["Prisma"].sql`UPDATE ${tabla(fila.entidad)} SET extras = extras - ${fila.clave}::text`);
        await tx.campoPersonalizado.delete({
            where: {
                id
            }
        });
    });
    return afectados;
}
async function cambiarTipoCampo(id, tipo, { opcionesTexto = "", confirmar, entidad }) {
    const nuevoTipo = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tipoCampoSchema"].parse(tipo);
    const fila = await filaDelModulo(id, entidad);
    if (fila.tipo === nuevoTipo) return 0;
    const opciones = nuevoTipo === "LISTA" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["crearOpciones"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["etiquetasDeTexto"])(opcionesTexto)) : [];
    const error = nuevoTipo === "LISTA" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validarOpciones"])(opciones) : null;
    if (error) throw new CampoInvalidoError(error, "opcionesTexto");
    const afectados = await contarValores(fila.entidad, fila.clave);
    if (afectados > 0 && !confirmar) throw new ConfirmacionRequeridaError(afectados);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
        if (afectados > 0) await tx.$executeRaw(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$generated$2f$prisma$2f$internal$2f$prismaNamespace$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Prisma$3e$__["Prisma"].sql`UPDATE ${tabla(fila.entidad)} SET extras = extras - ${fila.clave}::text`);
        await tx.campoPersonalizado.update({
            where: {
                id
            },
            data: {
                tipo: nuevoTipo,
                opciones: json(opciones),
                unidad: nuevoTipo === "NUMERO" ? fila.unidad : null
            }
        });
    });
    return afectados;
}
async function modificarOpciones(id, operacion, entidad) {
    const fila = await filaDelModulo(id, entidad);
    if (fila.tipo !== "LISTA") throw new CampoInvalidoError("Este campo no es una lista.");
    let opciones = aCampoPropio(fila).opciones;
    switch(operacion.tipo){
        case "agregar":
            opciones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["agregarOpcion"])(opciones, operacion.etiqueta);
            break;
        case "renombrar":
            opciones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renombrarOpcion"])(opciones, operacion.opcionId, operacion.etiqueta);
            break;
        case "alternar":
            opciones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["alternarOpcion"])(opciones, operacion.opcionId, operacion.activo);
            break;
        case "quitar":
            {
                const enUso = await contarUsoOpcion(fila.entidad, fila.clave, operacion.opcionId);
                if (enUso > 0) {
                    throw new CampoInvalidoError(`La opción está en uso en ${enUso} ${enUso === 1 ? "registro" : "registros"}: desactivala en lugar de borrarla.`, "opciones");
                }
                opciones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["quitarOpcion"])(opciones, operacion.opcionId);
            }
    }
    const error = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validarOpciones"])(opciones);
    if (error) throw new CampoInvalidoError(error, "opciones");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].campoPersonalizado.update({
        where: {
            id
        },
        data: {
            opciones: json(opciones)
        }
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/modules/campos/clave.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Puro.
/** Para comparar etiquetas: sin mayúsculas, sin tildes y con espacios normalizados. */ __turbopack_context__.s([
    "claveUnica",
    ()=>claveUnica,
    "generarClave",
    ()=>generarClave,
    "normalizarTexto",
    ()=>normalizarTexto
]);
const normalizarTexto = (t)=>t.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase().replace(/\s+/g, " ");
function generarClave(etiqueta) {
    const base = normalizarTexto(etiqueta).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40).replace(/_+$/g, "");
    return base || "campo";
}
function claveUnica(etiqueta, existentes) {
    const usadas = new Set(existentes);
    const base = generarClave(etiqueta);
    if (!usadas.has(base)) return base;
    let n = 2;
    while(usadas.has(`${base}_${n}`))n++;
    return `${base}_${n}`;
}
}),
"[project]/src/modules/campos/combinar.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "camposVisibles",
    ()=>camposVisibles,
    "combinarCampos",
    ()=>combinarCampos,
    "moverCampo",
    ()=>moverCampo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$registro$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/registro.ts [app-rsc] (ecmascript)");
;
const PASO = 10;
const enBlanco = (t)=>(t ?? "").trim();
function combinarCampos(entidad, configuraciones, propios) {
    const ajustes = new Map(configuraciones.map((c)=>[
            c.clave,
            c
        ]));
    const sistema = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$registro$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["REGISTRO"][entidad].map((c, i)=>{
        const ajuste = ajustes.get(c.clave);
        return {
            clave: c.clave,
            etiqueta: enBlanco(ajuste?.etiqueta) || c.etiqueta,
            ayuda: enBlanco(ajuste?.ayuda) || c.ayuda || null,
            tipo: c.tipo,
            origen: "SISTEMA",
            seccion: c.seccion,
            requerido: c.requerido,
            protegido: c.protegido,
            fijo: c.fijo ?? false,
            ocultable: c.ocultable,
            visible: c.ocultable ? !ajuste?.oculto : true,
            archivado: false,
            orden: ajuste?.orden ?? (i + 1) * PASO,
            unidad: c.unidad ?? null,
            lista: c.lista ?? null,
            soloLectura: c.soloLectura ?? false,
            especial: c.especial ?? false,
            opciones: [],
            id: null
        };
    });
    const adicionales = propios.filter((p)=>p.entidad === entidad).map((p)=>({
            clave: p.clave,
            etiqueta: p.etiqueta,
            ayuda: p.ayuda,
            tipo: p.tipo,
            origen: "PROPIO",
            seccion: "adicionales",
            requerido: p.requerido,
            protegido: false,
            fijo: false,
            ocultable: true,
            visible: p.visible && !p.archivado,
            archivado: p.archivado,
            orden: p.orden,
            unidad: p.unidad,
            lista: null,
            soloLectura: false,
            especial: false,
            opciones: p.opciones,
            id: p.id
        }));
    const ordenSeccion = new Map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$registro$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SECCIONES"].map((s, i)=>[
            s.id,
            i
        ]));
    return [
        ...sistema,
        ...adicionales
    ].sort((a, b)=>ordenSeccion.get(a.seccion) - ordenSeccion.get(b.seccion) || a.orden - b.orden);
}
const camposVisibles = (campos)=>campos.filter((c)=>c.visible && !c.archivado);
function moverCampo(campos, clave, direccion) {
    const campo = campos.find((c)=>c.clave === clave);
    if (!campo) return [];
    const seccion = campos.filter((c)=>c.seccion === campo.seccion);
    const i = seccion.findIndex((c)=>c.clave === clave);
    const j = direccion === "ARRIBA" ? i - 1 : i + 1;
    if (j < 0 || j >= seccion.length) return [];
    const reordenada = [
        ...seccion
    ];
    [reordenada[i], reordenada[j]] = [
        reordenada[j],
        reordenada[i]
    ];
    return reordenada.map((c, n)=>({
            clave: c.clave,
            orden: (n + 1) * PASO
        }));
}
}),
"[project]/src/modules/campos/extras.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatearValor",
    ()=>formatearValor,
    "procesarExtras",
    ()=>procesarExtras
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zod$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/zod.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$tipos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/tipos.ts [app-rsc] (ecmascript)");
;
;
;
const vacioAUndefined = (v)=>v === undefined || v === null || typeof v === "string" && v.trim() === "" ? undefined : v;
const opcional = (esquema, requerido)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess(vacioAUndefined, requerido ? esquema : esquema.optional());
function fechaValida(s) {
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}
function esquemaDe(campo, valorGuardado) {
    switch(campo.tipo){
        case "SI_NO":
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((v)=>v === true || v === "on" || v === "true", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean());
        case "TEXTO":
            return opcional(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(200), campo.requerido);
        case "TEXTO_LARGO":
            return opcional(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(2000), campo.requerido);
        case "NUMERO":
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].preprocess((v)=>{
                const s = vacioAUndefined(v);
                return typeof s === "string" ? Number(s.replace(",", ".")) : s;
            }, campo.requerido ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number() : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().optional());
        case "FECHA":
            return opcional(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida").refine(fechaValida, "Fecha inválida"), campo.requerido);
        case "LISTA":
            {
                const permitidas = new Set(campo.opciones.filter((o)=>o.activo).map((o)=>o.id));
                if (typeof valorGuardado === "string") permitidas.add(valorGuardado); // no bloquear registros viejos
                return opcional(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().refine((id)=>permitidas.has(id), "Elegí una opción válida"), campo.requerido);
            }
    }
}
function procesarExtras(propios, entrada, actuales = {}, dibujados) {
    const activos = propios.filter((p)=>!p.archivado && p.visible && (!dibujados || dibujados.includes(p.clave)));
    const forma = {};
    for (const p of activos)forma[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$tipos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nombreInput"])(p.clave)] = esquemaDe(p, actuales[p.clave]);
    // Los campos ausentes (p. ej. una casilla sin tildar) se completan con `undefined` para validarlos igual que los vacíos.
    const completa = Object.fromEntries(activos.map((p)=>[
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$tipos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nombreInput"])(p.clave),
            entrada[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$tipos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nombreInput"])(p.clave)]
        ]));
    const datos = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object(forma).parse(completa);
    const resultado = {};
    for (const p of propios)if (actuales[p.clave] !== undefined) resultado[p.clave] = actuales[p.clave];
    for (const p of activos){
        const valor = datos[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$tipos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nombreInput"])(p.clave)];
        if (valor === undefined) delete resultado[p.clave];
        else resultado[p.clave] = valor;
    }
    return resultado;
}
function formatearValor(campo, valor) {
    if (valor === undefined) return "—";
    switch(campo.tipo){
        case "SI_NO":
            return valor === true ? "Sí" : "No";
        case "LISTA":
            return campo.opciones.find((o)=>o.id === valor)?.etiqueta ?? "—";
        case "NUMERO":
            return `${valor}${campo.unidad ? ` ${campo.unidad}` : ""}`;
        case "FECHA":
            {
                const [a, m, d] = String(valor).split("-");
                return `${d}/${m}/${a}`;
            }
        default:
            return String(valor);
    }
}
}),
"[project]/src/modules/campos/opciones.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agregarOpcion",
    ()=>agregarOpcion,
    "alternarOpcion",
    ()=>alternarOpcion,
    "crearOpciones",
    ()=>crearOpciones,
    "etiquetasDeTexto",
    ()=>etiquetasDeTexto,
    "generarIdOpcion",
    ()=>generarIdOpcion,
    "quitarOpcion",
    ()=>quitarOpcion,
    "renombrarOpcion",
    ()=>renombrarOpcion,
    "validarOpciones",
    ()=>validarOpciones
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$clave$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/clave.ts [app-rsc] (ecmascript)");
;
const generarIdOpcion = ()=>`o_${globalThis.crypto.randomUUID().slice(0, 8)}`;
function etiquetasDeTexto(texto) {
    return texto.split(/\r?\n/).map((e)=>e.trim()).filter((e)=>e !== "");
}
function crearOpciones(etiquetas, generarId = generarIdOpcion) {
    return etiquetas.map((e)=>e.trim()).filter((e)=>e !== "").map((etiqueta)=>({
            id: generarId(),
            etiqueta,
            activo: true
        }));
}
function validarOpciones(opciones) {
    if (opciones.some((o)=>o.etiqueta.trim() === "")) return "Una opción no puede estar vacía.";
    const vistas = new Set();
    for (const o of opciones){
        const n = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$clave$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["normalizarTexto"])(o.etiqueta);
        if (vistas.has(n)) return "Las opciones no pueden repetirse.";
        vistas.add(n);
    }
    if (!opciones.some((o)=>o.activo)) return "Dejá al menos una opción activa.";
    return null;
}
function agregarOpcion(opciones, etiqueta, generarId = generarIdOpcion) {
    return [
        ...opciones,
        {
            id: generarId(),
            etiqueta: etiqueta.trim(),
            activo: true
        }
    ];
}
const renombrarOpcion = (opciones, id, etiqueta)=>opciones.map((o)=>o.id === id ? {
            ...o,
            etiqueta: etiqueta.trim()
        } : o);
const alternarOpcion = (opciones, id, activo)=>opciones.map((o)=>o.id === id ? {
            ...o,
            activo
        } : o);
const quitarOpcion = (opciones, id)=>opciones.filter((o)=>o.id !== id);
}),
"[project]/src/modules/campos/registro.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "REGISTRO",
    ()=>REGISTRO,
    "SECCIONES",
    ()=>SECCIONES,
    "clavesProhibidas",
    ()=>clavesProhibidas,
    "clavesReservadas",
    ()=>clavesReservadas
]);
const SECCIONES = [
    {
        id: "identificacion",
        etiqueta: "Identificación"
    },
    {
        id: "principales",
        etiqueta: "Características principales"
    },
    {
        id: "compatibilidades",
        etiqueta: "Vehículos compatibles"
    },
    {
        id: "stock",
        etiqueta: "Stock y precios"
    },
    {
        id: "servicio",
        etiqueta: "Datos del servicio"
    },
    {
        id: "agenda",
        etiqueta: "Agenda y capacidad"
    },
    {
        id: "precio",
        etiqueta: "Precio"
    },
    {
        id: "adicionales",
        etiqueta: "Datos adicionales"
    }
];
const cristal = (clave, etiqueta, tipo, seccion, extra = {})=>{
    const protegido = extra.protegido ?? false;
    return {
        clave,
        etiqueta,
        tipo,
        seccion,
        requerido: protegido && clave !== "cantidad",
        protegido,
        ocultable: !protegido,
        ...extra
    };
};
/** Campo de referencia del servicio: lo usa el formulario existente y Administración solo lo muestra. */ const servicio = (clave, etiqueta, tipo, seccion, extra = {})=>({
        clave,
        etiqueta,
        tipo,
        seccion,
        requerido: false,
        protegido: true,
        ocultable: false,
        fijo: true,
        ...extra
    });
const REGISTRO = {
    CRISTAL: [
        cristal("codigo", "Código interno", "TEXTO", "identificacion", {
            protegido: true,
            ayuda: "Ej. PB-HIL-16"
        }),
        cristal("codigoFabricante", "Código de fabricante", "TEXTO", "identificacion", {
            ayuda: "Eurocode o catálogo"
        }),
        cristal("descripcion", "Descripción", "TEXTO", "identificacion", {
            protegido: true
        }),
        cristal("marcaId", "Marca", "LISTA", "principales", {
            protegido: true,
            lista: "marcas"
        }),
        cristal("tipoId", "Tipo de cristal", "LISTA", "principales", {
            protegido: true,
            lista: "tipos"
        }),
        cristal("ubicacionId", "Ubicación en el vehículo", "LISTA", "principales", {
            protegido: true,
            lista: "ubicaciones"
        }),
        cristal("lado", "Lado", "LISTA", "principales", {
            lista: "lado"
        }),
        cristal("anchoMm", "Ancho (mm)", "NUMERO", "principales", {
            unidad: "mm"
        }),
        cristal("altoMm", "Alto (mm)", "NUMERO", "principales", {
            unidad: "mm"
        }),
        cristal("espesorMm", "Espesor (mm)", "NUMERO", "principales", {
            unidad: "mm"
        }),
        cristal("compatibilidades", "Vehículos compatibles", "LISTA", "compatibilidades", {
            especial: true
        }),
        cristal("cantidad", "Cantidad", "NUMERO", "stock", {
            protegido: true,
            soloLectura: true
        }),
        cristal("stockMinimo", "Stock mínimo", "NUMERO", "stock", {
            protegido: true,
            ayuda: "Avisa cuando hay que reponer"
        }),
        cristal("ubicacionDeposito", "Ubicación en depósito", "TEXTO", "stock"),
        cristal("costo", "Costo", "NUMERO", "stock"),
        cristal("precioVenta", "Precio de venta", "NUMERO", "stock")
    ],
    SERVICIO: [
        servicio("nombre", "Nombre", "TEXTO", "servicio", {
            requerido: true
        }),
        servicio("descripcion", "Descripción", "TEXTO_LARGO", "servicio"),
        servicio("color", "Color en la agenda", "TEXTO", "servicio"),
        servicio("activo", "Activo (se ofrece en el turnero)", "SI_NO", "servicio"),
        servicio("duracionMinutos", "Duración (min)", "NUMERO", "agenda", {
            requerido: true,
            unidad: "min"
        }),
        servicio("intervaloMinutos", "Turnos cada (min)", "NUMERO", "agenda", {
            requerido: true,
            unidad: "min"
        }),
        servicio("margenMinutos", "Margen entre trabajos (min)", "NUMERO", "agenda", {
            unidad: "min"
        }),
        servicio("capacidad", "Vehículos a la vez", "NUMERO", "agenda", {
            requerido: true
        }),
        servicio("anticipacionMinutos", "Anticipación mínima", "NUMERO", "agenda", {
            requerido: true,
            unidad: "min"
        }),
        servicio("requiereCristal", "Usa un cristal del stock", "SI_NO", "agenda"),
        servicio("horarios", "Días y horarios de atención", "LISTA", "agenda", {
            requerido: true,
            especial: true
        }),
        servicio("precioBase", "Precio base", "NUMERO", "precio")
    ],
    TURNO: [],
    CLIENTE: []
};
const clavesReservadas = (entidad)=>REGISTRO[entidad].map((c)=>c.clave);
/** Segmentos fijos de la ruta /campos/[clave]: un campo propio con esa clave no se podría editar. */ const CLAVES_DE_RUTA = [
    "nuevo"
];
const clavesProhibidas = (entidad)=>[
        ...clavesReservadas(entidad),
        ...CLAVES_DE_RUTA
    ];
}),
"[project]/src/modules/campos/schemas.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "crearCampoSchema",
    ()=>crearCampoSchema,
    "editarCampoPropioSchema",
    ()=>editarCampoPropioSchema,
    "editarCampoSistemaSchema",
    ()=>editarCampoSistemaSchema,
    "tipoCampoSchema",
    ()=>tipoCampoSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zod$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/zod.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/opciones.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$tipos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/tipos.ts [app-rsc] (ecmascript)");
;
;
;
const tipoCampoSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$tipos$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TIPOS_CAMPO"]);
const etiqueta = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(60);
const ayuda = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(120).optional();
const unidad = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(12).optional();
const crearCampoSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    etiqueta,
    ayuda,
    tipo: tipoCampoSchema,
    requerido: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
    unidad,
    /** Un renglón por opción (solo para LISTA). */ opcionesTexto: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().default("")
}).superRefine((c, ctx)=>{
    if (c.tipo === "LISTA" && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$opciones$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["etiquetasDeTexto"])(c.opcionesTexto).length === 0) {
        ctx.addIssue({
            code: "custom",
            path: [
                "opcionesTexto"
            ],
            message: "Cargá al menos una opción"
        });
    }
});
const editarCampoPropioSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    etiqueta,
    ayuda,
    requerido: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
    unidad,
    visible: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean()
});
const editarCampoSistemaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    etiqueta: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(60).optional(),
    ayuda,
    oculto: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false)
});
}),
"[project]/src/modules/campos/tipos.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Tipos compartidos del motor de campos. Sin Prisma ni Next: los usan módulos puros y componentes de cliente.
__turbopack_context__.s([
    "ENTIDADES_CAMPO",
    ()=>ENTIDADES_CAMPO,
    "ETIQUETA_TIPO",
    ()=>ETIQUETA_TIPO,
    "TIPOS_CAMPO",
    ()=>TIPOS_CAMPO,
    "nombreInput",
    ()=>nombreInput
]);
const ENTIDADES_CAMPO = [
    "CRISTAL",
    "SERVICIO",
    "TURNO",
    "CLIENTE"
];
const TIPOS_CAMPO = [
    "TEXTO",
    "TEXTO_LARGO",
    "NUMERO",
    "SI_NO",
    "LISTA",
    "FECHA"
];
const ETIQUETA_TIPO = {
    TEXTO: "Texto",
    TEXTO_LARGO: "Texto largo",
    NUMERO: "Número",
    SI_NO: "Sí / No",
    LISTA: "Lista de opciones",
    FECHA: "Fecha"
};
const nombreInput = (clave)=>`extra_${clave}`;
}),
"[project]/src/modules/inventario/cristal.service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "StockInsuficienteError",
    ()=>StockInsuficienteError,
    "actualizarCristal",
    ()=>actualizarCristal,
    "buscarCristales",
    ()=>buscarCristales,
    "cambiarEstadoCristal",
    ()=>cambiarEstadoCristal,
    "crearCristal",
    ()=>crearCristal,
    "cristalesConStockBajo",
    ()=>cristalesConStockBajo,
    "obtenerCatalogos",
    ()=>obtenerCatalogos,
    "obtenerCristal",
    ()=>obtenerCristal,
    "registrarMovimiento",
    ()=>registrarMovimiento
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/campo.service.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$extras$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/modules/campos/extras.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/inventario/schemas.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
class StockInsuficienteError extends Error {
    disponible;
    constructor(disponible){
        super(`Stock insuficiente: quedan ${disponible} unidades`), this.disponible = disponible;
    }
}
const incluirDetalle = {
    marca: true,
    tipo: true,
    ubicacion: true,
    compatibilidades: {
        include: {
            modelo: {
                include: {
                    marca: true
                }
            }
        }
    }
};
async function crearCristal(input) {
    const { cantidadInicial, extrasEntrada, extrasDibujados, compatibilidades, ...datos } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["crearCristalSchema"].parse(input);
    const extras = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$extras$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["procesarExtras"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listarCamposPropios"])("CRISTAL"), extrasEntrada, {}, extrasDibujados);
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.create({
        data: {
            ...datos,
            extras,
            cantidad: cantidadInicial,
            compatibilidades: {
                create: compatibilidades
            },
            movimientos: cantidadInicial > 0 ? {
                create: {
                    tipo: "INGRESO",
                    cantidad: cantidadInicial,
                    saldo: cantidadInicial,
                    motivo: "Stock inicial"
                }
            } : undefined
        },
        include: incluirDetalle
    });
}
async function actualizarCristal(id, input) {
    const { extrasEntrada, extrasDibujados, compatibilidades, ...datos } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["actualizarCristalSchema"].parse(input);
    let extras;
    if (extrasEntrada) {
        const actual = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.findUniqueOrThrow({
            where: {
                id
            },
            select: {
                extras: true
            }
        });
        extras = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$extras$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["procesarExtras"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listarCamposPropios"])("CRISTAL"), extrasEntrada, actual.extras, extrasDibujados);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.update({
        where: {
            id
        },
        data: {
            ...datos,
            ...extras && {
                extras
            },
            compatibilidades: compatibilidades && {
                deleteMany: {},
                create: compatibilidades
            }
        },
        include: incluirDetalle
    });
}
async function registrarMovimiento(input) {
    const mov = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["movimientoStockSchema"].parse(input);
    const delta = mov.tipo === "EGRESO" ? -mov.cantidad : mov.cantidad;
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
        const { count } = await tx.cristal.updateMany({
            where: {
                id: mov.cristalId,
                ...delta < 0 && {
                    cantidad: {
                        gte: -delta
                    }
                }
            },
            data: {
                cantidad: {
                    increment: delta
                }
            }
        });
        const cristal = await tx.cristal.findUniqueOrThrow({
            where: {
                id: mov.cristalId
            },
            select: {
                cantidad: true
            }
        });
        if (count === 0) throw new StockInsuficienteError(cristal.cantidad);
        return tx.movimientoStock.create({
            data: {
                cristalId: mov.cristalId,
                tipo: mov.tipo,
                cantidad: delta,
                saldo: cristal.cantidad,
                motivo: mov.motivo,
                turnoId: mov.turnoId
            }
        });
    });
}
async function buscarCristales(input = {}) {
    const f = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["busquedaCristalSchema"].parse(input);
    const where = {
        activo: f.incluirInactivos ? undefined : true,
        ubicacionId: f.ubicacionId,
        tipoId: f.tipoId,
        ...f.soloConStock && {
            cantidad: {
                gt: 0
            }
        },
        ...f.texto && {
            OR: [
                {
                    codigo: {
                        contains: f.texto,
                        mode: "insensitive"
                    }
                },
                {
                    codigoFabricante: {
                        contains: f.texto,
                        mode: "insensitive"
                    }
                },
                {
                    descripcion: {
                        contains: f.texto,
                        mode: "insensitive"
                    }
                }
            ]
        },
        ...f.modeloId && {
            compatibilidades: {
                some: {
                    modeloId: f.modeloId,
                    ...f.anio && {
                        AND: [
                            {
                                OR: [
                                    {
                                        anioDesde: null
                                    },
                                    {
                                        anioDesde: {
                                            lte: f.anio
                                        }
                                    }
                                ]
                            },
                            {
                                OR: [
                                    {
                                        anioHasta: null
                                    },
                                    {
                                        anioHasta: {
                                            gte: f.anio
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.findMany({
        where,
        include: incluirDetalle,
        orderBy: [
            {
                ubicacion: {
                    orden: "asc"
                }
            },
            {
                descripcion: "asc"
            }
        ]
    });
}
async function cristalesConStockBajo() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.findMany({
        where: {
            activo: true,
            cantidad: {
                lte: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.fields.stockMinimo
            }
        },
        include: {
            marca: true,
            ubicacion: true
        },
        orderBy: {
            cantidad: "asc"
        }
    });
}
function obtenerCristal(id) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.findUnique({
        where: {
            id
        },
        include: {
            ...incluirDetalle,
            movimientos: {
                orderBy: {
                    creadoEn: "desc"
                },
                take: 50,
                include: {
                    turno: {
                        select: {
                            id: true,
                            inicio: true
                        }
                    }
                }
            }
        }
    });
}
function cambiarEstadoCristal(id, activo) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.update({
        where: {
            id
        },
        data: {
            activo
        }
    });
}
async function obtenerCatalogos({ incluirInactivos = false, conservar = [] } = {}) {
    const visibles = incluirInactivos ? undefined : {
        OR: [
            {
                activo: true
            },
            {
                id: {
                    in: conservar
                }
            }
        ]
    };
    const [marcas, tipos, ubicaciones, marcasVehiculo] = await Promise.all([
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].marcaCristal.findMany({
            where: visibles,
            orderBy: {
                nombre: "asc"
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].tipoCristal.findMany({
            where: visibles,
            orderBy: {
                nombre: "asc"
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].ubicacionVehiculo.findMany({
            where: visibles,
            orderBy: {
                orden: "asc"
            }
        }),
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].marcaVehiculo.findMany({
            where: visibles,
            orderBy: {
                nombre: "asc"
            },
            include: {
                modelos: {
                    where: visibles,
                    orderBy: {
                        nombre: "asc"
                    }
                }
            }
        })
    ]);
    return {
        marcas,
        tipos,
        ubicaciones,
        marcasVehiculo
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/modules/inventario/schemas.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "actualizarCristalSchema",
    ()=>actualizarCristalSchema,
    "busquedaCristalSchema",
    ()=>busquedaCristalSchema,
    "compatibilidadSchema",
    ()=>compatibilidadSchema,
    "crearCristalSchema",
    ()=>crearCristalSchema,
    "movimientoStockSchema",
    ()=>movimientoStockSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zod$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/zod.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
;
const anio = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1950).max(2100);
const compatibilidadSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    modeloId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    anioDesde: anio.optional(),
    anioHasta: anio.optional(),
    carroceria: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(60).optional(),
    notas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(200).optional()
}).refine((c)=>!c.anioDesde || !c.anioHasta || c.anioDesde <= c.anioHasta, {
    message: "El año desde no puede ser mayor que el año hasta",
    path: [
        "anioHasta"
    ]
});
/** Campos de un cristal SIN valores por defecto: sirve de base para alta y edición. */ const camposCristal = {
    codigo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(1).max(40).toUpperCase(),
    codigoFabricante: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(40).optional(),
    descripcion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(3).max(200),
    marcaId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    tipoId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    ubicacionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    lado: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "NO_APLICA",
        "IZQUIERDO",
        "DERECHO"
    ]),
    anchoMm: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
    altoMm: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().positive().optional(),
    espesorMm: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().positive().max(99).optional(),
    stockMinimo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0),
    ubicacionDeposito: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(40).optional(),
    costo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    precioVenta: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    compatibilidades: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(compatibilidadSchema),
    /** Valores del formulario de los campos propios (`extra_<clave>`); el servicio los valida con la definición de cada campo. */ extrasEntrada: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown()),
    /** Claves de los campos que el formulario mostró: lo que no se mostró no se toca (ver `procesarExtras`). */ extrasDibujados: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional()
};
const crearCristalSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    ...camposCristal,
    lado: camposCristal.lado.default("NO_APLICA"),
    cantidadInicial: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).default(0),
    stockMinimo: camposCristal.stockMinimo.default(0),
    compatibilidades: camposCristal.compatibilidades.default([]),
    extrasEntrada: camposCristal.extrasEntrada.default({})
});
const actualizarCristalSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object(camposCristal).partial();
const movimientoStockSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    cristalId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    tipo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        "INGRESO",
        "EGRESO",
        "AJUSTE"
    ]),
    // INGRESO/EGRESO: cantidad positiva. AJUSTE: diferencia con signo (-2 = faltan dos).
    cantidad: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().refine((n)=>n !== 0, "La cantidad no puede ser 0"),
    motivo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(200).optional(),
    turnoId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
}).refine((m)=>m.tipo === "AJUSTE" || m.cantidad > 0, {
    message: "Para ingresos y egresos la cantidad debe ser positiva",
    path: [
        "cantidad"
    ]
});
const busquedaCristalSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    texto: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().optional(),
    modeloId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    anio: anio.optional(),
    ubicacionId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    tipoId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    soloConStock: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
    incluirInactivos: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false)
});
}),
"[project]/src/modules/pagos/decision.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decidirPago",
    ()=>decidirPago
]);
const IGNORAR = {
    accion: "ignorar"
};
const devolver = (motivo)=>({
        accion: "devolver",
        motivo
    });
function decidirPago(mp, ctx) {
    if (ctx.yaAplicado) return IGNORAR;
    if (mp.estado === "rejected" || mp.estado === "cancelled") {
        return ctx.pagoEstado === "PENDIENTE" ? {
            accion: "rechazar"
        } : IGNORAR;
    }
    if (mp.estado !== "approved") return IGNORAR;
    // Desde acá el pago está aprobado.
    if (ctx.pagoEstado === "APROBADO") return devolver("pago_duplicado");
    if (mp.moneda !== "ARS" || Math.abs(mp.monto - ctx.montoEsperado) > 0.005) return devolver("monto_distinto");
    if (ctx.turnoEstado === "ESPERANDO_PAGO" && !ctx.venceEnPasado) return {
        accion: "confirmar"
    };
    // Venció (aún figura esperando, o el barrido ya lo canceló y marcó el pago VENCIDO): confirma solo si el horario sigue libre.
    const vencido = ctx.turnoEstado === "ESPERANDO_PAGO" && ctx.venceEnPasado || ctx.turnoEstado === "CANCELADO" && ctx.pagoEstado === "VENCIDO";
    if (vencido) return ctx.horarioLibre ? {
        accion: "confirmar"
    } : devolver("horario_tomado");
    return devolver("turno_cancelado");
}
}),
"[project]/src/modules/pagos/pagos.service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "CobroNoDisponibleError",
    ()=>CobroNoDisponibleError,
    "aplicarPagoMp",
    ()=>aplicarPagoMp,
    "iniciarCobro",
    ()=>iniciarCobro,
    "liberarVencidos",
    ()=>liberarVencidos,
    "listarPagosParaDevolver",
    ()=>listarPagosParaDevolver,
    "marcarDevuelto",
    ()=>marcarDevuelto,
    "sincronizarPago",
    ()=>sincronizarPago
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mercadopago$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mercadopago.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tiempo.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/turnos/servicio.service.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$decision$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/pagos/decision.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
class CobroNoDisponibleError extends Error {
    constructor(){
        super("No se pudo iniciar el cobro de la seña");
    }
}
async function iniciarCobro(pagoId) {
    const pago = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].pago.findUniqueOrThrow({
        where: {
            id: pagoId
        },
        include: {
            turno: {
                include: {
                    servicio: true,
                    cliente: true
                }
            }
        }
    });
    try {
        const urlApp = process.env.APP_URL;
        if (!urlApp) throw new Error("Falta APP_URL en .env");
        if (!pago.turno.venceEn) throw new Error("El turno no tiene vencimiento");
        const preferencia = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mercadopago$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["crearPreferencia"])({
            pagoId: pago.id,
            turnoId: pago.turnoId,
            titulo: `Seña · ${pago.turno.servicio.nombre}`,
            monto: Number(pago.monto),
            nombreCliente: pago.turno.cliente.nombre,
            emailCliente: pago.turno.cliente.email ?? undefined,
            venceEn: pago.turno.venceEn,
            ahora: new Date(),
            urlApp
        });
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].pago.update({
            where: {
                id: pago.id
            },
            data: {
                mpPreferenciaId: preferencia.id,
                mpInitPoint: preferencia.initPoint
            }
        });
        return {
            urlPago: preferencia.initPoint
        };
    } catch (error) {
        console.error("No se pudo crear la preferencia de Mercado Pago:", error);
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.update({
                where: {
                    id: pago.turnoId
                },
                data: {
                    estado: "CANCELADO"
                }
            }),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].pago.update({
                where: {
                    id: pago.id
                },
                data: {
                    estado: "VENCIDO"
                }
            })
        ]);
        throw new CobroNoDisponibleError();
    }
}
async function liberarVencidos(ahora = new Date()) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
        // Una sola sentencia que elige y cancela: si un pago se aplica al mismo tiempo, Postgres vuelve a evaluar la
        // condición cuando se libera la fila y un turno recién confirmado ya no coincide (no se lo cancela).
        const cancelados = await tx.turno.updateManyAndReturn({
            where: {
                estado: "ESPERANDO_PAGO",
                venceEn: {
                    lte: ahora
                }
            },
            data: {
                estado: "CANCELADO"
            },
            select: {
                id: true
            }
        });
        if (cancelados.length === 0) return 0;
        await tx.pago.updateMany({
            where: {
                turnoId: {
                    in: cancelados.map((t)=>t.id)
                },
                estado: {
                    in: [
                        "PENDIENTE",
                        "RECHAZADO"
                    ]
                }
            },
            data: {
                estado: "VENCIDO"
            }
        });
        return cancelados.length;
    });
}
const TEXTO_MOTIVO = {
    monto_distinto: "El monto cobrado no coincide con la seña",
    horario_tomado: "Pagó después de que venciera y el horario ya lo tomó otro",
    turno_cancelado: "Pagó un turno que ya estaba cancelado",
    pago_duplicado: "Pago duplicado"
};
async function aplicarPagoMp(mp) {
    if (!mp.referencia) return {
        tipo: "no_encontrado"
    };
    const previo = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].pago.findUnique({
        where: {
            id: mp.referencia
        },
        select: {
            id: true,
            turno: {
                select: {
                    servicioId: true
                }
            }
        }
    });
    if (!previo) return {
        tipo: "no_encontrado"
    };
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${previo.turno.servicioId}))`;
        const pago = await tx.pago.findUniqueOrThrow({
            where: {
                id: previo.id
            },
            include: {
                turno: true
            }
        });
        const turno = pago.turno;
        let horarioLibre = false;
        if (mp.estado === "approved") {
            const libres = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["disponibilidadDelDia"])(tx, turno.servicioId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fechaLocal"])(turno.inicio));
            horarioLibre = libres.some((t)=>t.inicio.getTime() === turno.inicio.getTime());
        }
        const decision = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$decision$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decidirPago"])(mp, {
            montoEsperado: Number(pago.monto),
            pagoEstado: pago.estado,
            yaAplicado: pago.mpPagoId === mp.id || (pago.motivoDevolucion ?? "").includes(`#${mp.id}`),
            turnoEstado: turno.estado,
            venceEnPasado: !!turno.venceEn && turno.venceEn <= new Date(),
            horarioLibre
        });
        switch(decision.accion){
            case "confirmar":
                await tx.pago.update({
                    where: {
                        id: pago.id
                    },
                    data: {
                        estado: "APROBADO",
                        mpPagoId: mp.id
                    }
                });
                await tx.turno.update({
                    where: {
                        id: turno.id
                    },
                    data: {
                        estado: "CONFIRMADO",
                        venceEn: null
                    }
                });
                return {
                    tipo: "confirmado"
                };
            case "rechazar":
                await tx.pago.update({
                    where: {
                        id: pago.id
                    },
                    data: {
                        estado: "RECHAZADO"
                    }
                });
                return {
                    tipo: "rechazado"
                };
            case "devolver":
                {
                    const detalle = `${TEXTO_MOTIVO[decision.motivo]} (Mercado Pago #${mp.id})`;
                    if (decision.motivo === "pago_duplicado") {
                        // El primer pago sigue siendo el válido: solo se anota el duplicado para devolverlo.
                        await tx.pago.update({
                            where: {
                                id: pago.id
                            },
                            data: {
                                requiereDevolucion: true,
                                devueltoEn: null,
                                motivoDevolucion: [
                                    pago.motivoDevolucion,
                                    detalle
                                ].filter(Boolean).join(" · ")
                            }
                        });
                    } else {
                        await tx.pago.update({
                            where: {
                                id: pago.id
                            },
                            data: {
                                estado: "APROBADO",
                                mpPagoId: mp.id,
                                requiereDevolucion: true,
                                motivoDevolucion: detalle
                            }
                        });
                        if (turno.estado === "ESPERANDO_PAGO") {
                            await tx.turno.update({
                                where: {
                                    id: turno.id
                                },
                                data: {
                                    estado: "CANCELADO"
                                }
                            });
                        }
                    }
                    return {
                        tipo: "a_devolver"
                    };
                }
            default:
                return {
                    tipo: "ignorado"
                };
        }
    });
}
async function sincronizarPago(turnoId) {
    const pago = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].pago.findFirst({
        where: {
            turnoId,
            estado: {
                not: "APROBADO"
            }
        },
        orderBy: {
            creadoEn: "desc"
        },
        select: {
            id: true
        }
    });
    if (!pago) return;
    try {
        for (const p of (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mercadopago$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buscarPagosPorReferencia"])(pago.id)))await aplicarPagoMp(p);
    } catch (error) {
        console.error("No se pudo sincronizar el pago con Mercado Pago:", error);
    }
}
function listarPagosParaDevolver() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].pago.findMany({
        where: {
            requiereDevolucion: true,
            devueltoEn: null
        },
        include: {
            turno: {
                include: {
                    cliente: true,
                    servicio: {
                        select: {
                            nombre: true
                        }
                    }
                }
            }
        },
        orderBy: {
            actualizadoEn: "desc"
        }
    });
}
async function marcarDevuelto(pagoId) {
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].pago.update({
        where: {
            id: pagoId
        },
        data: {
            devueltoEn: new Date()
        }
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/modules/pagos/sena.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Reglas puras de la seña. Sin base de datos: se prueban solas.
/** Parte del precio base que se cobra como seña. */ __turbopack_context__.s([
    "MINUTOS_RETENCION",
    ()=>MINUTOS_RETENCION,
    "PORCENTAJE_SENA",
    ()=>PORCENTAJE_SENA,
    "calcularSena",
    ()=>calcularSena
]);
const PORCENTAJE_SENA = 0.5;
const MINUTOS_RETENCION = 8;
function calcularSena(precioBase) {
    if (precioBase === null || precioBase === undefined) return null;
    const precio = Number(precioBase.toString());
    if (!Number.isFinite(precio) || precio <= 0) return null;
    const sena = Math.round(precio * PORCENTAJE_SENA);
    return sena > 0 ? sena : null;
}
}),
"[project]/src/modules/pagos/vista.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "vistaConfirmacion",
    ()=>vistaConfirmacion
]);
const CONFIRMADOS = [
    "CONFIRMADO",
    "EN_CURSO",
    "COMPLETADO"
];
function vistaConfirmacion({ turnoEstado, venceEn, pago, ahora }) {
    if (turnoEstado === "ESPERANDO_PAGO") {
        // Vencido y todavía sin barrer: el cliente no tiene turno, aunque la base aún diga "esperando".
        return venceEn && venceEn > ahora ? {
            tipo: "esperando",
            pagoDeMas: false
        } : {
            tipo: "no_completado"
        };
    }
    // Un turno confirmado gana: un pago duplicado a devolver no le quita el turno al cliente.
    if (CONFIRMADOS.includes(turnoEstado)) return {
        tipo: "confirmado",
        pagoDeMas: !!pago?.requiereDevolucion
    };
    if (turnoEstado === "CANCELADO") {
        return pago?.requiereDevolucion ? {
            tipo: "sin_turno",
            devuelto: pago.devuelto
        } : {
            tipo: "no_completado"
        };
    }
    return {
        tipo: "reservado"
    };
}
}),
"[project]/src/modules/turnos/codigo.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALFABETO_CODIGO",
    ()=>ALFABETO_CODIGO,
    "LARGO_CODIGO",
    ()=>LARGO_CODIGO,
    "esCodigoValido",
    ()=>esCodigoValido,
    "generarCodigo",
    ()=>generarCodigo,
    "normalizarCodigo",
    ()=>normalizarCodigo
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
;
const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const LARGO_CODIGO = 6;
function generarCodigo(azar = (max)=>(0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["randomInt"])(max)) {
    let codigo = "";
    for(let i = 0; i < LARGO_CODIGO; i++)codigo += ALFABETO_CODIGO[azar(ALFABETO_CODIGO.length)];
    return codigo;
}
const normalizarCodigo = (texto)=>texto.trim().toUpperCase().replace(/\s+/g, "");
const esCodigoValido = (codigo)=>/^[A-Z0-9]{6}$/.test(codigo);
}),
"[project]/src/modules/turnos/disponibilidad.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calcularDisponibilidad",
    ()=>calcularDisponibilidad
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tiempo.ts [app-rsc] (ecmascript)");
;
const seSuperponen = (a, b)=>a.inicio < b.fin && b.inicio < a.fin;
/** Máxima cantidad de intervalos simultáneos dentro de `ventana`. */ function maximoSimultaneo(intervalos, ventana) {
    const eventos = [];
    for (const i of intervalos){
        if (!seSuperponen(i, ventana)) continue;
        eventos.push([
            Math.max(i.inicio.getTime(), ventana.inicio.getTime()),
            +1
        ]);
        eventos.push([
            Math.min(i.fin.getTime(), ventana.fin.getTime()),
            -1
        ]);
    }
    // Ante empate, primero los cierres: un turno que termina 10:00 libera el box para otro que empieza 10:00.
    eventos.sort((a, b)=>a[0] - b[0] || a[1] - b[1]);
    let actual = 0;
    let maximo = 0;
    for (const [, delta] of eventos){
        actual += delta;
        maximo = Math.max(maximo, actual);
    }
    return maximo;
}
function calcularDisponibilidad({ fecha, servicio, turnos = [], bloqueos = [], ahora = new Date() }) {
    const { duracionMinutos, intervaloMinutos, margenMinutos, capacidad } = servicio;
    const dia = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["diaSemana"])(fecha);
    const inicioMinimo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sumarMinutos"])(ahora, servicio.anticipacionMinutos);
    // Cada trabajo ocupa su duración más el margen de preparación posterior.
    const ocupados = turnos.map((t)=>({
            inicio: t.inicio,
            fin: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sumarMinutos"])(t.fin, margenMinutos)
        }));
    const resultado = [];
    const franjas = servicio.horarios.filter((f)=>f.diaSemana === dia).sort((a, b)=>a.horaInicio - b.horaInicio);
    for (const franja of franjas){
        for(let m = franja.horaInicio; m + duracionMinutos <= franja.horaFin; m += intervaloMinutos){
            const inicio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instanteLocal"])(fecha, m);
            const fin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sumarMinutos"])(inicio, duracionMinutos);
            if (inicio < inicioMinimo) continue;
            if (bloqueos.some((b)=>seSuperponen(b, {
                    inicio,
                    fin
                }))) continue;
            const ventana = {
                inicio,
                fin: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sumarMinutos"])(fin, margenMinutos)
            };
            const cuposLibres = capacidad - maximoSimultaneo(ocupados, ventana);
            if (cuposLibres > 0) resultado.push({
                inicio,
                fin,
                cuposLibres
            });
        }
    }
    return resultado;
}
}),
"[project]/src/modules/turnos/edicion.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ESTADOS_EDITABLES",
    ()=>ESTADOS_EDITABLES,
    "cambiaAgenda",
    ()=>cambiaAgenda,
    "puedeEditar",
    ()=>puedeEditar
]);
const ESTADOS_EDITABLES = [
    "PENDIENTE",
    "CONFIRMADO",
    "EN_CURSO"
];
const puedeEditar = (estado)=>ESTADOS_EDITABLES.includes(estado);
function cambiaAgenda(actual, nuevo) {
    return actual.servicioId !== nuevo.servicioId || actual.inicio.getTime() !== nuevo.inicio.getTime();
}
}),
"[project]/src/modules/turnos/schemas.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "editarTurnoSchema",
    ()=>editarTurnoSchema,
    "franjaSchema",
    ()=>franjaSchema,
    "reservaSchema",
    ()=>reservaSchema,
    "servicioSchema",
    ()=>servicioSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zod$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/zod.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tiempo.ts [app-rsc] (ecmascript)");
;
;
const hora = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Formato HH:MM").transform(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["horaAMinutos"]);
const franjaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    diaSemana: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(6),
    desde: hora,
    hasta: hora
}).refine((f)=>f.hasta > f.desde, {
    message: "La hora de cierre debe ser posterior a la de apertura",
    path: [
        "hasta"
    ]
}).transform((f)=>({
        diaSemana: f.diaSemana,
        horaInicio: f.desde,
        horaFin: f.hasta
    }));
const aSlug = (texto)=>texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const servicioSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    nombre: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(2).max(60),
    slug: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().optional(),
    descripcion: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(500).optional(),
    duracionMinutos: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(5).max(24 * 60),
    intervaloMinutos: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(5).max(24 * 60).default(30),
    margenMinutos: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).max(240).default(0),
    capacidad: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(20).default(1),
    anticipacionMinutos: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(0).default(60),
    precioBase: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    color: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal #RRGGBB").default("#FDDD3D"),
    requiereCristal: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(false),
    activo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean().default(true),
    orden: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().default(0),
    horarios: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(franjaSchema).min(1, "El servicio necesita al menos una franja horaria"),
    // Campos propios (Administración): controles `extra_<clave>` del formulario. Se validan en el servicio.
    extrasEntrada: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(), __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].unknown()).optional(),
    extrasDibujados: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()).optional()
}).superRefine((s, ctx)=>{
    const porDia = new Map();
    for (const f of s.horarios)porDia.set(f.diaSemana, [
        ...porDia.get(f.diaSemana) ?? [],
        f
    ]);
    for (const [dia, franjas] of porDia){
        franjas.sort((a, b)=>a.horaInicio - b.horaInicio);
        for(let i = 1; i < franjas.length; i++){
            if (franjas[i].horaInicio < franjas[i - 1].horaFin) {
                ctx.addIssue({
                    code: "custom",
                    path: [
                        "horarios"
                    ],
                    message: `Hay franjas superpuestas el día ${dia}`
                });
            }
        }
    }
    const franjaMasLarga = Math.max(...s.horarios.map((f)=>f.horaFin - f.horaInicio));
    if (s.duracionMinutos > franjaMasLarga) {
        ctx.addIssue({
            code: "custom",
            path: [
                "duracionMinutos"
            ],
            message: "La duración no entra en ninguna franja: el servicio no tendría turnos disponibles"
        });
    }
}).transform((s)=>({
        ...s,
        slug: s.slug || aSlug(s.nombre)
    }));
const reservaSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    servicioId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    inicio: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date(),
    cliente: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        nombre: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(2).max(100),
        telefono: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(6).max(30),
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].email().optional()
    }),
    vehiculo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(100).optional(),
    patente: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().toUpperCase().max(10).optional(),
    cristalId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    notas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(500).optional()
});
const editarTurnoSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    servicioId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1),
    inicio: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].coerce.date(),
    cliente: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        nombre: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(2).max(100),
        telefono: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(6).max(30),
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].email().optional()
    }),
    vehiculo: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(100).optional(),
    patente: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().toUpperCase().max(10).optional(),
    cristalId: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    precio: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().min(0).optional(),
    notas: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(500).optional()
});
}),
"[project]/src/modules/turnos/servicio.service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "CondicionesNoAceptadasError",
    ()=>CondicionesNoAceptadasError,
    "TurnoNoDisponibleError",
    ()=>TurnoNoDisponibleError,
    "actualizarServicio",
    ()=>actualizarServicio,
    "cambiarEstadoServicio",
    ()=>cambiarEstadoServicio,
    "crearServicio",
    ()=>crearServicio,
    "disponibilidadDelDia",
    ()=>disponibilidadDelDia,
    "eliminarServicio",
    ()=>eliminarServicio,
    "listarServicios",
    ()=>listarServicios,
    "obtenerDisponibilidad",
    ()=>obtenerDisponibilidad,
    "obtenerServicio",
    ()=>obtenerServicio,
    "obtenerServicioReservable",
    ()=>obtenerServicioReservable,
    "reservarTurno",
    ()=>reservarTurno
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tiempo.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$sena$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/pagos/sena.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/campos/campo.service.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$extras$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/modules/campos/extras.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$codigo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/turnos/codigo.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$disponibilidad$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/turnos/disponibilidad.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/turnos/schemas.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
;
;
class TurnoNoDisponibleError extends Error {
    constructor(){
        super("El horario elegido ya no está disponible");
    }
}
class CondicionesNoAceptadasError extends Error {
    constructor(){
        super("Hay que aceptar las condiciones de la seña");
    }
}
function listarServicios({ incluirArchivados = false } = {}) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.findMany({
        where: incluirArchivados ? undefined : {
            archivadoEn: null
        },
        include: {
            horarios: {
                orderBy: [
                    {
                        diaSemana: "asc"
                    },
                    {
                        horaInicio: "asc"
                    }
                ]
            }
        },
        orderBy: [
            {
                orden: "asc"
            },
            {
                nombre: "asc"
            }
        ]
    });
}
function obtenerServicio(id) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.findUnique({
        where: {
            id
        },
        include: {
            horarios: {
                orderBy: [
                    {
                        diaSemana: "asc"
                    },
                    {
                        horaInicio: "asc"
                    }
                ]
            }
        }
    });
}
function obtenerServicioReservable(slug) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.findFirst({
        where: {
            slug,
            activo: true,
            archivadoEn: null
        },
        include: {
            horarios: true
        }
    });
}
function cambiarEstadoServicio(id, activo) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.update({
        where: {
            id
        },
        data: {
            activo
        }
    });
}
async function crearServicio(input) {
    const { horarios, extrasEntrada, extrasDibujados, ...datos } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["servicioSchema"].parse(input);
    // Sin entrada de extras (otro origen que el formulario) no se validan los campos propios.
    const extras = extrasEntrada ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$extras$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["procesarExtras"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listarCamposPropios"])("SERVICIO"), extrasEntrada, {}, extrasDibujados) : {};
    // Si no se indica un orden, el servicio nuevo va al final del listado.
    const { _max } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.aggregate({
        _max: {
            orden: true
        }
    });
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.create({
        data: {
            ...datos,
            extras,
            orden: input.orden ?? (_max.orden ?? 0) + 1,
            horarios: {
                create: horarios
            }
        },
        include: {
            horarios: true
        }
    });
}
async function actualizarServicio(id, input) {
    const { horarios, extrasEntrada, extrasDibujados, ...datos } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["servicioSchema"].parse(input);
    let extras;
    if (extrasEntrada) {
        const actual = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.findUniqueOrThrow({
            where: {
                id
            },
            select: {
                extras: true
            }
        });
        extras = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$extras$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["procesarExtras"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$campos$2f$campo$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["listarCamposPropios"])("SERVICIO"), extrasEntrada, actual.extras, extrasDibujados);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.update({
        where: {
            id
        },
        data: {
            ...datos,
            ...extras && {
                extras
            },
            horarios: {
                deleteMany: {},
                create: horarios
            }
        },
        include: {
            horarios: true
        }
    });
}
async function eliminarServicio(id) {
    const turnos = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.count({
        where: {
            servicioId: id
        }
    });
    if (turnos === 0) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.delete({
            where: {
                id
            }
        });
        return {
            resultado: "eliminado"
        };
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].servicio.update({
        where: {
            id
        },
        data: {
            activo: false,
            archivadoEn: new Date()
        }
    });
    return {
        resultado: "archivado"
    };
}
async function disponibilidadDelDia(cliente, servicioId, fecha, excluirTurnoId) {
    const servicio = await cliente.servicio.findUnique({
        where: {
            id: servicioId
        },
        include: {
            horarios: true
        }
    });
    if (!servicio || !servicio.activo) return [];
    const desde = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instanteLocal"])(fecha, 0);
    const hasta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sumarMinutos"])(desde, 24 * 60);
    const enElDia = {
        inicio: {
            lt: hasta
        },
        fin: {
            gt: desde
        }
    };
    // Consultas en secuencia: dentro de una transacción comparten una sola conexión.
    const turnos = await cliente.turno.findMany({
        where: {
            servicioId,
            estado: {
                notIn: [
                    "CANCELADO",
                    "AUSENTE"
                ]
            },
            // Un turno esperando el pago que ya venció no ocupa el horario, aunque el barrido todavía no lo haya cancelado.
            NOT: {
                estado: "ESPERANDO_PAGO",
                venceEn: {
                    lte: new Date()
                }
            },
            ...enElDia,
            ...excluirTurnoId && {
                id: {
                    not: excluirTurnoId
                }
            }
        },
        select: {
            inicio: true,
            fin: true
        }
    });
    const bloqueos = await cliente.bloqueoAgenda.findMany({
        where: {
            OR: [
                {
                    servicioId
                },
                {
                    servicioId: null
                }
            ],
            ...enElDia
        },
        select: {
            inicio: true,
            fin: true
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$disponibilidad$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calcularDisponibilidad"])({
        fecha,
        servicio,
        turnos,
        bloqueos
    });
}
function obtenerDisponibilidad(servicioId, fecha, excluirTurnoId) {
    return disponibilidadDelDia(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], servicioId, fecha, excluirTurnoId);
}
/** Código de reserva que todavía no usa ningún turno. */ async function codigoLibre(tx) {
    for(let i = 0; i < 10; i++){
        const codigo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$codigo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generarCodigo"])();
        if (!await tx.turno.findUnique({
            where: {
                codigo
            },
            select: {
                id: true
            }
        })) return codigo;
    }
    throw new Error("No se pudo generar un código de reserva único");
}
async function reservarTurno(input, { omitirSena = false, aceptoCondiciones = false } = {}) {
    const r = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["reservaSchema"].parse(input);
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${r.servicioId}))`;
        const libres = await disponibilidadDelDia(tx, r.servicioId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fechaLocal"])(r.inicio));
        const elegido = libres.find((t)=>t.inicio.getTime() === r.inicio.getTime());
        if (!elegido) throw new TurnoNoDisponibleError();
        const servicio = await tx.servicio.findUniqueOrThrow({
            where: {
                id: r.servicioId
            }
        });
        const sena = omitirSena ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$sena$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["calcularSena"])(servicio.precioBase);
        if (sena !== null && !aceptoCondiciones) throw new CondicionesNoAceptadasError();
        const cliente = await tx.cliente.findFirst({
            where: {
                telefono: r.cliente.telefono
            }
        }) ?? await tx.cliente.create({
            data: r.cliente
        });
        const ahora = new Date();
        const turno = await tx.turno.create({
            data: {
                codigo: await codigoLibre(tx),
                servicioId: r.servicioId,
                clienteId: cliente.id,
                inicio: elegido.inicio,
                fin: elegido.fin,
                estado: sena === null ? "PENDIENTE" : "ESPERANDO_PAGO",
                venceEn: sena === null ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sumarMinutos"])(ahora, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$pagos$2f$sena$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MINUTOS_RETENCION"]),
                precio: servicio.precioBase,
                vehiculo: r.vehiculo,
                patente: r.patente,
                cristalId: r.cristalId,
                notas: r.notas,
                pagos: sena === null ? undefined : {
                    create: {
                        monto: sena,
                        aceptoCondicionesEn: ahora
                    }
                }
            },
            include: {
                servicio: true,
                cliente: true,
                pagos: {
                    select: {
                        id: true
                    }
                }
            }
        });
        return {
            turno,
            pagoId: turno.pagos[0]?.id ?? null
        };
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/modules/turnos/turno.service.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "TurnoNoEditableError",
    ()=>TurnoNoEditableError,
    "asignarCristal",
    ()=>asignarCristal,
    "cambiarEstadoTurno",
    ()=>cambiarEstadoTurno,
    "contarTurnosPorDia",
    ()=>contarTurnosPorDia,
    "cristalesDisponibles",
    ()=>cristalesDisponibles,
    "editarTurno",
    ()=>editarTurno,
    "listarTurnosDelDia",
    ()=>listarTurnosDelDia,
    "obtenerTurno",
    ()=>obtenerTurno,
    "obtenerTurnoParaEditar",
    ()=>obtenerTurnoParaEditar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tiempo.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$cristal$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/inventario/cristal.service.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$edicion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/turnos/edicion.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/turnos/schemas.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/turnos/servicio.service.ts [app-rsc] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$cristal$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$cristal$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
/** Rango UTC [desde, hasta) que cubre los días locales indicados. */ function rangoDias(fecha, dias = 1) {
    const desde = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instanteLocal"])(fecha, 0);
    return {
        gte: desde,
        lt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sumarMinutos"])(desde, dias * 24 * 60)
    };
}
function listarTurnosDelDia(fecha) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.findMany({
        where: {
            inicio: rangoDias(fecha)
        },
        include: {
            servicio: {
                select: {
                    nombre: true,
                    color: true,
                    requiereCristal: true
                }
            },
            cliente: true,
            cristal: {
                select: {
                    id: true,
                    codigo: true,
                    descripcion: true,
                    cantidad: true
                }
            },
            pagos: {
                where: {
                    estado: "APROBADO"
                },
                select: {
                    monto: true
                }
            }
        },
        orderBy: [
            {
                inicio: "asc"
            },
            {
                creadoEn: "asc"
            }
        ]
    });
}
async function contarTurnosPorDia(desde, dias) {
    const turnos = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.findMany({
        where: {
            inicio: rangoDias(desde, dias),
            estado: {
                notIn: [
                    "CANCELADO",
                    "AUSENTE"
                ]
            },
            NOT: {
                estado: "ESPERANDO_PAGO",
                venceEn: {
                    lte: new Date()
                }
            }
        },
        select: {
            inicio: true
        }
    });
    const conteo = new Map();
    for(let i = 0; i < dias; i++)conteo.set((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sumarDias"])(desde, i), 0);
    for (const t of turnos){
        const dia = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fechaLocal"])(t.inicio);
        conteo.set(dia, (conteo.get(dia) ?? 0) + 1);
    }
    return conteo;
}
function obtenerTurno(id) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.findUnique({
        where: {
            id
        },
        include: {
            servicio: true,
            cliente: true,
            pagos: {
                orderBy: {
                    creadoEn: "desc"
                },
                take: 1
            }
        }
    });
}
async function cambiarEstadoTurno(id, estado) {
    const turno = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.findUniqueOrThrow({
        where: {
            id
        },
        include: {
            movimientos: {
                select: {
                    id: true
                }
            }
        }
    });
    if (estado === "COMPLETADO" && turno.cristalId && turno.movimientos.length === 0) {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$inventario$2f$cristal$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registrarMovimiento"])({
            cristalId: turno.cristalId,
            tipo: "EGRESO",
            cantidad: 1,
            motivo: "Colocación (turno completado)",
            turnoId: turno.id
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.update({
        where: {
            id
        },
        data: {
            estado
        }
    });
}
function asignarCristal(turnoId, cristalId) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.update({
        where: {
            id: turnoId
        },
        data: {
            cristalId
        }
    });
}
function cristalesDisponibles() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].cristal.findMany({
        where: {
            activo: true,
            cantidad: {
                gt: 0
            }
        },
        select: {
            id: true,
            codigo: true,
            descripcion: true,
            cantidad: true
        },
        orderBy: {
            descripcion: "asc"
        }
    });
}
class TurnoNoEditableError extends Error {
    constructor(){
        super("Este turno ya no se puede editar");
        this.name = "TurnoNoEditableError";
    }
}
function obtenerTurnoParaEditar(id) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].turno.findUnique({
        where: {
            id
        },
        include: {
            servicio: true,
            cliente: true,
            cristal: {
                select: {
                    id: true,
                    codigo: true,
                    descripcion: true
                }
            },
            pagos: {
                where: {
                    estado: "APROBADO"
                },
                select: {
                    monto: true
                }
            }
        }
    });
}
async function editarTurno(id, input) {
    const r = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["editarTurnoSchema"].parse(input);
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].$transaction(async (tx)=>{
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${r.servicioId}))`;
        const actual = await tx.turno.findUniqueOrThrow({
            where: {
                id
            },
            include: {
                cliente: true
            }
        });
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$edicion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["puedeEditar"])(actual.estado)) throw new TurnoNoEditableError();
        let { inicio, fin } = actual;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$edicion$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cambiaAgenda"])(actual, r)) {
            const libres = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["disponibilidadDelDia"])(tx, r.servicioId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tiempo$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fechaLocal"])(r.inicio), id);
            const elegido = libres.find((t)=>t.inicio.getTime() === r.inicio.getTime());
            if (!elegido) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$turnos$2f$servicio$2e$service$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TurnoNoDisponibleError"]();
            ({ inicio, fin } = elegido);
        }
        let clienteId = actual.clienteId;
        if (r.cliente.telefono !== actual.cliente.telefono) {
            const existente = await tx.cliente.findFirst({
                where: {
                    telefono: r.cliente.telefono
                }
            });
            // Si el teléfono ya es de otra persona, se la deja como está: no se le pisa el nombre.
            clienteId = (existente ?? await tx.cliente.create({
                data: r.cliente
            })).id;
        } else {
            await tx.cliente.update({
                where: {
                    id: actual.clienteId
                },
                data: {
                    nombre: r.cliente.nombre,
                    email: r.cliente.email ?? null
                }
            });
        }
        return tx.turno.update({
            where: {
                id
            },
            data: {
                servicioId: r.servicioId,
                clienteId,
                inicio,
                fin,
                vehiculo: r.vehiculo ?? null,
                patente: r.patente ?? null,
                cristalId: r.cristalId ?? null,
                precio: r.precio ?? null,
                notas: r.notas ?? null
            }
        });
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0-ymz3x._.js.map