import { Router } from "express";
import { robotsTxt, sitemapXml, urlBase } from "@/web/seo";

export const rutasSeo = Router();

rutasSeo.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(robotsTxt(urlBase()));
});

rutasSeo.get("/sitemap.xml", (_req, res) => {
  res.type("application/xml").send(sitemapXml(urlBase()));
});
