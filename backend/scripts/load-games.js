#!/usr/bin/env node

const http = require("node:http");
const https = require("node:https");

function parseInteger(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parseArgs(argv) {
  const args = {
    baseUrl: process.env.API_URL || "http://localhost:3001",
    count: parseInteger(process.env.COUNT, 10),
    delayMs: parseInteger(process.env.DELAY_MS, 0),
    dryRun: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    const [flag, inlineValue] = current.split("=");
    const nextValue = inlineValue ?? argv[index + 1];

    if (flag === "--base-url" && nextValue) {
      args.baseUrl = nextValue;
      if (inlineValue === undefined) {
        index += 1;
      }
      continue;
    }

    if (flag === "--count" && nextValue) {
      args.count = parseInteger(nextValue, args.count);
      if (inlineValue === undefined) {
        index += 1;
      }
      continue;
    }

    if (flag === "--delay-ms" && nextValue) {
      args.delayMs = parseInteger(nextValue, args.delayMs);
      if (inlineValue === undefined) {
        index += 1;
      }
      continue;
    }
  }

  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildGamePayload(index) {
  const titles = [
    "Aurora Circuit",
    "Iron Harbor",
    "Neon Rift",
    "Pixel Frontier",
    "Shadow Sprint",
    "Echo Realm",
    "Atlas Reborn",
    "Quantum Drift",
  ];

  const genres = ["Action", "Adventure", "RPG", "Strategy", "Simulation", "Sports"];

  const titleBase = titles[index % titles.length];
  const genre = genres[index % genres.length];
  const releaseYear = 2012 + (index % 14);
  const price = 49 + ((index * 7) % 180);
  const suffix = String(index + 1).padStart(3, "0");

  return {
    title: `${titleBase} ${suffix}`,
    genre,
    releaseYear,
    price,
    coverImage: `https://placehold.co/600x800?text=${encodeURIComponent(slugify(titleBase))}`,
  };
}

function requestJson(baseUrl, method, path, body) {
  const url = new URL(path, baseUrl);
  const client = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const request = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method,
        headers: {
          "content-type": "application/json",
        },
      },
      (response) => {
        let rawBody = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          rawBody += chunk;
        });

        response.on("end", () => {
          let parsedBody = rawBody;

          if (rawBody) {
            try {
              parsedBody = JSON.parse(rawBody);
            } catch {
              parsedBody = rawBody;
            }
          }

          resolve({
            statusCode: response.statusCode || 0,
            body: parsedBody,
          });
        });
      }
    );

    request.on("error", reject);

    if (body) {
      request.write(JSON.stringify(body));
    }

    request.end();
  });
}

async function run() {
  const options = parseArgs(process.argv);

  if (options.dryRun) {
    console.log(`Dry run para ${options.count} jogos em ${options.baseUrl}`);
    for (let index = 0; index < options.count; index += 1) {
      console.log(JSON.stringify(buildGamePayload(index), null, 2));
    }
    return;
  }

  console.log(`Enviando ${options.count} jogos para ${options.baseUrl}/api/games`);

  for (let index = 0; index < options.count; index += 1) {
    const payload = buildGamePayload(index);
    const response = await requestJson(options.baseUrl, "POST", "/api/games", payload);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(
        `Falha ao criar jogo ${index + 1}: HTTP ${response.statusCode} - ${JSON.stringify(response.body)}`
      );
    }

    console.log(`[${index + 1}/${options.count}] ${payload.title} -> ${response.statusCode}`);

    if (options.delayMs > 0 && index < options.count - 1) {
      await sleep(options.delayMs);
    }
  }

  console.log("Carga de games concluída com sucesso.");
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});