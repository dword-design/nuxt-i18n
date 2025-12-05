import { expect, test } from '@playwright/test';
import axios from 'axios';
import endent from 'endent';
import { execaCommand } from 'execa';
import getPort from 'get-port';
import nuxtDevReady from 'nuxt-dev-ready';
import outputFiles from 'output-files';
import kill from 'tree-kill-promise';

test('i18n: browser language changed', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'app/pages/index.vue': endent`
      <template>
        <div />
      </template>
    `,
    i18n: { 'de.json': JSON.stringify({}), 'en.json': JSON.stringify({}) },
    'nuxt.config.ts':
      "export default defineNuxtConfig({ modules: ['../../src'] });",
  });

  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);

    const {
      request: {
        res: { responseUrl: defaultResponseUrl },
      },
    } = await axios.get(`http://localhost:${port}`);

    expect(defaultResponseUrl).toEqual(`http://localhost:${port}/en`);

    const {
      request: {
        res: { responseUrl: deResponseUrl },
      },
    } = await axios.get(`http://localhost:${port}`, {
      headers: { 'Accept-Language': 'de' },
    });

    expect(deResponseUrl).toEqual(`http://localhost:${port}/de`);
  } finally {
    await kill(nuxt.pid!);
  }
});

test('i18n: change page, meta up-to-date', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();
  const port = await getPort();

  await outputFiles(cwd, {
    'app/pages': {
      'foo.vue': endent`
        <template>
          <div />
        </template>
      `,
      'index.vue': endent`
        <template>
          <div />
        </template>
      `,
    },
    i18n: { 'en.json': JSON.stringify({ foo: 'Hello world' }) },
    'nuxt.config.ts': `export default defineNuxtConfig({ modules: [['../../src', { baseUrl: 'http://localhost:${port}' }]] });`,
  });

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);

    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `http://localhost:${port}`,
    );

    await page.goto(`http://localhost:${port}/foo`);

    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `http://localhost:${port}/foo`,
    );
  } finally {
    await kill(nuxt.pid!);
  }
});

test('i18n: middleware', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    app: {
      'middleware/foo.ts': 'export default () => {}',
      'nuxt.config.ts':
        "export default defineNuxtConfig({ modules: ['../../src'] });",
      'pages/index.vue': endent`
        <template>
          <div class="foo">Hello world</div>
        </template>
      `,
    },
    'config.ts': endent`
      export default {
        router: {
          middleware: ['foo']
        }
      }
    `,
    i18n: {
      'de.json': JSON.stringify({}, undefined, 2),
      'en.json': JSON.stringify({}, undefined, 2),
    },
  });

  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    await expect(page.locator('.foo')).toHaveText('Hello world');
  } finally {
    await kill(nuxt.pid!);
  }
});

test('i18n: root with prefix', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'app/pages/index.vue': endent`
      <template>
        <div />
      </template>
    `,
    i18n: { 'de.json': JSON.stringify({}), 'en.json': JSON.stringify({}) },
    'nuxt.config.ts':
      "export default defineNuxtConfig({ modules: ['../../src'] });",
  });

  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}/de`);
    expect(page.url()).toEqual(`http://localhost:${port}/de`);
  } finally {
    await kill(nuxt.pid!);
  }
});

test('i18n: root without prefix', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'app/pages/index.vue': endent`
      <template>
        <div />
      </template>
    `,
    i18n: { 'de.json': JSON.stringify({}), 'en.json': JSON.stringify({}) },
    'nuxt.config.ts':
      "export default defineNuxtConfig({ modules: ['../../src'] });",
  });

  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);

    const {
      request: {
        res: { responseUrl },
      },
    } = await axios.get(`http://localhost:${port}`, {
      headers: { 'Accept-Language': 'de' },
    });

    expect(responseUrl).toEqual(`http://localhost:${port}/de`);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'de' });
  } finally {
    await kill(nuxt.pid!);
  }
});

test('i18n: route with prefix', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'app/pages/foo.vue': endent`
      <template>
        <div />
      </template>
    `,
    i18n: { 'de.json': JSON.stringify({}), 'en.json': JSON.stringify({}) },
    'nuxt.config.ts':
      "export default defineNuxtConfig({ modules: ['../../src'] });",
  });

  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);

    const {
      request: {
        res: { responseUrl },
      },
    } = await axios.get(`http://localhost:${port}/de/foo`, {
      headers: { 'Accept-Language': 'de' },
    });

    expect(responseUrl).toEqual(`http://localhost:${port}/de/foo`);
  } finally {
    await kill(nuxt.pid!);
  }
});

test('i18n: route without prefix', async ({}, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    i18n: { 'de.json': JSON.stringify({}), 'en.json': JSON.stringify({}) },
    'nuxt.config.ts':
      "export default defineNuxtConfig({ modules: ['../../src'] });",
    'pages/foo.vue': endent`
      <template>
        <div />
      </template>
    `,
  });

  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);

    const {
      request: {
        res: { responseUrl },
      },
    } = await axios.get(`http://localhost:${port}/foo`, {
      headers: { 'Accept-Language': 'de' },
    });

    expect(responseUrl).toEqual(`http://localhost:${port}/de/foo`);
  } finally {
    await kill(nuxt.pid!);
  }
});

test('i18n: single locale', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();

  await outputFiles(cwd, {
    'i18n/de.json': JSON.stringify({ foo: 'bar' }),
    'nuxt.config.ts':
      "export default defineNuxtConfig({ modules: ['../../src'] });",
    pages: {
      'bar.vue': endent`
        <template>
          <div class="bar" />
        </template>
      `,
      'index.vue': endent`
        <template>
          <nuxt-locale-link :to="{ name: 'bar' }" class="foo">{{ $t('foo') }}</nuxt-locale-link>
        </template>
      `,
    },
  });

  const port = await getPort();

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
    stderr: 'inherit',
  });

  try {
    await nuxtDevReady(port);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en' });
    await page.goto(`http://localhost:${port}`);
    await expect(page).toHaveURL(`http://localhost:${port}`);
    const link = page.locator('.foo');

    await Promise.all([
      expect(link).toHaveText('bar'),
      expect(link).toHaveAttribute('href', '/bar'),
    ]);
  } finally {
    await kill(nuxt.pid!);
  }
});

test('i18n: works', async ({ page }, testInfo) => {
  const cwd = testInfo.outputPath();
  const port = await getPort();

  await outputFiles(cwd, {
    i18n: {
      'de.json': JSON.stringify({ foo: 'Hallo Welt' }),
      'en.json': JSON.stringify({ foo: 'Hello world' }),
    },
    'nuxt.config.ts': endent`
      export default defineNuxtConfig({
        app: {
          head: {
            htmlAttrs: { style: 'background: red' },
            link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
          },
        },
        modules: [['../../src', { baseUrl: 'http://localhost:${port}' }]],
      });
    `,
    'pages/index.vue': endent`
      <template>
        <div class="foo">{{ $t('foo') }}</div>
      </template>
    `,
  });

  const nuxt = execaCommand('nuxt dev', {
    cwd,
    env: { PORT: port },
    reject: false,
  });

  try {
    await nuxtDevReady(port);
    await page.goto(`http://localhost:${port}`);
    expect(page.url()).toEqual(`http://localhost:${port}/en`);
    const foo = page.locator('.foo');
    const html = page.locator('html[lang=en]');

    await Promise.all([
      expect(foo).toBeAttached(),
      expect(html).toBeAttached(),
      expect(page.locator('link[rel=canonical]')).toHaveAttribute(
        'href',
        `http://localhost:${port}/en`,
      ),
      expect(
        page
          .locator(
            `link[rel=alternate][href="http://localhost:${port}/de"][hreflang=de]`,
          )
          .first(), // TODO: Fix duplicated link tags
      ).toBeAttached(),
      expect(
        page
          .locator(
            `link[rel=alternate][href="http://localhost:${port}/en"][hreflang=en]`,
          )
          .first(), // TODO: Fix duplicated link tags
      ).toBeAttached(),
      expect(
        page.locator(
          'link[rel=icon][type="image/x-icon"][href="/favicon.ico"]',
        ),
      ).toBeAttached(),
    ]);

    await expect(foo).toHaveText('Hello world');
    await expect(html).toHaveAttribute('style', 'background:red');
  } finally {
    await kill(nuxt.pid!);
  }
});
