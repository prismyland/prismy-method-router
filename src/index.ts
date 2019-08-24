import {
  prismy,
  res,
  methodSelector,
  contextSelector,
  PrismyRequestListener,
  PrismyPureMiddleware,
  Context,
  Promisable,
  ResponseObject
} from 'prismy'

export interface MethodRouterMap {
  [key: string]: PrismyRequestListener<any> | undefined
}

export interface MethodRouterOptions {
  errorHandler?: (
    method: string,
    context: Context
  ) => Promisable<ResponseObject<any>>
}

export function methodRouter(
  map: MethodRouterMap,
  middlewareList: PrismyPureMiddleware[] = [],
  options: MethodRouterOptions = {}
) {
  const allowedMethods = Object.keys(map)
    .map(v => v.toUpperCase())
    .join(', ')

  return prismy([contextSelector, methodSelector], (
    context,
    /* istanbul ignore next */
    method = ''
  ) => {
    const requestListener = map[method.toLowerCase()]

    if (requestListener == null) {
      if (options.errorHandler != null) {
        return options.errorHandler(method, context)
      }
      if (method === 'OPTIONS') {
        return res(null, 200, {
          'Access-Control-Request-Method': allowedMethods
        })
      }
      return res('Method Not Allowed', 405, {
        'Access-Control-Request-Method': allowedMethods
      })
    }

    const next = async () => requestListener.contextHandler(context)

    const pipe = middlewareList.reduce((next, middleware) => {
      return () => middleware(context)(next)
    }, next)

    return pipe()
  })
}
