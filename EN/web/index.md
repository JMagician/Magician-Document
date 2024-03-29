# Magician Document

## Magician

### Running environment

JDK8+

### Importing dependencies

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician</artifactId>
    <version>2.0.7</version>
</dependency>

<!-- This is the logging package, you must have it or the console won't see anything, any logging package that can bridge with slf4j is supported -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.12</version>
</dependency>
```

### Creating a Handler (HTTP service)

```java
@HttpHandler(path="/demo")
public class DemoHandler implements HttpBaseHandler {

    @Override
    public void request(MagicianRequest request, MagicianResponse response) {
        // response data
        request.getResponse()
                .sendJson(200, "{'status':'ok'}");
    }
}
```

### Receiving parameters

```java
// Get a parameter by its name
request.getParam("param name");

// Get multiple parameters with the same name
request.getParams("param name");

// Get file by parameter name
request.getFile("param name");

// Get multiple files with the same parameter name
request.getFiles("param name");

// Get all the files transferred in this request, key is Parameter name
request.getFileMap();

// If this request is a json pass, you can use this method to get the json string
request.getJsonParam();

// Get request headers by name
request.getRequestHeader("header name");

// Get all request headers
request.getRequestHeaders();
```

### Response Data

```java
// response text data
request.getResponse().sendText("");

// response html data
request.getResponse().sendHtml("");

// Respond with custom formatted data You need to set the content-type yourself
request.getResponse().sendData("");

// response json data
request.getResponse().sendJson("");

// response binary
request.getResponse().sendStream("");

// Respond to error prompts, format {"code":500, "msg":""}
request.getResponse().sendErrorMsg(500, "");
```

### Create WebSocketHandler (WebSocket service)

```java
@WebSocketHandler(path = "/websocket")
public class DemoSocketHandler implements WebSocketBaseHandler {
   
    /**
     * This method is triggered when a connection comes in
     */
    @Override
    public void onOpen(WebSocketSession webSocketSession) {
        // Sending messages to clients
        webSocketSession.sendString("send message");
    }
    
    /**
     * This method is triggered when the connection is broken
     */
    @Override
    public void onClose(WebSocketSession webSocketSession) {
        
    }

    /**
     * This method is triggered when a message is sent from the client
     * The second parameter `message` is the message sent by the client
     */
    @Override
    public void onMessage(WebSocketSession webSocketSession, byte[] message) {
        System.out.println("Received:" + new String(message));

        // Sending messages to clients
        webSocketSession.sendString("send message");
    }
}
```

### Launching services

Both the HTTP service and the WebSocket service are started like this

Basic start-up method
```java
Magician.createHttp()
        .scan("com.test")// Scanning range (package name)
        .bind(8080); // Listening port number
```

Custom Configured Startup Methods
```java
// This configuration can be extracted out and does not need to be put together with the following startup code
MagicianConfig magicianConfig = new MagicianConfig();
magicianConfig.setNumberOfPorts(3); // Number of ports allowed to listen at the same time, default 1
magicianConfig.setBossThreads(1); // Number of boss threads for netty Default 1
magicianConfig.setWorkThreads(3); // Number of work threads for netty Default 1
magicianConfig.setNettyLogLevel(LogLevel.DEBUG); // netty的日志打印级别
magicianConfig.setMaxInitialLineLength(4096); // http decoder construction parameter 1, default 4096 same as netty
magicianConfig.setMaxHeaderSize(8192); // http decoder construction parameter 2, default 8192 same as netty
magicianConfig.setMaxChunkSize(8192); // http decoder construction parameter 3, default 8192 same as netty


HttpServer httpServer = Magician.createHttp()
        .scan("com.test")// Scanning range (package name)
        .setConfig(magicianConfig); // set configuration

httpServer.bind(8080); // Listening port number

// If you want to listen to multiple ports
httpServer.bind(8081); 
httpServer.bind(8082); 
```

## Magician-Route

### Importing dependencies

Add this dependency to the foundation of the Magician project

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Route</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Creating a core Handler

Only one HttpHandler is allowed, this Handler acts as a distributor and distributes the request to the Route

```java
@HttpHandler(path="/")
public class DemoHandler implements HttpBaseHandler {

    @Override
    public void request(MagicianRequest magicianRequest, MagicianResponse response) {
       try{
            // The main thing is this sentence
            MagicianRoute.request(magicianRequest);
        } catch (Exception e){
        }
    }
}
```

### Modify scan range

- The scan scope needs to include the [handler, route, interceptor package name].
- More than one can be comma-separated, or can be configured as their parent package name

```java
Magician.createHttp()
    .scan("handler, route, interceptor package name")
    .bind(8080);
```

### Create routes

- Such a class can create more than one, according to your needs to put the route into different classes
- inside each route, if there is no special need, you can not add try-catch, by the framework internal processing, once the exception occurs, will be the exception information in the form of json response to the client
- directly return the object to be responded to, the framework will automatically convert to json and return to the client, you can also use the following example of "Magician's native response" to return data to the client, see the Magician documentation in the <Response Data> for details

```java
@Route
public class DemoRoute implements MagicianInitRoute {


    @Override
    public void initRoute(MagicianRouteCreate routeCreate) {

        routeCreate.get("/demo/getForm", request -> {
            return "{\"msg\":\"hello login\"}";
        });

        // Magician's native response
        routeCreate.get("/demo/getForm2", request -> {
            request.getResponse().sendJson("{\"msg\":\"hello login\"}");
            return null;
        });

        routeCreate.post("/demo/json", request -> {

            DemoResponseVo demoResponseVo = new DemoResponseVo();
            demoResponseVo.setName("Beerus");

            return demoResponseVo;
        });
    }

}
```

### Traditional method of receiving parameters

Here is just a brief list, for details see the above heading "Receiving Parameters

```java
// Get a parameter by its name
request.getParam("param name");

// Get file by parameter name
request.getFile("param name");

// Get request headers by name
request.getRequestHeader("header name");

// If this request is a json pass, you can use this method to get the json string
request.getJsonParam();
```

### Entity reception parameters

```java
public class ParamVO {

    // ----- The name of the field should match the name of the request parameter; if it is a json, the entity class should be consistent with the structure of the json -----

    // General parameters
    private Integer id;
    private String name;
    private String[] ids

    // File parameters
    private MixedFileUpload mixedFileUpload;
    private MixedFileUpload[] mixedFileUploads;

    // ----- Need to get, set, not written here to save space -----
}
```

### Automatic parameter verification

Just add a comment to the field

```java
// Cannot be empty and between 10 and 100 in size
@Verification(notNull = true, max = "100", min = "10", msg = "The id cannot be empty and must be between 10 and 100 in size")
private Integer id;

// Regular Expressions Validation
@Verification(reg = "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$",msg = "Password cannot be empty and must be a 6-12 digit alpha combination")
private String password;
```

#### Explanation of properties

- notNull: if or not null, set to true to indicate not null, not valid for basic types (not valid for types that cannot be assigned as null).
- max: maximum value, only valid for int, double, float, BigDecimal.
- min: minimum value, only valid for int, double, float, BigDecimal.
- msg: if the check does not pass, return the prompt text on the front end
- reg: regular expression, only valid for string types

### Converting parameters to entity objects

If you want the entity class to receive parameters smoothly and for parameter validation to take effect, then you must do the following steps.
This method uses reflection internally, if you can't accept the performance of reflection then you can not apply this method, the choice is yours

- Convert only

```java
routeCreate.get("/demo/getForm", request -> {

    DemoVO demoVO = ConversionUtil.conversion(request, DemoVO.class);

    return "{\"msg\":\"hello login\"}";
});
```

- Conversion + Parameter Verification

If the verification fails, the conversionAndVerification method will throw an exception, which will be automatically responded to the client and does not need to be handled by the developer

```java
routeCreate.get("/demo/getForm", request -> {

    DemoVO demoVO = ConversionUtil.conversionAndVerification(request, DemoVO.class);

    return "{\"msg\":\"hello login\"}";
});
```

If you want to get the checksum failure message and handle it yourself, you can use this method

```java
routeCreate.get("/demo/getForm", request -> {

    try {
        DemoVO demoVO = ConversionUtil.conversionAndVerification(request, DemoVO.class);
    } catch(VerificationException e){
        // This is the message of verification failure
        String msg = e.getMessage();
    }
    
    return "{\"msg\":\"hello login\"}";
});
```

### Creating interceptors

As with routing, you can create as many of these classes as you need, putting the interceptors into different classes

- The first parameter is the interceptor rule, configure it to * if you want to intercept all routes, otherwise it must start with /.

- If the interceptor passes, it simply returns SUCCESS, if not, it returns an error message (the returned object will be converted to json).

```java
@Interceptor
public class DemoInter implements MagicianInitInterceptor {

    @Override
    public void initInterceptor(MagicianInterceptorCreate interceptorCreate) {

        interceptorCreate.addInterceptor("/demo/*", new MagicianInterceptor() {
            @Override
            public Object before(MagicianRequest magicianRequest) {
                System.out.println("Accessed the interceptor");
                return SUCCESS;
            }

            @Override
            public Object after(MagicianRequest magicianRequest, Object o) {
                return SUCCESS;
            }
        });

        interceptorCreate.addInterceptor("/*/form", new MagicianInterceptor() {
            @Override
            public Object before(MagicianRequest magicianRequest) {
                System.out.println("Accessed the interceptor2");
                return SUCCESS;
            }

            @Override
            public Object after(MagicianRequest magicianRequest, Object o) {
                return SUCCESS;
            }
        });
    }

}
```

### JWT Management

Creating a jwt managed object is a new object each time it is created, so a static tool class needs to be written to manage it

```java
JwtManager jwtManager = JwtManager
            .builder()
            .setSecret("Secret Key")
            .setCalendarField(Calendar.MILLISECOND) // Expiration time unit, default: milliseconds
            .setCalendarInterval(86400);// Expiration time, default 86400
```

Creating a token

```java
Demo demo = new Demo();
demo.setXXX(xxx);

String token = jwtManager.createToken(demo);
```

Restore token

```java
Demo demo = jwtManager.getObject(token, Demo.class);
```

## Magician-Containers

### Importing dependencies

```xml
<dependency>
    <groupId>com.magician.containers</groupId>
    <artifactId>Magician-Containers</artifactId>
    <version>1.0.1</version>
</dependency>
```

### Tagging beans

Just put an annotation on the class (Cannot be used on controllers), not all classes need to be turned into a bean, the developer is free to decide.

We recommend: make it a bean only when you need to use AOP or timed tasks in the class.

```java
@MagicianBean
public class DemoBean {

}
```

### AOP

Writing the logic for AOP

```java
public class DemoAop implements BaseAop {

    /**
     * Before method execution
     * @param args Parameters of the method being executed
     */
    public void startMethod(Object[] args) {
        
    }
    
    /**
     * After method execution
     * @param args Parameters of the method being executed
     * @param result Return data of the executed method
     */
    public void endMethod(Object[] args, Object result) {

    }
    
    /**
     * Method execution exception
     * @param e Exception information for the executed method
     */
    public void exp(Throwable e) {

    }
}
```

Hook the logic to the method to be listened to

```java
@MagicianBean
public class DemoBean {

    @MagicianAop(className = DemoAop.class)
    public void demoAopMethod() {

    }
}
```

### Timed tasks

```java
@MagicianBean
public class DemoBean {
    
    // loop: Rotation interval, in milliseconds
    @MagicianTimer(loop=1000)
    public void demoTimerMethod() {

    }
}
```

### Initializing the bean

```java
@MagicianBean
public class DemoBean implements InitBean {
    
    public void init(){
        // This method will be executed automatically when all the beans have been created
        // You can write the data and logic that needs to be initialized here
    }
}
```

### Get Bean Object

```java
@MagicianBean
public class DemoBeanTwo {

    private DemoBean demoBean = BeanUtil.get(DemoBean.class);
    
}
```

##  Magician-Configure

### Importing dependencies
```xml
<dependency>
    <groupId>com.magician.configure</groupId>
    <artifactId>Magician-Configure</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Loading configuration files

Currently only properties files are supported, which you can create in any directory and then load into the project using

Load from any directory on the local machine

```java
// Absolute path of the file must be used
MagicianConfigure.load("/home/xxx/application.properties", ReadMode.EXTERNAL);
```

Load from the current project's resource directory

```java
// The path to the file under the class resource
MagicianConfigure.load("/application.properties", ReadMode.LOCAL);
```

Loading from a remote directory

```java
// Remote path to file, HTTP only
MagicianConfigure.load("https://www.test.com/application.properties", ReadMode.REMOTE);
```

### Get configuration data

Prefer to use the configuration file, if it is not in the configuration file, it will be automatically read from the environment variables

```java
// If there is a userName key in the configuration file then it will be used directly, if not then it will go to the environment variable to read
String userName = Environment.get("userName");
```

## More functions

- [Click here -> Jump to database operations](/db/index.md)
- [Click here -> Jump to Magician-Web](magician-web.md)

