import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { firmaValida } from "./firma";

const SECRETO = "secreto-de-prueba";
const firmar = (dataId: string, requestId: string, ts: string, secreto = SECRETO) =>
  createHmac("sha256", secreto).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest("hex");
const cabecera = (ts: string, v1: string) => `ts=${ts},v1=${v1}`;

describe("firmaValida", () => {
  it("acepta una firma correcta", () => {
    const v1 = firmar("123456", "req-1", "1700000000");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "123456", secreto: SECRETO })).toBe(true);
  });

  it("normaliza el id a minúsculas antes de firmar", () => {
    const v1 = firmar("abc123", "req-1", "1700000000");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "ABC123", secreto: SECRETO })).toBe(true);
  });

  it("rechaza si cambió el id del pago", () => {
    const v1 = firmar("123456", "req-1", "1700000000");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "999999", secreto: SECRETO })).toBe(false);
  });

  it("rechaza una firma hecha con otro secreto", () => {
    const v1 = firmar("123456", "req-1", "1700000000", "otro-secreto");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "123456", secreto: SECRETO })).toBe(false);
  });

  it("rechaza si falta la cabecera o está mal formada", () => {
    const base = { xRequestId: "req-1", dataId: "123456", secreto: SECRETO };
    expect(firmaValida({ ...base, xSignature: null })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "" })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "v1=abc" })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "ts=1700000000" })).toBe(false);
    expect(firmaValida({ ...base, xSignature: "basura" })).toBe(false);
  });

  it("rechaza una firma que no es hexadecimal o tiene otro largo, sin lanzar", () => {
    const base = { xRequestId: "req-1", dataId: "123456", secreto: SECRETO };
    expect(firmaValida({ ...base, xSignature: cabecera("1700000000", "zz") })).toBe(false);
    expect(firmaValida({ ...base, xSignature: cabecera("1700000000", "ab") })).toBe(false);
  });

  it("rechaza si no hay secreto configurado", () => {
    const v1 = firmar("123456", "req-1", "1700000000", "");
    expect(firmaValida({ xSignature: cabecera("1700000000", v1), xRequestId: "req-1", dataId: "123456", secreto: "" })).toBe(false);
  });
});
