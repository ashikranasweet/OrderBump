// @ts-check
import { ApiVersion, Shopify } from "@shopify/shopify-api";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import "dotenv/config";
import express from "express";
import expressAsyncHandler from "express-async-handler";
import { resolve } from "path";
import {
  deleteCallback,
  loadCallback,
  storeCallback,
} from "./controllers/session.js";
import connectDB from "./Database/connectDb.js";
import applyAuthMiddleware from "./middleware/auth.js";
import errorHandler from "./middleware/errorHandler.js";
import verifyRequest from "./middleware/verify-request.js";
import MerchantData from "./models/MerchantData.js";
import OrderBump from "./models/OrderBump.js";
import autoBumpRouter from "./routes/autoBumpRoutes.js";
import demoRoutes from "./routes/demoRoutes.js";
import fetchDataRouter from "./routes/fetchDataRoutes.js";
import manualBumpRouter from "./routes/manualBumpRoutes.js";
import orderBumpRouter from "./routes/orderBumpRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

dotenv.config();

// TODO: Connect MongoDb

connectDB();

// TODO: End MongoDb connection

export default async function returnSessionData(req, res) {
  const decode = await Shopify.Utils?.loadCurrentSession(req, res);
  return decode;
}

const USE_ONLINE_TOKENS = true;
const TOP_LEVEL_OAUTH_COOKIE = "shopify_top_level_oauth";

const PORT = parseInt(process.env.PORT || "8081", 10);
const isTest = process.env.NODE_ENV === "test" || !!process.env.VITE_TEST_BUILD;
const customSessionStorage = new Shopify.Session.CustomSessionStorage(
  storeCallback,
  loadCallback,
  deleteCallback
);
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.April22,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  SESSION_STORAGE: customSessionStorage,
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/webhooks",
  webhookHandler: async (topic, shop, body) => {
    delete ACTIVE_SHOPIFY_SHOPS[shop];
  },
});

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production"
) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.set("top-level-oauth-cookie", TOP_LEVEL_OAUTH_COOKIE);
  app.set("active-shopify-shops", ACTIVE_SHOPIFY_SHOPS);
  app.set("use-online-tokens", USE_ONLINE_TOKENS);

  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app);

  // define all routes

  // TODO: find data in multiple condition

  app.get(
    "/find",
    expressAsyncHandler(async (req, res) => {
      const autoBumpId = "626639d3b1be17efd4239965";
      const manualBumpid = "62664d88b1be17efd42399c1";
      const shop = "gears4coders.myshopify.com";
      const result = await OrderBump.findOne({
        $or: [{ autoBump: autoBumpId }, { manualBumps: manualBumpid }],
      });

      if (result) {
        const updatedMerchant = await MerchantData.findOneAndUpdate(
          { shop },
          {
            $inc: { usedOrders: 1 },
          },
          {
            new: true,
          }
        );

        res.send({
          result,
          merchant: updatedMerchant,
        });
      } else {
        res.json({
          message: "nothing found",
        });
      }
    })
  );

  app.use("/webhooks", webhookRoutes);
  app.use("/api/manualBump", manualBumpRouter);
  app.use("/api/autoBump", autoBumpRouter);
  app.use("/api/orderBump", orderBumpRouter);

  // New Route

  app.use("/api/v1/", fetchDataRouter);

  // end my route

  app.post("/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`);
      res.status(500).send(error.message);
    }
  });

  app.get("/products-count", verifyRequest(app), async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(req, res, true);
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.post("/graphql", verifyRequest(app), async (req, res) => {
    try {
      const response = await Shopify.Utils.graphqlProxy(req, res);
      res.status(200).send(response.body);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.use(express.json());

  app.use((req, res, next) => {
    const shop = req.query.shop;
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${shop} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  app.use("/*", (req, res, next) => {
    const shop = req.query.shop;

    // Detect whether we need to reinstall the app, any request from Shopify will
    // include a shop in the query parameters.
    if (app.get("active-shopify-shops")[shop] === undefined && shop) {
      res.redirect(`/auth?shop=${shop}`);
    } else {
      next();
    }
  });

  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;
  if (!isProd) {
    vite = await import("vite").then(({ createServer }) =>
      createServer({
        root,
        logLevel: isTest ? "error" : "info",
        server: {
          port: PORT,
          hmr: {
            protocol: "ws",
            host: "localhost",
            port: 64999,
            clientPort: 64999,
          },
          middlewareMode: "html",
        },
      })
    );
    app.use(vite.middlewares);
  } else {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    const fs = await import("fs");
    app.use(compression());
    app.use(serveStatic(resolve("dist/client")));
    app.use("/*", (req, res, next) => {
      // Client-side routing will pick up on the correct route to render, so we always render the index here
      res
        .status(200)
        .set("Content-Type", "text/html")
        .send(fs.readFileSync(`${process.cwd()}/dist/client/index.html`));
    });
  }

  app.use(errorHandler);

  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(PORT, () => console.log(`Server Connected to port ${PORT}`))
  );
}
