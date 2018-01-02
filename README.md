[![Build Status](https://travis-ci.org/SpartanLabs/mindless.svg?branch=master)](https://travis-ci.org/SpartanLabs/mindless)
[![npm version](https://badge.fury.io/js/mindless.svg)](https://badge.fury.io/js/mindless)

# mindless
### A Library for creating APIs with TypeScript. 

Mindless allows developers to write typical controller-styled apis with models using TypeScript. An great use of the mindless framework is with applications built using the [serverless framework](https://serverless.com/). In a typical serverless application, each route goes to its own function. Using mindless allows the developer to flip the script on this paradigm. Using the lightweight routing mechanism, developers can use routes to point to controllers based on path. Mindless also enables parameter injection and general dependency injection in controllers. Mindless will also have extensions such as permissions and data access that will further empower developers.

### [Sample App](https://github.com/SpartanLabs/mindless-aws-lambda-sample-app)
A sample application is provided in the repository. This sample gives you an example of how to use the mindless framework to create a typescript api using AWS Lambda. 

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
If you want to extend the base controller and base middleware classes you may use the `Route<M extends Middleware, C extends Controller>` generic

#### Extending Your Routes

The Route object is exteremly flexible, for example say we want to add functionality to gate routes based on permissions. Then we can simply add a `permissions` property to our `Route` object. The permissions array along with the function name and any other elements on the route will be accessible on the request: 
`Request.RouteMetaData.permissions`
`Request.RouteMetaData.function`
`etc`

<i>Note: the controller and middleware elements will not be avialble in RouteMetaData. Why? Because if you need them your using this wrong.</i>
```ts
interface PermissionRoute<M extends Middleware, C extends Controller> extends Route<M, C> {
    permissions?: string[]
}

const routes: PermissionRoute[] = [
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
let router = new Router<Middleware, Controller, MindlessRoute>(request, container);
router.route(routes);
```
Where `request` is a mindless framework `Request` object and `container` is an `inversify` container. 

## Requests
Mindless provides a `Request` class that aides with things such as getting request data (path parameters, querystring parameters, body data, and headers) and holding other event information. In order to create a request object, an `Event` object with request data must be created or generated. The current `Event` object is modeled after what AWS Lambda attaches to the first parameter of a function.

Here is an example of creating a `Request` object in an AWS Lambda handler function:
```ts
export async function start(event: Event, context: Context, callback) {

let request = new Request(event);
...
```

The `Request` object can then be injected and used in a controller functions:
```ts
public async getUser(request: Request): Promise<Response> {

      let username = request.get('username'); //Retreives from either path parameters, query parameters, and then body.

      return Response(200);
}
```

## Dispatching the Controllers
After configuring the request, routes, and the router for an application the next step is to dispatch the controller. This step is where mindless actually takes the request, finds the right controller, and executes the correct function on that controller. The response returned from the controller function can be returned from this step:
```ts
let router = new Router<Middleware, Controller, MindlessRoute>(request, container);
router.route(routes);
let res: Response = await router.dispatchController();
```

## Responses
Mindless provides a `Response` class that can be returned from controller functions. This object contains `statusCode`, `body`, and `headers` properties. Here's an example of creating a new `Response` object from a controller function:
```ts
public async test(): Promise<Response> {
    return new Response(200, {test: "This is the body"}, {testHeader: "This is a test header"});
}
```
In the future, there may be extensions for different integrations for mindless. For now, we will put service integration mappings into the `Response` class. A current example is for AWS Lambda. In your handler function, you can do the following to integrate with AWS Lambda's proxy integration:
```ts
let res: Response = await router.dispatchController();
callback(null, res.toAWSLambdaIntegrationResponse());
```
