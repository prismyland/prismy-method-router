import test from 'ava'
import got from 'got'
import { prismy, res, PrismyPureMiddleware, updateHeaders } from 'prismy'
import { testHandler } from 'prismy-test'
import { methodRouter } from '../src'

test('methodRouter routes', async t => {
  const handler = methodRouter({
    get: prismy([], () => res('GET')),
    post: prismy([], () => res('POST')),
    patch: prismy([], () => res('PATCH')),
    delete: prismy([], () => res('DELETE'))
  })

  await testHandler(handler, async url => {
    const getResponse = await got.get(url)
    t.is(getResponse.body, 'GET')

    const postResponse = await got.post(url)
    t.is(postResponse.body, 'POST')

    const patchResponse = await got.patch(url)
    t.is(patchResponse.body, 'PATCH')

    const deleteResponse = await got.delete(url)
    t.is(deleteResponse.body, 'DELETE')
  })
})

test('methodRouter handles unintended method', async t => {
  /* istanbul ignore next */
  const handler = methodRouter({
    get: prismy([], () => res('GET'))
  })

  await testHandler(handler, async url => {
    const postResponse = await got.post(url, {
      throwHttpErrors: false
    })
    t.is(postResponse.body, 'Method Not Allowed')
    t.is(postResponse.headers['access-control-request-method'], 'GET')
    t.is(postResponse.statusCode, 405)
  })
})

test('methodRouter handles options method if it is not defined or having an error handler', async t => {
  /* istanbul ignore next */
  const handler = methodRouter({
    get: prismy([], () => res('GET'))
  })

  await testHandler(handler, async url => {
    const postResponse = await got(url, {
      method: 'OPTIONS',
      throwHttpErrors: false
    })
    t.is(postResponse.body, '')
    t.is(postResponse.headers['access-control-request-method'], 'GET')
    t.is(postResponse.statusCode, 200)
  })
})

test('methodRouter uses custom error handler when method is not available', async t => {
  /* istanbul ignore next */
  const handler = methodRouter(
    {
      get: prismy([], () => res('GET'))
    },
    [],
    {
      errorHandler: method => {
        return res(`${method} method is not allowed`, 405)
      }
    }
  )

  await testHandler(handler, async url => {
    const postResponse = await got.post(url, {
      throwHttpErrors: false
    })
    t.is(postResponse.body, 'POST method is not allowed')
    t.is(postResponse.statusCode, 405)
  })
})

test('methodRouter applies middleware', async t => {
  const withCustomHeader: PrismyPureMiddleware = () => async next => {
    const resObject = await next()
    return updateHeaders(resObject, {
      'x-test': 'Hello, World!'
    })
  }
  const handler = methodRouter(
    {
      get: prismy([], () => res('GET'))
    },
    [withCustomHeader]
  )

  await testHandler(handler, async url => {
    const getResponse = await got.get(url)
    t.is(getResponse.body, 'GET')
    t.is(getResponse.headers['x-test'], 'Hello, World!')
  })
})
