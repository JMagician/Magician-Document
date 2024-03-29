# Magician-Web

## Initial configuration

### Importing dependencies

Add this dependency to the foundation of the Magician project

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Web</artifactId>
    <version>2.0.3</version>
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
            MagicianWeb.request(magicianRequest);
        } catch (Exception e){
        }
    }
}
```

## Controller, interceptors and other functions

### Creating a Controller

```java
@Route("/demoController")
public class DemoController {

	// Parameters can be received using entity classes and any request method is supported
	@Route(value = "/demo", requestMethod = ReqMethod.POST)
	public DemoVO demo(DemoVO demoVO){
		return demoVO;
	}

	// Parameters can also be received in the traditional way, by calling the method inside the `request` to get the parameters
    // For the reception method here, scroll up and look at the heading 'Reception Parameters'
    // This approach can be mixed with the above mentioned entity class receiving parameters
	@Route(value = "/demob", requestMethod = ReqMethod.POST)
	public String demob(MagicianRequest request){
        request.getParam("name");
		return "ok";
	}

	// To download a file, simply return the ResponseInputStream
	@Route(value = "/demob", requestMethod = ReqMethod.POST)
	public ResponseInputStream demob(){
		ResponseInputStream responseInputStream = new ResponseInputStream();
		responseInputStream.setName("file name");
		responseInputStream.setBytes(file bytes);
		return responseInputStream;
	}
}
```

### Modify scan range

- The scan scope needs to include the [handler, controller, interceptor package name].
- More than one can be comma-separated, or can be configured as their parent package name

```java
Magician.createHttp()
    .scan("handler, controller, interceptor package name")
    .bind(8080);
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

### Creating Interceptors

Create a class that implements the MagicianInterceptor interface

- Add the @Interceptor(pattern = "*") annotation to the class
- The pattern attribute is the interceptor's rule, if you want to intercept all routes, configure it as *, otherwise it must start with /.
- If the interceptor passes, simply return SUCCESS, if not, return an error message (the returned object will be converted to json).

```java
@Interceptor(pattern = "/demoController/*")
public class DemoInter implements MagicianInterceptor {

    /**
     * Before routing execution
     * @param magicianRequest
     * @return
     */
    @Override
    public Object before(MagicianRequest magicianRequest) {
        System.out.println(magicianRequest);
        return SUCCESS;
    }

    /**
     * After routing execution
     * @param magicianRequest
     * @param o Data returned by routing
     * @return
     */
    @Override
    public Object after(MagicianRequest magicianRequest, Object o) {
        System.out.println(o);
        return SUCCESS;
    }
}
```

### JWT Management

Creating a jwt managed object is a new object each time it is created, so a static tool class needs to be written to manage it

```java
JwtManager jwtManager = JwtManager
            .builder()
            .setSecret("秘钥")
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