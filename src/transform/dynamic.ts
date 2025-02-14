import createDebug from 'debug'
import { pathToFileURL } from 'node:url'
import { createUnplugin } from 'unplugin'
import { parseQuery, parseURL } from 'ufo'
import MagicString from 'magic-string'
import { VIRTUAL_PREFIX_HEX } from './utils'
import { NUXT_I18N_COMPOSABLE_DEFINE_LOCALE } from '../constants'

export interface ResourceDynamicPluginOptions {
  sourcemap?: boolean
}

const debug = createDebug('@nuxtjs/i18n:transform:dynamic')

export const ResourceDynamicPlugin = createUnplugin((options: ResourceDynamicPluginOptions = {}, meta) => {
  debug('options', options, meta)

  return {
    name: 'nuxtjs:i18n-resource-proxy',
    enforce: 'post',

    transformInclude(id) {
      debug('transformInclude', id)

      if (!id || id.startsWith(VIRTUAL_PREFIX_HEX)) {
        return false
      }

      const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      return /\.([c|m]?[j|t]s)$/.test(pathname) && !!parseQuery(search).dynamic
    },

    transform(code, id) {
      debug('transform', id)

      const { pathname } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      const s = new MagicString(code)

      function result() {
        if (s.hasChanged()) {
          return {
            code: s.toString(),
            map:
              options.sourcemap && !/\.([c|m]?ts)$/.test(pathname)
                ? s.generateMap({ source: id, includeContent: true })
                : undefined
          }
        }
      }

      const match = code.match(new RegExp(`\\b${NUXT_I18N_COMPOSABLE_DEFINE_LOCALE}\\s*`))
      if (match?.[0]) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        s.remove(match.index!, match.index! + match[0].length)
      }

      return result()
    }
  }
})
