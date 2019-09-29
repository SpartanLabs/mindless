[![Build Status](https://travis-ci.org/SpartanLabs/mindless.svg?branch=master)](https://travis-ci.org/SpartanLabs/mindless)
[![npm version](https://badge.fury.io/js/mindless.svg)](https://badge.fury.io/js/mindless)
[![Coverage Status](https://coveralls.io/repos/github/SpartanLabs/mindless/badge.svg?branch=master)](https://coveralls.io/github/SpartanLabs/mindless?branch=master)

# Mindless
A fast light weight routing library.

### A Library for creating APIs with TypeScript.
Mindless allows developers to write controller-styled apis using TypeScript. Using the lightweight routing mechanism, developers can use routes to point to controllers based on path. Mindless also enables parameter injection and general dependency injection in controllers.

## Router
The mindless router is extremely lightweight and flexible.

#### Defining your routes
The simplest way to write your routes is to create a `MindlessRoute` array. Here The `AuthController` and `UserController` should both extend the `Controller` class. While the `AuthMiddleware` should extend the `Middleware` class.
```ts
/**
 * MindlessRoute is equivalent to
 * Route<Middleware, Controller> where
 * Middleware and Controller are the 
 * Framework's base classes for middlewares and controllers.
 */
const routes: MindlessRoute[] = [
  {
    url: new RouteUrl('/login'),
    method: HttpMethods.POST,
    controller: AuthController,
    middleware: [],
    function: "login"
  },
  {
    url: new RouteUrl('/user'),
    method: HttpMethods.GET,
    controller: UserController,
    middleware: [],
    function: "getAll"
  },
  {
    url: new RouteUrl('/user'),
    method: HttpMethods.POST,
    controller: UserController,
    middleware: [AuthMiddleware],
    function: "create"
  }
];
```

#### Extending Your Routes

The Route object is exteremly flexible, for example say we want to add functionality to gate routes based on permissions. Then we can simply add a `permissions` property to our `Route` object. The permissions array along with the function name and any other elements on the route will be accessible on the request: 
`Request.RouteMetaData.permissions`
`Request.RouteMetaData.function`
`etc`

<i>Note: the controller and middleware objects will not be avialble in RouteMetaData.</i>
```ts
interface ProtectedRoute<M extends Middleware, C extends Controller> extends Route<M, C> {
    permissions?: string[]
}

const routes: ProtectedRoute[] = [
  {
    url: new RouteUrl('/user'),
    method: HttpMethods.GET,
    controller: UserController,
    middleware: [],
    permissions: ["Assistant"],
    function: "getAll"
  },
  {
    url: new RouteUrl('/user'),
    method: HttpMethods.POST,
    controller: UserController,
    middleware: [AuthMiddleware],
    permissions: ["Admin"],
    function: "create"
  }
];
```

#### Registering Your Routes
Routes can be registered by creating a new instance of a `Router` object:
```ts
const router = new Router<Middleware, Controller, MindlessRoute>(routes);
```

You will use this router when creating a new app instance.

## Requests
Mindless provides a `Request` class that aides with things such as getting request data (path parameters, querystring parameters, body data, and headers) and holding other event information. In order to create a request object, a `RequestEvent` object with request data must be created or generated.
If you are using node's built in web server you would simply map the [Incoming Message](https://nodejs.org/api/http.html#http_class_http_incomingmessage) to Mindless's `RequestEvent`. You will then pass the event to the `handleRequest` method on your mindless app instance.


The `Request` object can then be injected and used in a controller functions:
```ts
public async getUser(request: Request): Promise<Response> {

      let username = request.body.username;

      return Response(200);
}
```

See the [Request API Docs](https://spartanlabs.github.io/mindless/classes/request.html) for more information.

We can also inject queryStringParameters and pathParameters directly into our controller methods.
Say we have `userId` passed in as a path parameters, we can then inject the `userId` into our controller methods.
```ts
public async getUser(userId: string): Promise<Response> {
      return Response(200);
}
```

## Responses
Mindless provides a `Response` class that can be returned from controller functions. This object contains `statusCode`, `body`, and `headers` properties. Here's an example of creating a new `Response` object from a controller function:
```ts
public async test(): Promise<Response> {
    return new Response(200, {test: "This is the body"}, {'x-test-header': "This is a test header"});
}
```

## The App

```ts
const routes: MindlessRoute = [....]
const container = // create a new DI container instance, we recommend InversifyJs

const app = new App(container, routes)

// now we can route our request events

app.handleRequest(event)
```
If using node's internal server you will need to call `app.handleRequest` for every IncomingMessage (after mapping to a request event).
