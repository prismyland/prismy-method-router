# `prismy-method-router`

:vertical-traffic-light: Method router for Primsy

[![Build Status](https://travis-ci.com/prismyland/prismy-method-router.svg?branch=master)](https://travis-ci.com/prismyland/prismy-method-router)
[![codecov](https://codecov.io/gh/prismyland/prismy-method-router/branch/master/graph/badge.svg)](https://codecov.io/gh/prismyland/prismy-method-router)
[![NPM download](https://img.shields.io/npm/dm/prismy-method-router.svg)](https://www.npmjs.com/package/prismy-method-router)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/prismyland/prismy-method-router.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/prismyland/prismy-method-router/context:javascript)

```
npm i prismy-method-router
```

## Example

```ts
import {
  prismy,
  createUrlEncodedBodySelector,
  res
} from 'prismy'
import {
  methodRouter
} from 'prismy-method-router'

const urlEncodedBodySelector = createUrlEncodedBodySelector()

export default methodRouter({
  get: prismy([], () => {
    return res(
      [
        '<!DOCTYPE html>',
        '<body>',
        '<form action="/" method="post">',
        '<input name="message">',
        '<button type="submit">Send</button>',
        '</form>',
        '</body>'
      ].join('')
    )
  }),
  post: prismy([urlEncodedBodySelector], body => {
    return res(body)
  })
})
```
